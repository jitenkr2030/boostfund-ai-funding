import { ImageResponse } from "next/og"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image({ params }: { params: { id: string } }) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://boostfund.ai"
  const opportunityUrl = `${baseUrl}/api/opportunities/${params.id}`
  
  let title = "Opportunity"
  let backgroundColor = "#0c1110"
  let primaryColor = "#2ed3b7"
  
  try {
    const res = await fetch(opportunityUrl, { cache: "no-store" })
    if (res.ok) {
      const data = await res.json()
      title = data.title || "Opportunity"
    }
  } catch {
    // Fall back to generic image
  }
  
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
          backgroundColor,
          padding: "80px"
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: "24px"
          }}
        >
          <h1
            style={{
              fontSize: "80px",
              fontWeight: 700,
              fontFamily: '"Plus Jakarta Sans"',
              color: "#e9eeec",
              margin: 0,
              lineHeight: 1.1,
              maxWidth: "900px"
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: "36px",
              fontFamily: '"Inter"',
              color: primaryColor,
              margin: 0,
              fontWeight: 500
            }}
          >
            Funding Opportunity
          </p>
        </div>
      </div>
    ),
    {
      width: size.width,
      height: size.height,
      fonts: [
        {
          name: "Plus Jakarta Sans",
          data: await fetch(new URL("https://fonts.gstatic.com/s/plusjakartasans/v8/LDIbaomQNQcsA88c7O9IYQM8Q8yK7QXYGVBe1gwc.woff2")).then(res => res.arrayBuffer()),
          style: "normal",
          weight: 700
        },
        {
          name: "Inter",
          data: await fetch(new URL("https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2")).then(res => res.arrayBuffer()),
          style: "normal",
          weight: 500
        }
      ]
    }
  )
}