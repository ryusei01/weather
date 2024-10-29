"use client"; // これを追加

import axios from "axios";
import { useState, useEffect } from "react";

interface WeatherData {
  last_year_date: string;
  last_year_temp: string;
  last_year_weather_desc: string;
  similar_weather_data?: [string, string];
  highest_temp: string;
  error?: string;
}

export default function Home() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get<WeatherData>("http://localhost:8000/weather/")
      .then((response) => {
        setWeatherData(response.data);
        console.log("!", response);
      })
      .catch((error) => {
        setError(error.message);
      });
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!weatherData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Weather Data for {weatherData.last_year_date}</h1>
      <p>Temperature: {weatherData.last_year_temp}°C</p>
      <p>Weather: {weatherData.last_year_weather_desc}</p>

      {weatherData.similar_weather_data && (
        <div>
          <h2>Similar Weather on {weatherData.similar_weather_data[0]}</h2>
          <p>Temperature: {weatherData.similar_weather_data[1]}°C</p>
        </div>
      )}

      <h2>
        Highest Temperature in {weatherData.last_year_date?.split("-")[0]}-
        {weatherData.last_year_date?.split("-")[1]}
      </h2>
      <p>{weatherData.highest_temp}°C</p>

      {weatherData.error && <div>Error: {weatherData.error}</div>}
    </div>
  );
}
