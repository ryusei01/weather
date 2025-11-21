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
          <h2 className="text-2xl font-bold mb-4">🔍 何年前の気温を見る？</h2>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="100"
                value={customYears}
                onChange={(e) => setCustomYears(parseInt(e.target.value) || 1)}
                className="px-4 py-2 border-2 border-blue-300 rounded-lg text-xl w-24 focus:outline-none focus:border-blue-500"
              />
              <span className="text-xl font-semibold">年前</span>
            </div>
            <button
              onClick={async () => {
                try {
                  const res = await axios.get(`${API_URL}/custom-year-weather/${customYears}/`);
                  setCustomYearData(res.data);
                } catch (err) {
                  console.error('データ取得エラー:', err);
                }
              }}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              検索
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-3">💡 1〜100年前の気温を検索できます</p>
        </div>

        {/* カスタム年数の結果表示 */}
        {customYearData && (
          <div className="p-8 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl shadow-2xl text-white relative overflow-hidden">
            {/* 背景の装飾 */}
            <div className="absolute top-0 right-0 opacity-10">
              <svg className="w-64 h-64" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
              </svg>
            </div>

            <div className="text-center relative z-10">
              <div className="flex items-center justify-center gap-3 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <h1 className="text-4xl font-bold">{customYearData.years_ago}年前の気温</h1>
              </div>

              <div className="flex items-center justify-center gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <p className="text-6xl font-extrabold">{customYearData.temp}°C</p>
              </div>

              <div className="flex items-center justify-center gap-2 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
                </svg>
                <p className="text-2xl">{customYearData.weather}</p>
              </div>

              <p className="text-lg opacity-90 mb-2">📅 {customYearData.date}</p>

              {data && (
                <div className="mt-6 pt-6 border-t border-white/30">
                  <p className="text-sm opacity-80 mb-2">今日（{data.today_date}）との比較</p>
                  <div className="flex items-center justify-center gap-2">
                    {(parseFloat(data.today_high_temp) - parseFloat(customYearData.temp)) > 0 ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-200" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-200" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    <p className="text-3xl font-bold">
                      {(parseFloat(data.today_high_temp) - parseFloat(customYearData.temp)) > 0 ? "+" : ""}
                      {(parseFloat(data.today_high_temp) - parseFloat(customYearData.temp)).toFixed(1)}°C
                    </p>
                  </div>
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
