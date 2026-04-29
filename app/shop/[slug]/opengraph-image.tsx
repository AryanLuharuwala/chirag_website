import { ImageResponse } from "next/og";
import { db, products } from "@/lib/db";
import { eq } from "drizzle-orm";

export const alt = "The Exclusive Rack";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const COLOR_MAP: Record<string, string> = {
  white: "#FBFAF6",
  sky:   "#B8D8E8",
  red:   "#C17060",
  sage:  "#A8C4A8",
};

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);

  const bg = product ? COLOR_MAP[product.colorKey] ?? "#EAE3D5" : "#EAE3D5";
  const hero = product?.images?.[0];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: bg,
          position: "relative",
          fontFamily: "serif",
        }}
      >
        {/* radial highlight */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(120% 80% at 30% 25%, rgba(255,255,255,0.45), transparent 60%)",
          }}
        />
        {/* hero image */}
        {hero && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hero.url}
            alt=""
            style={{
              position: "absolute",
              left: "62%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              maxWidth: "55%",
              maxHeight: "85%",
              objectFit: "contain",
            }}
          />
        )}
        {/* meta block */}
        <div
          style={{
            position: "absolute",
            left: 64,
            top: 64,
            bottom: 64,
            width: 540,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            color: "#15140F",
          }}
        >
          <div
            style={{
              fontSize: 18,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              opacity: 0.7,
              fontFamily: "monospace",
            }}
          >
            The Exclusive Rack · {product?.category ?? "SS26"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div
              style={{
                fontSize: 84,
                lineHeight: 0.95,
                letterSpacing: "-0.02em",
                fontWeight: 400,
              }}
            >
              {product?.name ?? "Summer Essentials, quietly made."}
            </div>
            {product && (
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 18,
                  fontSize: 28,
                }}
              >
                <span style={{ fontWeight: 500 }}>${product.price}</span>
                <span
                  style={{
                    fontSize: 14,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    opacity: 0.6,
                    fontFamily: "monospace",
                  }}
                >
                  {product.tone}
                </span>
              </div>
            )}
          </div>
          <div
            style={{
              fontSize: 14,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              opacity: 0.55,
              fontFamily: "monospace",
            }}
          >
            theexclusiverack.com / shop / {slug}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
