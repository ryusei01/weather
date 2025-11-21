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
  const [customYears, setCustomYears] = useState<number>(1);
  const [customYearData, setCustomYearData] = useState<any>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    axios
      .get(`${API_URL}/weather-data/`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message));
  }, [API_URL]);

  // データ取得後にタイトルを動的に変更
  useEffect(() => {
    if (!data) return;

    // URLから検索キーワードを取得
    const urlParams = new URLSearchParams(window.location.search);
    const keyword = urlParams.get("q") || document.referrer;
    const yearsParam = urlParams.get("years");

    const fetchData = async () => {
      // URLに years パラメータがある場合、そのデータを取得
      if (yearsParam) {
        const years = parseInt(yearsParam);
        if (!isNaN(years)) {
          setCustomYears(years);
          try {
            const res = await axios.get(`${API_URL}/custom-year-weather/${years}/`);
            setCustomYearData(res.data);
          } catch (err) {
            console.error('カスタム年数データ取得エラー:', err);
          }
        }
      }

      // キーワードから年数を抽出
      const yearMatch = keyword.match(/(\d+)年前/);
      if (yearMatch) {
        const years = parseInt(yearMatch[1]);
        setCustomYears(years);
        try {
          const res = await axios.get(`${API_URL}/custom-year-weather/${years}/`);
          setCustomYearData(res.data);
        } catch (err) {
          console.error('カスタム年数データ取得エラー:', err);
        }
      }
    };

    fetchData();

    let pageTitle = "天気比較 - 今日と過去の気温を比較";
    let description = `今日（${data.today_date}）の天気は${data.today_weather}、最高気温は${data.today_high_temp}°C。`;

    // キーワードから年数を抽出してタイトル変更
    const yearMatch = keyword.match(/(\d+)年前/);
    if (yearMatch) {
      const years = parseInt(yearMatch[1]);
      pageTitle = `${years}年前の気温 | 天気比較`;
      description = `${years}年前の東京の気温データを今日と比較。`;
    }

    // タイトルとdescriptionを動的に更新
    document.title = pageTitle;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", description);
    }

    // OGタグも更新
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute("content", pageTitle);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute("content", description);
    }
  }, [data, API_URL]);

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

        {/* 任意の年数を選択 */}
        <div className="p-6 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">何年前の気温を見る？</h2>
          <div className="flex items-center gap-4">
            <input
              type="number"
              min="1"
              max="100"
              value={customYears}
              onChange={(e) => setCustomYears(parseInt(e.target.value) || 1)}
              className="px-4 py-2 border-2 border-blue-300 rounded-lg text-xl w-24 focus:outline-none focus:border-blue-500"
            />
            <span className="text-xl font-semibold">年前</span>
            <button
              onClick={async () => {
                try {
                  const res = await axios.get(`${API_URL}/custom-year-weather/${customYears}/`);
                  setCustomYearData(res.data);
                } catch (err) {
                  console.error('データ取得エラー:', err);
                }
              }}
              className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
            >
              検索
            </button>
          </div>
        </div>

        {/* カスタム年数の結果表示 */}
        {customYearData && (
          <div className="p-8 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl shadow-2xl text-white">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">{customYearData.years_ago}年前の気温</h1>
              <p className="text-6xl font-extrabold mb-2">{customYearData.temp}°C</p>
              <p className="text-2xl mb-4">{customYearData.weather}</p>
              <p className="text-lg opacity-90">{customYearData.date}</p>

              {data && (
                <div className="mt-6 pt-6 border-t border-white/30">
                  <p className="text-sm opacity-80">今日（{data.today_date}）との比較</p>
                  <p className="text-3xl font-bold mt-2">
                    {(parseFloat(data.today_high_temp) - parseFloat(customYearData.temp)) > 0 ? "+" : ""}
                    {(parseFloat(data.today_high_temp) - parseFloat(customYearData.temp)).toFixed(1)}°C
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

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
