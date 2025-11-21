"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import WeatherGraph from "./components/WeatherGraph";

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
}

export default function Home() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    axios
      .get(`${API_URL}/weather-graph/`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p>Error: {error}</p>;
  if (!data) return <p>Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-12">
      {/* ---------- 今日の天気 ---------- */}
      <WeatherCard
        title={`今日 (${data.today_date})`}
        tempHigh={data.today_high_temp}
        // tempLow={data.today_low_temp}
        weather={data.today_weather}
        source={data.today_source}
      />

      {/* ---------- 去年 ---------- */}
      <WeatherCard
        title={`1年前 (${data.last_year_date})`}
        temp={data.last_year_temp}
        weather={data.last_year_weather_desc}
        source={data.last_year_source}
      />

      {/* ---------- 10年前 ---------- */}
      <WeatherCard
        title={`10年前 (${data.ten_years_date})`}
        temp={data.ten_years_temp}
        weather={data.ten_years_weather_desc}
        source={data.ten_years_source}
      />

      {/* ---------- 20年前 ---------- */}
      <WeatherCard
        title={`20年前 (${data.twenty_years_date})`}
        temp={data.twenty_years_temp}
        weather={data.twenty_years_weather_desc}
        source={data.twenty_years_source}
      />

      {/* ---------- 30年前 ---------- */}
      <WeatherCard
        title={`30年前 (${data.thirty_years_date})`}
        temp={data.thirty_years_temp}
        weather={data.thirty_years_weather_desc}
        source={data.thirty_years_source}
      />

      {/* ---------- 40年前 ---------- */}
      <WeatherCard
        title={`40年前 (${data.forty_years_date})`}
        temp={data.forty_years_temp}
        weather={data.forty_years_weather_desc}
        source={data.forty_years_source}
      />

      {/* ---------- 月の最高気温 ---------- */}
      <div className="p-6 bg-white rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-3">今月の最高気温</h2>
        <p className="text-lg">{data.highest_temp}°C</p>
      </div>

      <WeatherGraph />

      {/* ---------- 類似天気の日 ---------- */}
      {data.similar_weather_data && (
        <div className="p-6 bg-white rounded-xl shadow">
          <h2 className="text-2xl font-bold mb-3">似た天気の日</h2>
          <p>
            日付: {data.similar_weather_data[0]}
            <br />
            気温: {data.similar_weather_data[1]}°C
          </p>
        </div>
      )}
    </div>
  );
}

interface CardProps {
  title: string;
  temp?: string;
  tempHigh?: string;
  tempLow?: string;
  weather: string;
  source: string;
}

function WeatherCard({
  title,
  temp,
  tempHigh,
  tempLow,
  weather,
  source,
}: CardProps) {
  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-3">{title}</h2>

      {tempHigh !== undefined && (
        <>
          <p className="text-lg">最高気温: {tempHigh}°C</p>
          {tempLow !== undefined && (
            <p className="text-lg">最低気温: {tempLow}°C</p>
          )}
        </>
      )}

      {temp !== undefined && <p className="text-lg">最高気温: {temp}°C</p>}

      <p className="text-lg">天気: {weather}</p>

      <a
        href={source}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline mt-3 inline-block"
      >
        引用元（気象庁データ）
      </a>
    </div>
  );
}
