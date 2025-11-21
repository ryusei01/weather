import WeatherClient from "./WeatherClient";

interface WeatherData {
  today_date: string;
  today_weather: string;
  today_high_temp: string;
  today_low_temp: string;
  today_rain: string;
  today_source: string;

  last_year_date: string;
  last_year_temp: string;
  last_year_weather_desc: string;
  last_year_source: string;

  ten_years_date: string;
  ten_years_temp: string;
  ten_years_weather_desc: string;
  ten_years_source: string;
  is_yesterday_data: boolean;

  twenty_years_date: string;
  twenty_years_temp: string;
  twenty_years_weather_desc: string;
  twenty_years_source: string;

  thirty_years_date: string;
  thirty_years_temp: string;
  thirty_years_weather_desc: string;
  thirty_years_source: string;

  forty_years_date: string;
  forty_years_temp: string;
  forty_years_weather_desc: string;
  forty_years_source: string;

  similar_weather_data?: [string, string, string];
  highest_temp: number;
  week_data?: Array<{
    days_ago: number;
    date: string;
    temp: string;
    weather: string;
    source: string;
  }>;
}

async function getWeatherData(): Promise<WeatherData> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const res = await fetch(`${API_URL}/weather-data/`, {
    next: { revalidate: 3600 } // 1時間ごとに再検証
  });

  if (!res.ok) {
    throw new Error('天気データの取得に失敗しました');
  }

  return res.json();
}

export default async function Home() {
  const data = await getWeatherData();

  return <WeatherClient initialData={data} />;
}
