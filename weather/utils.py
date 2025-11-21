import requests
from bs4 import BeautifulSoup
from datetime import datetime
import logging
import re
import base64
from io import BytesIO

# 最初にmatplotlibのバックエンドを設定（importの前に！）
import matplotlib
matplotlib.use('Agg')  # GUIを使わないバックエンド
import matplotlib.pyplot as plt

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE_URL = "https://www.data.jma.go.jp/stats/etrn/view/daily_s1.php"
TEMPERATURE_INDEX = 7
WEATHER_INDEX = 20
ARIA_CODE = 130000

def fetch_weather_data(year, month, day=None):
    print(f"Fetching weather data for {year}-{month:02d}-{day if day else 'all days'}")
    if day is not None:
        url = f"{BASE_URL}?prec_no=44&block_no=47662&year={year}&month={month}&day={day}&view=p1"
    else:
        url = f"{BASE_URL}?prec_no=44&block_no=47662&year={year}&month={month}&view=p1"
    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        table = soup.find('table', {'class': 'data2_s'})
        if table:
            rows = table.find_all('tr')[4:]
            return [[col.text.strip() for col in row.find_all('td')] for row in rows if row.find_all('td')]
    except requests.RequestException as e:
        logger.error(f"Error fetching data: {e}")
    return None

def parse_weather_data(data, year, month):
    return [
        (f"{year}-{month:02d}-{int(row[0]):02d}", row[TEMPERATURE_INDEX], row[WEATHER_INDEX])
        for row in data
        if len(row) > max(TEMPERATURE_INDEX, WEATHER_INDEX)
    ]

def get_monthly_weather_data(year, month, day=None):
    data = fetch_weather_data(year, month, day)
    if data:
        return parse_weather_data(data, year, month)
    return None

def get_similar_weather_data(year, month, weather):
    monthly_data = get_monthly_weather_data(year, month, day=None)
    if not monthly_data:
        return None
    return next((row for row in monthly_data if row[2] == weather), None)

def get_highest_temperature(year, month):
    monthly_data = get_monthly_weather_data(year, month, day=None)
    if not monthly_data:
        return None
    temps = [float(row[1]) for row in monthly_data if row[1] and row[1].replace('.', '', 1).isdigit()]
    return max(temps) if temps else None

def fetch_today_weather_forecast():
    """
    気象庁の天気予報APIから今日の天気・気温を取得
    東京 (code=130010)
    """
    url = "https://www.jma.go.jp/bosai/forecast/data/forecast/130000.json"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        # 今日の日付を取得
        today = datetime.now().date()
        
        # 最初の予報データを取得
        forecast_data = data[0]
        time_series = forecast_data["timeSeries"]
        
        # 天気・風・波のデータ（timeSeries[0]）
        weather_series = time_series[0]
        time_defines = weather_series["timeDefines"]
        
        # 今日のインデックスを探す
        today_index = None
        for i, time_str in enumerate(time_defines):
            time_date = datetime.fromisoformat(time_str.replace("+09:00", "")).date()
            if time_date == today:
                today_index = i
                break
        
        if today_index is None:
            logger.warning(f"今日の日付 {today} が見つかりませんでした")
            return {
                "weather": "取得失敗",
                "high": None,
                "low": None,
                "rain": None,
                "source_url": url
            }
        
        # 東京地方のデータを取得
        tokyo_area = None
        for area in weather_series["areas"]:
            if area["area"]["code"] == "130010":  # 東京地方
                tokyo_area = area
                break
        
        if not tokyo_area:
            logger.warning("東京地方のデータが見つかりませんでした")
            return {
                "weather": "取得失敗",
                "high": None,
                "low": None,
                "rain": None,
                "source_url": url
            }
        
        # 天気を取得
        weather = tokyo_area["weathers"][today_index]
        
        # 降水確率のデータ（timeSeries[1]）
        pop_series = time_series[1]
        pop_time_defines = pop_series["timeDefines"]
        
        # 今日の降水確率を取得（複数時間帯がある場合は最初のもの）
        rain_text = "--%"
        for area in pop_series["areas"]:
            if area["area"]["code"] == "130010":
                # 今日の日付に該当する降水確率を探す
                for i, time_str in enumerate(pop_time_defines):
                    time_date = datetime.fromisoformat(time_str.replace("+09:00", "")).date()
                    if time_date == today and i < len(area["pops"]):
                        rain_text = area["pops"][i] + "%"
                        break
                break
        
        # 気温のデータ（timeSeries[2]）
        temp_series = time_series[2]
        temp_time_defines = temp_series["timeDefines"]
        
        # 今日の気温を取得
        high_temp = None
        low_temp = None
        
        # 今日の日付のインデックスを探す
        temp_today_index = None
        for i, time_str in enumerate(temp_time_defines):
            time_date = datetime.fromisoformat(time_str.replace("+09:00", "")).date()
            if time_date == today:
                temp_today_index = i
                break
        
        if temp_today_index is not None:
            for area in temp_series["areas"]:
                if area["area"]["code"] == "44132":  # 東京
                    temps = area["temps"]
                    if temp_today_index < len(temps):
                        low_temp = temps[temp_today_index * 2] if temp_today_index * 2 < len(temps) else None
                        high_temp = temps[temp_today_index * 2 + 1] if temp_today_index * 2 + 1 < len(temps) else None
                    break
        
        result = {
            "weather": weather,
            "high": high_temp,
            "low": low_temp,
            "rain": rain_text,
            "source_url": url
        }
        
        logger.info(f"今日の天気データ: {result}")
        return result
    
    except Exception as e:
        logger.error(f"天気取得中にエラー: {e}")
        return {
            "weather": "取得失敗",
            "high": None,
            "low": None,
            "rain": None,
            "source_url": url
        }
    
