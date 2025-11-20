from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime, timedelta
from .utils import (
    fetch_today_weather_forecast,
    get_monthly_weather_data,
    get_similar_weather_data,
    get_highest_temperature,
    generate_temperature_graph,
)
from .utils import get_average_temperature, generate_temperature_graph

# 気象庁サイト（引用元URL）
BASE_URL = "https://www.data.jma.go.jp/stats/etrn/view/daily_s1.php"

@csrf_exempt
def get_past_weather_data(target_date):
    """
    指定日の気象庁データを取得して返す（year-month-day）
    """
    data = get_monthly_weather_data(target_date.year, target_date.month, target_date.day)

    date_str = None
    temp = None
    weather_desc = None

    if data:
        search_key = f"{target_date.year}-{target_date.month:02d}-{target_date.day:02d}"

        for entry in data:
            if entry[0] == search_key:
                date_str, temp, weather_desc = entry
                break

    return {
        "date": date_str,
        "temp": temp,
        "weather": weather_desc,
        "source": f"{BASE_URL}?prec_no=44&block_no=47662&year={target_date.year}&month={target_date.month}&day={target_date.day}&view=p1"
    }


@csrf_exempt
def weather_data(request):
    today = datetime.now()
    last_year = today - timedelta(days=365)

    # 今日の天気
    today_forecast = fetch_today_weather_forecast()

    # === 過去データ取得 ===
    last_year_info = get_past_weather_data(last_year)
    ten_years_info = get_past_weather_data(today.replace(year=today.year - 10))
    twenty_years_info = get_past_weather_data(today.replace(year=today.year - 20))
    thirty_years_info = get_past_weather_data(today.replace(year=today.year - 30))
    forty_years_info = get_past_weather_data(today.replace(year=today.year - 40))

    # 類似天気（去年基準）
    similar_weather_data = get_similar_weather_data(
        last_year.year,
        last_year.month,
        last_year_info["weather"]
    )

    # 去年の最高気温
    highest_temp = get_highest_temperature(last_year.year, last_year.month)

    return JsonResponse({
        # 今日
        "today_date": today.strftime("%Y-%m-%d"),
        "today_weather": today_forecast["weather"],
        "today_high_temp": today_forecast["high"],
        "today_low_temp": today_forecast["low"],
        "today_rain": today_forecast["rain"],
        "today_source": today_forecast["source_url"],

        # 去年
        "last_year_date": last_year_info["date"],
        "last_year_temp": last_year_info["temp"],
        "last_year_weather_desc": last_year_info["weather"],
        "last_year_source": last_year_info["source"],

        # 10年前
        "ten_years_date": ten_years_info["date"],
        "ten_years_temp": ten_years_info["temp"],
        "ten_years_weather_desc": ten_years_info["weather"],
        "ten_years_source": ten_years_info["source"],

        # 20年前
        "twenty_years_date": twenty_years_info["date"],
        "twenty_years_temp": twenty_years_info["temp"],
        "twenty_years_weather_desc": twenty_years_info["weather"],
        "twenty_years_source": twenty_years_info["source"],

        # ★ 30年前
        "thirty_years_date": thirty_years_info["date"],
        "thirty_years_temp": thirty_years_info["temp"],
        "thirty_years_weather_desc": thirty_years_info["weather"],
        "thirty_years_source": thirty_years_info["source"],

        # ★ 40年前
        "forty_years_date": forty_years_info["date"],
        "forty_years_temp": forty_years_info["temp"],
        "forty_years_weather_desc": forty_years_info["weather"],
        "forty_years_source": forty_years_info["source"],

        # 追加情報
        "similar_weather_data": similar_weather_data,
        "highest_temp": highest_temp,
    })

@csrf_exempt
def weather_graph(request):
    today = datetime.now()
    current_year = today.year
    
    # 各年の月平均気温を取得
    current_year_temps = []
    ten_year_temps = []
    twenty_year_temps = []
    thirty_year_temps = []
    forty_year_temps = []
    
    for month in range(1, 13):
        # 今年
        temp = get_average_temperature(current_year, month)
        current_year_temps.append(temp if temp else None)
        
        # 10年前
        temp = get_average_temperature(current_year - 10, month)
        ten_year_temps.append(temp if temp else None)
        
        # 20年前
        temp = get_average_temperature(current_year - 20, month)
        twenty_year_temps.append(temp if temp else None)
        
        # 30年前
        temp = get_average_temperature(current_year - 30, month)
        thirty_year_temps.append(temp if temp else None)
        
        # 40年前
        temp = get_average_temperature(current_year - 40, month)
        forty_year_temps.append(temp if temp else None)
    
    print(f"今年の平均気温: {current_year_temps}")
    print(f"10年前の平均気温: {ten_year_temps}")
    
    # グラフを生成
    graph_base64 = generate_temperature_graph(
        current_year_temps,
        ten_year_temps,
        twenty_year_temps,
        thirty_year_temps,
        forty_year_temps
    )
    
    return JsonResponse({
        'image_base64': graph_base64,
        'years': {
            'current': current_year,
            'ten_years_ago': current_year - 10,
            'twenty_years_ago': current_year - 20,
            'thirty_years_ago': current_year - 30,
            'forty_years_ago': current_year - 40,
        }
    })