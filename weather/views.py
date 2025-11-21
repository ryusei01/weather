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
    display_date = today  # 表示する日付（デフォルトは今日）

    # 今日の天気が取得できない場合、昨日のデータを取得
    if (today_forecast["weather"] == "取得失敗" or
        today_forecast["high"] is None or
        today_forecast["high"] == ""):
        yesterday = today - timedelta(days=1)
        yesterday_data = get_past_weather_data(yesterday)
        if yesterday_data["temp"] and yesterday_data["weather"]:
            today_forecast = {
                "weather": yesterday_data["weather"],
                "high": yesterday_data["temp"],
                "low": None,
                "rain": None,
                "source_url": yesterday_data["source"]
            }
            # 昨日のデータを使用していることを示すフラグ
            today_forecast["is_yesterday"] = True
            display_date = yesterday  # 表示日付を昨日に変更
        else:
            today_forecast["is_yesterday"] = False
    else:
        today_forecast["is_yesterday"] = False

    # === 過去データ取得 ===
    last_year_info = get_past_weather_data(last_year)
    ten_years_info = get_past_weather_data(today.replace(year=today.year - 10))
    twenty_years_info = get_past_weather_data(today.replace(year=today.year - 20))
    thirty_years_info = get_past_weather_data(today.replace(year=today.year - 30))
    forty_years_info = get_past_weather_data(today.replace(year=today.year - 40))

    # 7日間分のデータ（1週間前から7日前まで）
    week_data = []
    for days_ago in range(7, 0, -1):  # 7日前から1日前まで
        target_date = today - timedelta(days=days_ago)
        day_info = get_past_weather_data(target_date)
        week_data.append({
            'days_ago': days_ago,
            'date': day_info['date'],
            'temp': day_info['temp'],
            'weather': day_info['weather'],
            'source': day_info['source']
        })

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
        "today_date": display_date.strftime("%Y-%m-%d"),
        "today_weather": today_forecast["weather"],
        "today_high_temp": today_forecast["high"],
        "today_low_temp": today_forecast["low"],
        "today_rain": today_forecast["rain"],
        "today_source": today_forecast["source_url"],
        "is_yesterday_data": today_forecast.get("is_yesterday", False),

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

        # 7日間のデータ
        "week_data": week_data,
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

def health_check(request):
    return JsonResponse({'status': 'ok'})

@csrf_exempt
def custom_week_weather(request, weeks):
    """
    指定された週数分の日次データを返す
    例: /custom-week-weather/1/ → 過去1週間分（7日分）のデータ
        /custom-week-weather/2/ → 過去2週間分（14日分）のデータ
    """
    try:
        weeks = int(weeks)
        if weeks < 1 or weeks > 52:
            return JsonResponse({'error': '週数は1〜52の範囲で指定してください'}, status=400)

        today = datetime.now()
        total_days = weeks * 7

        # N週間分の日次データを取得
        week_data = []
        for days_ago in range(total_days, 0, -1):
            target_date = today - timedelta(days=days_ago)
            day_info = get_past_weather_data(target_date)
            week_data.append({
                'days_ago': days_ago,
                'date': day_info['date'],
                'temp': day_info['temp'],
                'weather': day_info['weather'],
                'source': day_info['source']
            })

        return JsonResponse({
            'weeks': weeks,
            'total_days': total_days,
            'week_data': week_data,
            'today_date': today.strftime("%Y-%m-%d"),
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def custom_year_weather(request, years):
    """
    指定された年数前の天気データを返す
    例: /custom-year-weather/2/ → 2年前のデータ
    """
    try:
        years = int(years)
        if years < 0 or years > 100:
            return JsonResponse({'error': '年数は0〜100の範囲で指定してください'}, status=400)

        today = datetime.now()
        target_date = today.replace(year=today.year - years)

        # 過去のデータを取得
        past_info = get_past_weather_data(target_date)

        return JsonResponse({
            'years_ago': years,
            'date': past_info['date'],
            'temp': past_info['temp'],
            'weather': past_info['weather'],
            'source': past_info['source'],
            'today_date': today.strftime("%Y-%m-%d"),
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)