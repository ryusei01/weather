"use client";

import axios from "axios";
import { useEffect, useState, lazy, Suspense } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";

// 動的インポートでコンポーネントを遅延読み込み
const WeatherGraph = dynamic(() => import("./components/WeatherGraph"), {
  loading: () => <div className="p-6 bg-white rounded-xl shadow-lg animate-pulse h-64"></div>,
  ssr: true,
});

const AdBanner = dynamic(() => import("./components/AdBanner"), {
  loading: () => <div className="my-8 h-32 bg-gray-100 rounded-lg animate-pulse"></div>,
  ssr: false,
});

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

interface WeatherClientProps {
  initialData: WeatherData;
}

export default function WeatherClient({ initialData }: WeatherClientProps) {
  const [data, setData] = useState<WeatherData>(initialData);
  const [customYears, setCustomYears] = useState<number>(1);
  const [customYearData, setCustomYearData] = useState<any>(null);
  const [customWeeks, setCustomWeeks] = useState<number>(1);
  const [customWeekData, setCustomWeekData] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [predictionLoading, setPredictionLoading] = useState<boolean>(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // データ取得後にタイトルを動的に変更
  useEffect(() => {
    if (!data) return;

    // URLから検索キーワードを取得
    const urlParams = new URLSearchParams(window.location.search);
    const keyword = urlParams.get("q") || document.referrer;
    const yearsParam = urlParams.get("years");

    const fetchData = async () => {
      // デフォルトで1年前のデータを取得
      try {
        const res = await axios.get(`${API_URL}/custom-year-weather/1/`);
        setCustomYearData(res.data);
      } catch (err) {
        console.error("1年前データ取得エラー:", err);
      }

      // AI予測を自動取得
      try {
        setPredictionLoading(true);
        const predRes = await axios.get(`${API_URL}/predict-weather/`);
        setPrediction(predRes.data);
      } catch (err) {
        console.error("AI予測取得エラー:", err);
      } finally {
        setPredictionLoading(false);
      }

      // URLに years パラメータがある場合、そのデータを取得
      if (yearsParam) {
        const years = parseInt(yearsParam);
        if (!isNaN(years)) {
          setCustomYears(years);
          try {
            const res = await axios.get(
              `${API_URL}/custom-year-weather/${years}/`
            );
            setCustomYearData(res.data);
          } catch (err) {
            console.error("カスタム年数データ取得エラー:", err);
          }
        }
      }

      // キーワードから年数を抽出
      const yearMatch = keyword.match(/(\d+)年前/);
      if (yearMatch) {
        const years = parseInt(yearMatch[1]);
        setCustomYears(years);
        try {
          const res = await axios.get(
            `${API_URL}/custom-year-weather/${years}/`
          );
          setCustomYearData(res.data);
        } catch (err) {
          console.error("カスタム年数データ取得エラー:", err);
        }
      }
    };

    fetchData();

    let pageTitle = "1年前の気温は？ - 今日と過去の気温を比較";
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

    const ogDescription = document.querySelector(
      'meta[property="og:description"]'
    );
    if (ogDescription) {
      ogDescription.setAttribute("content", description);
    }
  }, [data, API_URL]);

  // 構造化データ（JSON-LD）を生成
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "1年前の気温は？ - 今日と過去の気温を比較",
    description: `今日（${data.today_date}）の天気は${data.today_weather}、最高気温は${data.today_high_temp}°C。1年前（${data.last_year_date}）は${data.last_year_temp}°C、10年前（${data.ten_years_date}）は${data.ten_years_temp}°Cでした。`,
    mainEntity: {
      "@type": "Dataset",
      name: "東京の気温比較データ",
      description:
        "今日と過去の気温データの比較。1年前の気温、10年前の気温、1週間前の気温、昨日の気温、一昨日の気温など。",
      temporalCoverage: `${data.forty_years_date}/${data.today_date}`,
      spatialCoverage: {
        "@type": "Place",
        name: "東京",
      },
    },
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

        <div>
          <h1 className="text-2xl font-bold mb-4">東京の過去の気温と天気 </h1>
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
                  const res = await axios.get(
                    `${API_URL}/custom-year-weather/${customYears}/`
                  );
                  setCustomYearData(res.data);
                } catch (err) {
                  console.error("データ取得エラー:", err);
                }
              }}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
              検索
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            💡 1〜100年前の気温を検索できます
          </p>
        </div>

        {/* カスタム年数の結果表示 */}
        {customYearData && (
          <div className="p-8 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl shadow-2xl text-white relative overflow-hidden">
            {/* 背景の装飾 */}
            <div className="absolute top-0 right-0 opacity-10">
              <svg
                className="w-64 h-64"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
              </svg>
            </div>

            <div className="text-center relative z-10">
              <div className="flex items-center justify-center gap-3 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                <h1 className="text-4xl font-bold">
                  {customYearData.years_ago}年前の気温
                </h1>
              </div>

              <div className="flex items-center justify-center gap-2 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-6xl font-extrabold">
                  {customYearData.temp}°C
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
                </svg>
                <p className="text-2xl">{customYearData.weather}</p>
              </div>

              <p className="text-lg opacity-90 mb-2">
                📅 {customYearData.date}
              </p>

              {data && (
                <div className="mt-6 pt-6 border-t border-white/30">
                  <p className="text-sm opacity-80 mb-2">
                    {`${data.is_yesterday_data ? "昨日(" : "今日("}${
                      data.today_date
                    }）との比較`}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    {parseFloat(data.today_high_temp) -
                      parseFloat(customYearData.temp) >
                    0 ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-red-200"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-blue-200"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    <p className="text-3xl font-bold">
                      {parseFloat(data.today_high_temp) -
                        parseFloat(customYearData.temp) >
                      0
                        ? "+"
                        : ""}
                      {(
                        parseFloat(data.today_high_temp) -
                        parseFloat(customYearData.temp)
                      ).toFixed(1)}
                      °C
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---------- 今日の天気 ---------- */}
        {data.is_yesterday_data && (
          <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-yellow-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-yellow-800 font-semibold">
                ⚠️
                今日の予報データが取得できないため、昨日のデータを表示しています
              </p>
            </div>
          </div>
        )}
        <WeatherCard
          title={
            data.is_yesterday_data
              ? `昨日 (${data.today_date})`
              : `今日 (${data.today_date})`
          }
          tempHigh={data.today_high_temp}
          weather={data.today_weather}
          source={data.today_source}
        />

        {/* 広告1 */}
        <div className="my-8">
          <AdBanner dataAdSlot="1234567890" />
        </div>

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

        {/* ---------- 週間気温表示（統合版） ---------- */}
        <div className="p-6 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">📅 過去の週間気温</h2>
          <div className="flex items-center gap-4 flex-wrap mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">過去</span>
              <input
                type="number"
                min="1"
                max="52"
                value={customWeeks}
                onChange={(e) => setCustomWeeks(parseInt(e.target.value) || 1)}
                className="px-4 py-2 border-2 border-purple-300 rounded-lg text-xl w-24 focus:outline-none focus:border-purple-500"
              />
              <span className="text-xl font-semibold">週間分</span>
            </div>
            <button
              onClick={async () => {
                try {
                  const res = await axios.get(
                    `${API_URL}/custom-week-weather/${customWeeks}/`
                  );
                  setCustomWeekData(res.data);
                } catch (err) {
                  console.error("データ取得エラー:", err);
                }
              }}
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                  clipRule="evenodd"
                />
              </svg>
              表示
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            💡 1〜52週間前（最大364日分）の気温を表示できます
          </p>

          {/* データ表示エリア */}
          {customWeekData &&
          customWeekData.week_data &&
          customWeekData.week_data.length > 0 ? (
            <div>
              <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-center font-semibold text-purple-800">
                  過去 {customWeekData.weeks}週間分（{customWeekData.total_days}
                  日分）のデータ
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customWeekData.week_data.map((day: any) => (
                  <div
                    key={day.days_ago}
                    className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-semibold text-blue-600">
                        {day.days_ago}日前
                      </span>
                      <span className="text-xs text-gray-500">{day.date}</span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-3xl font-bold text-gray-800">
                        {day.temp || "---"}
                      </span>
                      <span className="text-lg text-gray-600">°C</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      {day.weather || "データなし"}
                    </p>
                    <a
                      href={day.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      詳細を見る →
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ) : data.week_data && data.week_data.length > 0 ? (
            <div>
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-center font-semibold text-blue-800">
                  過去 1週間分（7日分）のデータ（デフォルト表示）
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.week_data.map((day) => (
                  <div
                    key={day.days_ago}
                    className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-semibold text-blue-600">
                        {day.days_ago}日前
                      </span>
                      <span className="text-xs text-gray-500">{day.date}</span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-3xl font-bold text-gray-800">
                        {day.temp || "---"}
                      </span>
                      <span className="text-lg text-gray-600">°C</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      {day.weather || "データなし"}
                    </p>
                    <a
                      href={day.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      詳細を見る →
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* 広告3 */}
        <div className="my-8">
          <AdBanner dataAdSlot="1111111111" />
        </div>

        {/* ---------- AI気温予測 ---------- */}
        <div className="p-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg text-white">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>🤖</span>
            <span>AI気温予測</span>
          </h2>
          <p className="text-sm mb-4 opacity-90">
            過去10年のデータから機械学習で予測しています
          </p>
          <button
            onClick={async () => {
              setPredictionLoading(true);
              try {
                const res = await axios.get(`${API_URL}/predict-weather/`);
                setPrediction(res.data);
              } catch (err) {
                console.error("予測エラー:", err);
              } finally {
                setPredictionLoading(false);
              }
            }}
            disabled={predictionLoading}
            className="px-6 py-3 bg-white text-purple-600 font-bold rounded-lg hover:bg-purple-50 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {predictionLoading ? "予測中..." : "気温トレンドを予測"}
          </button>
        </div>

        {/* AI予測結果 */}
        {prediction && prediction.success && (
          <div className="p-6 bg-white rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-4">📊 予測結果</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 今月 */}
              {prediction.current_month && (
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <h4 className="text-lg font-bold mb-2">
                    今月 ({prediction.current_month.month}月)
                  </h4>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-blue-600">
                      {prediction.current_month.trend}
                    </p>
                    <p className="text-sm text-gray-600">
                      予測: {prediction.current_month.predicted_temp}°C
                    </p>
                    <p className="text-sm text-gray-600">
                      過去平均: {prediction.current_month.past_avg_temp}°C
                    </p>
                    <p className="text-xs text-gray-500">
                      差: {prediction.current_month.temp_diff > 0 ? "+" : ""}
                      {prediction.current_month.temp_diff}°C
                    </p>
                    <div className="mt-2 bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${prediction.current_month.confidence}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {/* 来月 */}
              {prediction.next_month && (
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                  <h4 className="text-lg font-bold mb-2">
                    来月 ({prediction.next_month.month}月)
                  </h4>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-green-600">
                      {prediction.next_month.trend}
                    </p>
                    <p className="text-sm text-gray-600">
                      予測: {prediction.next_month.predicted_temp}°C
                    </p>
                    <p className="text-sm text-gray-600">
                      過去平均: {prediction.next_month.past_avg_temp}°C
                    </p>
                    <p className="text-xs text-gray-500">
                      差: {prediction.next_month.temp_diff > 0 ? "+" : ""}
                      {prediction.next_month.temp_diff}°C
                    </p>
                    <div className="mt-2 bg-green-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${prediction.next_month.confidence}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {/* 再来月 */}
              {prediction.next_next_month && (
                <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                  <h4 className="text-lg font-bold mb-2">
                    再来月 ({prediction.next_next_month.month}月)
                  </h4>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-orange-600">
                      {prediction.next_next_month.trend}
                    </p>
                    <p className="text-sm text-gray-600">
                      予測: {prediction.next_next_month.predicted_temp}°C
                    </p>
                    <p className="text-sm text-gray-600">
                      過去平均: {prediction.next_next_month.past_avg_temp}°C
                    </p>
                    <p className="text-xs text-gray-500">
                      差: {prediction.next_next_month.temp_diff > 0 ? "+" : ""}
                      {prediction.next_next_month.temp_diff}°C
                    </p>
                    <div className="mt-2 bg-orange-200 rounded-full h-2">
                      <div
                        className="bg-orange-600 h-2 rounded-full"
                        style={{
                          width: `${prediction.next_next_month.confidence}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-4">
              データソース: {prediction.data_source}
            </p>
          </div>
        )}

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

        {/* 広告2 */}
        <div className="my-8">
          <AdBanner dataAdSlot="9876543210" />
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

function WeatherCard({ title, temp, tempHigh, weather, source }: CardProps) {
  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-3">{title}</h2>
      <p className="text-lg">
        天気: {weather}
        <br />
        {tempHigh && <>最高気温: {tempHigh}°C</>}
        {temp && <>気温: {temp}°C</>}
      </p>
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
