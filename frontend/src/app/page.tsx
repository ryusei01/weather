"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import Image from "next/image";
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
      .get(`${API_URL}/weather-data/`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message));
  }, [API_URL]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <p className="text-red-600 text-lg">エラー: {error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">天気情報を読み込み中...</p>
          <p className="text-sm text-gray-500 mt-2">少々お待ちください</p>

          {/* 広告スペース (将来的に使用) */}
          <div className="mt-8 p-4 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-xs text-gray-400">広告スペース</p>
          </div>
        </div>
      </div>
    );
  }

  // 構造化データ（JSON-LD）を生成
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "天気比較 - 今日と過去の気温を比較",
    "description": `今日（${data.today_date}）の天気は${data.today_weather}、最高気温は${data.today_high_temp}°C。1年前（${data.last_year_date}）は${data.last_year_temp}°C、10年前（${data.ten_years_date}）は${data.ten_years_temp}°Cでした。`,
    "mainEntity": {
      "@type": "Dataset",
      "name": "東京の気温比較データ",
      "description": "今日と過去の気温データの比較",
      "temporalCoverage": `${data.forty_years_date}/${data.today_date}`,
      "spatialCoverage": {
        "@type": "Place",
        "name": "東京"
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="max-w-3xl mx-auto p-6 space-y-12">
        {/* 広告スペース (上部) */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
          <p className="text-xs text-gray-400">広告スペース (728x90)</p>
        </div>

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

      {/* 広告スペース (中間) */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
        <p className="text-xs text-gray-400">広告スペース (300x250)</p>
      </div>

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

      {/* 広告スペース (下部) */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
        <p className="text-xs text-gray-400">広告スペース (728x90)</p>
      </div>

      {/* フッター - 出典とリンクバナー */}
      <footer className="py-8 border-t border-gray-200">
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            データ出典：
            <a
              href="https://www.jma.go.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline ml-1"
            >
              気象庁ホームページ
            </a>
          </p>

          {/* リンクバナースペース */}
          <div className="flex justify-center gap-4 flex-wrap items-center">
            <a
              href="https://www.jma.go.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
            >
              <Image
                src="/jma-logo.gif"
                alt="気象庁"
                width={150}
                height={48}
                className="h-12 w-auto"
              />
            </a>
            <div className="bg-gray-100 px-6 py-3 rounded border border-gray-300">
              <p className="text-xs text-gray-400">リンクバナー</p>
            </div>
            <div className="bg-gray-100 px-6 py-3 rounded border border-gray-300">
              <p className="text-xs text-gray-400">リンクバナー</p>
            </div>
          </div>

          <p className="text-xs text-gray-500 pt-4">
            © 2025 Weather Comparison
          </p>
        </div>
      </footer>
      </div>
    </>
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
        出典：気象庁ホームページ
      </a>
    </div>
  );
}
