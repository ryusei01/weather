// app/components/WeatherGraph.tsx
"use client";

import { useState, useEffect } from "react";

export default function WeatherGraph() {
  const [graphImage, setGraphImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/weather-graph/")
      .then((res) => {
        if (!res.ok) {
          throw new Error("グラフの取得に失敗しました");
        }
        return res.json();
      })
      .then((data) => {
        setGraphImage(data.image_base64);
        setLoading(false);
      })
      .catch((err) => {
        console.error("グラフ取得エラー:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>読み込み中...</div>
    );
  }

  if (error) {
    return <div style={{ padding: "20px", color: "red" }}>エラー: {error}</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>気温グラフ</h2>
      {graphImage && (
        <img
          src={`data:image/png;base64,${graphImage}`}
          alt="気温グラフ"
          style={{ maxWidth: "100%", height: "auto" }}
        />
      )}
    </div>
  );
}
