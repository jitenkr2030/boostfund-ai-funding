import { ImageResponse } from "next/og";

export const size = { width: 800, height: 418 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { id: string } }) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "https://boostfund.ai"}/api/opportunities/${params.id}`,
      { cache: "no-store" }
    );

    if (!res.ok) throw new Error("Failed to fetch opportunity");

    const opportunity = await res.json();
    const title = opportunity?.title || "Opportunity";

    return new ImageResponse(
      (
        <div
          style={{
            width: "800px",
            height: "418px",
            backgroundColor: "#0c1110",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "64px",
          }}
        >
          <div
            style={{
              fontSize: "48px",
              fontFamily: '"Plus Jakarta Sans"',
              color: "#e9eeec",
              textAlign: "center",
              lineHeight: 1.2,
              marginBottom: "16px",
              maxWidth: "100%",
              fontWeight: 700,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: "24px",
              fontFamily: '"Inter"',
              color: "#2ed3b7",
              textAlign: "center",
              fontWeight: 500,
            }}
          >
            Funding Opportunity
          </div>
        </div>
      ),
      {
        width: 800,
        height: 418,
      }
    );
  } catch (error) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "800px",
            height: "418px",
            backgroundColor: "#0c1110",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "64px",
          }}
        >
          <div
            style={{
              fontSize: "48px",
              fontFamily: '"Plus Jakarta Sans"',
              color: "#e9eeec",
              textAlign: "center",
              fontWeight: 700,
            }}
          >
            Opportunity
          </div>
          <div
            style={{
              fontSize: "24px",
              fontFamily: '"Inter"',
              color: "#2ed3b7",
              textAlign: "center",
              fontWeight: 500,
            }}
          >
            Funding Opportunity
          </div>
        </div>
      ),
      {
        width: 800,
        height: 418,
      }
    );
  }
}