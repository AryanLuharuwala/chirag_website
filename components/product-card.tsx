"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "./cart-context";
import type { ProductImage } from "@/lib/db/schema";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: string;
  colorKey: "white" | "sky" | "red" | "sage";
  tone: string;
  description: string;
  visualConfig?: Record<string, unknown>;
  images?: ProductImage[];
};

const COLOR_MAP: Record<string, string> = {
  white: "var(--c-white)",
  sky:   "var(--c-sky)",
  red:   "var(--c-red)",
  sage:  "var(--c-sage)",
};

function getSilhouettePath(product: Product) {
  if (product.category === "Kids")
    return "polygon(15% 5%, 85% 5%, 90% 35%, 75% 80%, 60% 80%, 50% 40%, 40% 80%, 25% 80%, 10% 35%)";
  if (product.name.includes("Dress") || product.name.includes("Romper"))
    return "polygon(28% 5%, 40% 0%, 60% 0%, 72% 5%, 78% 22%, 95% 100%, 5% 100%, 22% 22%)";
  if (product.name.includes("Trouser") || product.name.includes("Short"))
    return "polygon(20% 0%, 80% 0%, 84% 30%, 70% 100%, 56% 100%, 50% 35%, 44% 100%, 30% 100%, 16% 30%)";
  return "polygon(15% 8%, 30% 0%, 70% 0%, 85% 8%, 100% 22%, 92% 32%, 80% 26%, 80% 100%, 20% 100%, 20% 26%, 8% 32%, 0% 22%)";
}

type Props = {
  product: Product;
  big?: boolean;
  scrollRoot?: React.RefObject<HTMLElement | null>;
};

export default function ProductCard({ product, big = false, scrollRoot }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [up, setUp] = useState(false);
  const { addItem } = useCart();
  const color = COLOR_MAP[product.colorKey] ?? "var(--cream-2)";
  const height = big ? 540 : 420;
  const vc = (product.visualConfig ?? {}) as Record<string, string | number>;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = scrollRoot?.current ?? null;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio > 0.55) setUp(true);
          else if (e.intersectionRatio < 0.25) setUp(false);
        });
      },
      { root, threshold: [0, 0.25, 0.55, 1] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [scrollRoot]);

  const handleAddToBag = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product.id, "M", product.colorKey);
  };

  return (
    <Link href={`/shop/${product.slug}`} style={{ textDecoration: "none" }}>
      <div ref={ref} style={{
        position: "relative",
        height,
        background: color,
        overflow: "hidden",
        cursor: "pointer",
      }}>
        {/* tinted background */}
        <div style={{ position: "absolute", inset: 0, background: color }}>
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "repeating-linear-gradient(90deg, transparent 0 4px, rgba(0,0,0,0.03) 4px 5px)",
          }} />
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(120% 80% at 30% 25%, rgba(255,255,255,0.45), transparent 60%)",
          }} />
          {/* hero image, or faint silhouette fallback */}
          {product.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.images[0].url}
              alt={product.images[0].label ?? product.name}
              style={{
                position: "absolute",
                left: `${50 + (product.images[0].offsetX ?? 0)}%`,
                top: `${50 + (product.images[0].offsetY ?? 0)}%`,
                transform: `translate(-50%, -50%) scale(${product.images[0].scale ?? 1})`,
                maxWidth: "92%",
                maxHeight: "92%",
                objectFit: "contain",
                pointerEvents: "none",
              }}
            />
          ) : (
            <div style={{
              position: "absolute",
              left: "50%",
              top: typeof vc.silhouetteTop === "number" ? `${vc.silhouetteTop}%` : "50%",
              transform: "translate(-50%, -50%)",
              width: "55%",
              aspectRatio: "0.7",
              background: "rgba(0,0,0,0.06)",
              clipPath: getSilhouettePath(product),
            }} />
          )}
          <div className="mono" style={{
            position: "absolute", bottom: 14, left: 18,
            fontSize: 9, letterSpacing: "0.14em",
            color: "rgba(255,255,255,0.7)",
            textTransform: "uppercase",
          }}>
            {product.tone} · {product.category}
          </div>
        </div>

        {/* price docked at bottom edge */}
        <div className="price-edge" style={{ opacity: up ? 0 : 1 }}>
          <span className="mono" style={{ fontSize: 10, letterSpacing: "0.14em" }}>
            {product.category.toUpperCase()}
          </span>
          <span className="serif" style={{ fontSize: 18 }}>${product.price}</span>
        </div>

        {/* slide-up reveal */}
        <div className={`reveal-panel${up ? " up" : ""}`}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: 12,
          }}>
            <h3 className="serif" style={{
              fontSize: 22,
              lineHeight: 1.1,
              margin: 0,
              color: "var(--ink)",
              fontWeight: 400,
              flex: 1,
            }}>
              {product.name}
            </h3>
            <span className="serif" style={{ fontSize: 20, color: "var(--ink)" }}>
              ${product.price}
            </span>
          </div>
          <p className="reveal-desc">{product.description}</p>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 10,
            borderTop: "1px solid var(--line)",
            fontFamily: "var(--mono)",
            fontSize: 9.5,
            letterSpacing: "0.16em",
            color: "var(--muted)",
          }}>
            <span>{product.tone.toUpperCase()}</span>
            <button
              onClick={handleAddToBag}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--mono)",
                fontSize: 9.5,
                letterSpacing: "0.16em",
                color: "var(--ink)",
                padding: 0,
              }}
            >
              ADD TO BAG →
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
