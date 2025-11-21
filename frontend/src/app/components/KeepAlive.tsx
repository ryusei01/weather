"use client";

import { useEffect } from "react";

export default function KeepAlive() {
  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://weather-dzvo.onrender.com";

    // 10分ごとにpingを送ってスリープを防ぐ
    const interval = setInterval(() => {
      fetch(`${API_URL}/health/`).catch(() => {});
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
