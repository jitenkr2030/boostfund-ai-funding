import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0c1110 0%, #141917 100%)",
          fontFamily: "system-ui",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: "#2ed3b7",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 64px",
            background: "rgba(24, 29, 27, 0.6)",
            borderRadius: 16,
            boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
            backdropFilter: "blur(4px)",
            border: "1px solid rgba(46, 211, 183, 0.2)",
          }}
        >
          <h1
            style={{
              fontSize: 96,
              fontWeight: 700,
              color: "#e9eeec",
              margin: 0,
              letterSpacing: -2,
            }}
          >
            BoostFund AI
          </h1>
          <p
            style={{
              fontSize: 32,
              color: "#8a9590",
              margin: "16px 0 0 0",
              fontWeight: 500,
            }}
          >
            Your funding command center
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}