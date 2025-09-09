import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 600 };
export const contentType = "image/png";

export default async function Image() {
  const title = "BoostFund AI";
  const subtitle = "AI-Powered Funding Assistant Platform";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0c1110 0%, #141917 100%)",
          color: "#e9eeec",
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          textAlign: "center",
          padding: "80px"
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
            maxWidth: "900px"
          }}
        >
          <h1
            style={{
              fontSize: "96px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              background: "linear-gradient(to right, #2ed3b7, #64d7c2)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: 0
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: "36px",
              fontWeight: 400,
              color: "#8a9590",
              margin: 0,
              lineHeight: 1.4
            }}
          >
            {subtitle}
          </p>
          <div
            style={{
              width: "120px",
              height: "4px",
              background: "linear-gradient(to right, #2ed3b7, #64d7c2)",
              borderRadius: "2px",
              marginTop: "32px"
            }}
          />
        </div>
      </div>
    ),
    {
      ...size
    }
  );
}