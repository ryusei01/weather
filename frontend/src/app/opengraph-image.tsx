import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "1年前の気温 - 今日と過去の気温を比較";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            position: "absolute",
            top: 50,
            left: 50,
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 50,
            right: 50,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
          }}
        />

        {/* Sun */}
        <div
          style={{
            position: "absolute",
            top: 100,
            right: 150,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "#FDB813",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h1
            style={{
              fontSize: 72,
              fontWeight: "bold",
              color: "white",
              margin: 0,
              marginBottom: 20,
            }}
          >
            🌡️ 天気比較
          </h1>
          <p
            style={{
              fontSize: 36,
              color: "rgba(255,255,255,0.9)",
              margin: 0,
              marginBottom: 30,
            }}
          >
            今日と過去の気温を比較
          </p>
          <p
            style={{
              fontSize: 28,
              color: "rgba(255,255,255,0.8)",
              margin: 0,
              marginBottom: 40,
            }}
          >
            1年前・10年前・20年前・30年前・40年前
          </p>
          <p
            style={{
              fontSize: 22,
              color: "rgba(255,255,255,0.7)",
              margin: 0,
            }}
          >
            weather-ten-gamma-42.vercel.app
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