def get_average_temperature(year, month):
    """
    指定された年月の平均気温を取得
    """
    monthly_data = get_monthly_weather_data(year, month, day=None)
    if not monthly_data:
        return None
    
    temps = []
    for row in monthly_data:
        temp_str = row[1]
        if temp_str and temp_str.replace('.', '', 1).replace('-', '', 1).isdigit():
            temps.append(float(temp_str))
    
    if temps:
        return sum(temps) / len(temps)  # 平均を計算
    return None


def generate_temperature_graph(current_year_temps, ten_year_temps, twenty_year_temps, thirty_year_temps, forty_year_temps):
    """
    今年・10年前・20年前・30年前・40年前の '月平均気温' を比較するグラフを生成し
    Base64 PNG として返却する
    """
    import matplotlib.font_manager as fm

    # 日本語フォントを設定（優先順位順）
    font_candidates = [
        'Noto Sans CJK JP',
        'Noto Sans JP',
        'DejaVu Sans',
        'sans-serif'
    ]

    # 利用可能なフォントを探す
    available_fonts = [f.name for f in fm.fontManager.ttflist]

    for font in font_candidates:
        if font in available_fonts or any(font.lower() in f.lower() for f in available_fonts):
            plt.rcParams['font.family'] = font
            print(f"Using font: {font}")
            break
    else:
        # フォントが見つからない場合はデフォルト
        plt.rcParams['font.family'] = 'sans-serif'
        print("Using default sans-serif font")

    plt.rcParams['axes.unicode_minus'] = False
    
    months = range(1, 13)
    fig = plt.figure(figsize=(12, 6))
    
    # データをプロット
    if current_year_temps:
        plt.plot(months, current_year_temps, marker='o', linewidth=2, label="今年", color='#FF6B6B')
    if ten_year_temps:
        plt.plot(months, ten_year_temps, marker='s', linewidth=2, label="10年前", color='#4ECDC4')
    if twenty_year_temps:
        plt.plot(months, twenty_year_temps, marker='^', linewidth=2, label="20年前", color='#45B7D1')
    if thirty_year_temps:
        plt.plot(months, thirty_year_temps, marker='D', linewidth=2, label="30年前", color='#FFA07A')
    if forty_year_temps:
        plt.plot(months, forty_year_temps, marker='v', linewidth=2, label="40年前", color='#98D8C8')

    plt.title("年度別 月平均気温の比較", fontsize=16, fontweight='bold', pad=20)
    plt.xlabel("月", fontsize=12)
    plt.ylabel("平均気温 (°C)", fontsize=12)
    plt.legend(loc='best', fontsize=11, framealpha=0.9)
    plt.grid(True, alpha=0.3, linestyle='--')
    plt.xticks(months)
    plt.tight_layout()

    buffer = BytesIO()
    plt.savefig(buffer, format='png', bbox_inches='tight', dpi=120)
    plt.close(fig)
    buffer.seek(0)

    return base64.b64encode(buffer.read()).decode('utf-8')