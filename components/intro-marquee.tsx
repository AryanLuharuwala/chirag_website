"use client";

import { useEffect, useRef } from "react";
import type { Product } from "./product-card";

const COLOR_MAP: Record<string, string> = {
  white: "var(--c-white)",
  sky:   "var(--c-sky)",
  red:   "var(--c-red)",
  sage:  "var(--c-sage)",
};

function GarmentChip({ product, size = 160 }: { product: Product; size?: number }) {
  const color = COLOR_MAP[product.colorKey];
  return (
    <div style={{
      width: size,
      height: Math.round(size * 1.35),
      background: color,
      flexShrink: 0,
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(110% 80% at 30% 20%, rgba(255,255,255,0.4), transparent 60%)",
      }} />
      <div style={{
        position: "absolute",
        left: "50%", top: "50%",
        transform: "translate(-50%, -50%)",
        width: "55%", aspectRatio: "0.7",
        background: "rgba(0,0,0,0.06)",
        clipPath: "polygon(15% 8%, 30% 0%, 70% 0%, 85% 8%, 100% 22%, 92% 32%, 80% 26%, 80% 100%, 20% 100%, 20% 26%, 8% 32%, 0% 22%)",
      }} />
      <div className="mono" style={{
        position: "absolute", bottom: 8, left: 10,
        fontSize: 9, letterSpacing: "0.12em",
        color: "rgba(0,0,0,0.5)",
        textTransform: "uppercase",
      }}>
        {product.tone}
      </div>
    </div>
  );
}

type Props = {
  products: Product[];
  speed?: number;
};

export default function IntroMarquee({ products, speed = 1 }: Props) {
  const lane1Dur = Math.round(48 / speed);
  const lane2Dur = Math.round(36 / speed);

  const doubled = [...products, ...products];

  return (
    <div style={{
      position: "relative",
      width: "100%",
      height: "100vh",
      background: "var(--cream)",
      overflow: "hidden",
    }}>
      {/* Hero type */}
      <div style={{
        position: "absolute",
        top: "14%",
        left: 0, right: 0,
        textAlign: "center",
        zIndex: 10,
        pointerEvents: "none",
      }}>
        <h1 className="serif" style={{
          fontSize: "clamp(72px, 12vw, 200px)",
          lineHeight: 0.86,
          letterSpacing: "-0.04em",
          margin: 0,
          color: "var(--ink)",
          fontWeight: 300,
          fontVariationSettings: "'opsz' 144",
        }}>
          Wardrobe<br />
          <em style={{ fontWeight: 400 }}>in motion.</em>
        </h1>
      </div>

      {/* Lane 1 — top 20%, right-to-left, muted */}
      <div style={{
        position: "absolute",
        top: "20%",
        left: 0,
        width: "100%",
        overflow: "hidden",
        opacity: 0.7,
      }}>
        <div
          className="marquee-rtl"
          style={{
            display: "flex",
            gap: 16,
            width: "fit-content",
            animationDuration: `${lane1Dur}s`,
          }}
        >
          {doubled.map((p, i) => (
            <GarmentChip key={`l1-${i}`} product={p} size={130} />
          ))}
        </div>
      </div>

      {/* Lane 2 — bottom 8%, left-to-right, foreground */}
      <div style={{
        position: "absolute",
        bottom: "8%",
        left: 0,
        width: "100%",
        overflow: "hidden",
      }}>
        <div
          className="marquee-ltr"
          style={{
            display: "flex",
            gap: 20,
            width: "fit-content",
            animationDuration: `${lane2Dur}s`,
          }}
        >
          {doubled.map((p, i) => (
            <GarmentChip key={`l2-${i}`} product={p} size={160} />
          ))}
        </div>
      </div>

      {/* Footer ribbon */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0, right: 0,
        height: 80,
        background: "linear-gradient(to top, var(--cream) 40%, transparent)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        paddingBottom: 20,
        zIndex: 5,
      }}>
        <div className="mono" style={{
          fontSize: 9,
          letterSpacing: "0.2em",
          color: "var(--muted)",
          textTransform: "uppercase",
        }}>
          VOL. 04 · SS26 &nbsp;·&nbsp; FOUR COLORS: WHITE / SKY / SUNSET / SAGE &nbsp;·&nbsp; SHIPPED IN PAPER
        </div>
      </div>
    </div>
  );
}
