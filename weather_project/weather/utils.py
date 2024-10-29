import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('name'+__name__)

class WeatherData:
    def __init__(self, date, temperature, weather):
        self.data = {
            "date": date,
            "temperature": temperature,
            "weather": weather,
        }

    def get(self, key):
        return self.data.get(key, "Key not found")

    def __repr__(self):
        return f"WeatherData({self.data['date']}, Temp: {self.data['temperature']}°C, weather: {self.data['weather']}"

BASE_URL = "https://www.data.jma.go.jp/stats/etrn/view/daily_s1.php"
TEMPERATURE_INDEX = 7
WEATHER_INDEX = 20

def fetch_weather_data(year, month, day):
    url = f"{BASE_URL}?prec_no=44&block_no=47662&year={year}&month={month}&day={day}&view=p1"
    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        table = soup.find('table', {'class': 'data2_s'})
        if table:
            rows = table.find_all('tr')[4:]  # Skip header rows
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

def get_last_year_weather_data():
    last_year = datetime.now() - timedelta(days=366)
    data = fetch_weather_data(last_year.year, last_year.month, last_year.day)
    if data:
        parsed_data = parse_weather_data(data, last_year.year, last_year.month)
        logger.info(f"Parsed data: {parsed_data}")
        return parsed_data
    return None

def get_monthly_weather_data(year, month):
    data = fetch_weather_data(year, month, 1)
    if data:
        return parse_weather_data(data, year, month)
    return None

def get_similar_weather_data(year, month, weather):
    monthly_data = get_monthly_weather_data(year, month)
    return next((row for row in monthly_data if row[2] == weather), None)

def get_highest_temperature(year, month):
    monthly_data = get_monthly_weather_data(year, month)
    return max((float(row[1]) for row in monthly_data if row[1]), default=None)

# 使用例
if __name__ == "__main__":
    print(get_last_year_weather_data())
    print(get_similar_weather_data("2023", "07", "晴"))
    print(get_highest_temperature("2023", "07"))