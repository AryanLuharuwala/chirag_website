"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "./cart-context";
import type { ProductImage } from "@/lib/db/schema";

const COLOR_MAP: Record<string, string> = {
  white: "var(--c-white)",
  sky:   "var(--c-sky)",
  red:   "var(--c-red)",
  sage:  "var(--c-sage)",
};

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

type DBProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: string;
  colorKey: "white" | "sky" | "red" | "sage";
  tone: string;
  description: string;
  images?: ProductImage[];
};

export default function ProductDetailClient({ product }: { product: DBProduct }) {
  const images = Array.isArray(product.images) ? product.images : [];
  const [activeIdx, setActiveIdx] = useState(0);
  const main: ProductImage | undefined = images[activeIdx] ?? images[0];
  const [selectedSize, setSize] = useState("M");
  const [selectedColor, setColor] = useState<string>(product.colorKey);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const handleAddToBag = async () => {
    await addItem(product.id, selectedSize, selectedColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <section style={{
      background: "var(--paper)",
      padding: "64px 36px",
      borderTop: "1px solid var(--line)",
    }}>
      <div className="mono" style={{
        fontSize: 10,
        color: "var(--muted)",
        marginBottom: 24,
        letterSpacing: "0.16em",
      }}>
        SHOP · {product.category.toUpperCase()} · {product.name.toUpperCase()}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 48 }}>
        {/* Image stack */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="ph" style={{
            aspectRatio: "0.78",
            height: "auto",
            background: COLOR_MAP[product.colorKey],
            color: "rgba(255,255,255,0.9)",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", inset: 0,
              background: "radial-gradient(140% 90% at 30% 20%, rgba(255,255,255,0.4), transparent 60%)",
            }} />
            {main ? (
              <div style={{
                position: "absolute",
                left: `${50 + (main.offsetX ?? 0)}%`,
                top: `${50 + (main.offsetY ?? 0)}%`,
                transform: `translate(-50%, -50%) scale(${main.scale ?? 1})`,
                width: "92%",
                height: "92%",
                pointerEvents: "none",
              }}>
                <Image
                  src={main.url}
                  alt={main.label ?? product.name}
                  fill
                  priority
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  style={{ objectFit: "contain" }}
                />
              </div>
            ) : (
              <div className="ph-label" style={{
                background: "rgba(0,0,0,0.4)",
                color: "rgba(255,255,255,0.95)",
              }}>
                HERO · ON FIGURE · 4:5
              </div>
            )}
            {main?.label && (
              <div className="ph-label" style={{
                background: "rgba(0,0,0,0.4)",
                color: "rgba(255,255,255,0.95)",
              }}>
                {main.label.toUpperCase()}
              </div>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {[0, 1, 2].map((slotIdx) => {
              const altIdx = slotIdx + 1;
              const alt = images[altIdx];
              const fallbackLabel = ["DETAIL · STITCH", "BACK · LAY FLAT", "FABRIC · MACRO"][slotIdx];
              if (alt) {
                const isActive = activeIdx === altIdx;
                return (
                  <button
                    key={altIdx}
                    onClick={() => setActiveIdx(altIdx)}
                    className="ph"
                    style={{
                      aspectRatio: "1",
                      height: "auto",
                      background: COLOR_MAP[product.colorKey],
                      position: "relative",
                      overflow: "hidden",
                      padding: 0,
                      border: isActive ? "2px solid var(--ink)" : "1px solid var(--line)",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "radial-gradient(140% 90% at 30% 20%, rgba(255,255,255,0.4), transparent 60%)",
                    }} />
                    <div style={{
                      position: "absolute",
                      left: `${50 + (alt.offsetX ?? 0)}%`,
                      top: `${50 + (alt.offsetY ?? 0)}%`,
                      transform: `translate(-50%, -50%) scale(${alt.scale ?? 1})`,
                      width: "92%",
                      height: "92%",
                    }}>
                      <Image
                        src={alt.url}
                        alt={alt.label ?? ""}
                        fill
                        sizes="(min-width: 1024px) 20vw, 33vw"
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                    {alt.label && (
                      <div className="ph-label" style={{
                        background: "rgba(0,0,0,0.45)",
                        color: "rgba(255,255,255,0.95)",
                      }}>
                        {alt.label.toUpperCase()}
                      </div>
                    )}
                  </button>
                );
              }
              return (
                <div key={slotIdx} className="ph" style={{
                  aspectRatio: "1",
                  height: "auto",
                  background: slotIdx === 1 ? COLOR_MAP[product.colorKey] : "var(--cream-2)",
                }}>
                  <div className="ph-label">{fallbackLabel}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Meta — sticky */}
        <div style={{ position: "sticky", top: 80, alignSelf: "start" }}>
          <h1 className="serif" style={{
            fontSize: 56,
            lineHeight: 0.95,
            letterSpacing: "-0.025em",
            margin: 0,
            color: "var(--ink)",
            fontWeight: 400,
          }}>
            {product.name}
          </h1>

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 22,
            paddingBottom: 22,
            borderBottom: "1px solid var(--line)",
          }}>
            <span className="serif" style={{ fontSize: 28, color: "var(--ink)" }}>
              ${product.price}
            </span>
            <span className="mono" style={{
              fontSize: 10,
              color: "var(--muted)",
              alignSelf: "center",
              letterSpacing: "0.14em",
            }}>
              {product.tone.toUpperCase()}
            </span>
          </div>

          <p className="serif" style={{
            fontSize: 17,
            lineHeight: 1.5,
            color: "var(--ink-2)",
            marginTop: 22,
            fontWeight: 400,
          }}>
            {product.description}
          </p>

          {/* Color row */}
          <div style={{ marginTop: 28 }}>
            <div className="mono" style={{
              fontSize: 10,
              color: "var(--muted)",
              marginBottom: 10,
              letterSpacing: "0.14em",
            }}>
              COLOR · 4 OPTIONS
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {(["white", "sky", "red", "sage"] as const).map((c) => (
                <button key={c} onClick={() => setColor(c)} style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: COLOR_MAP[c],
                  border: selectedColor === c ? "1.5px solid var(--ink)" : "1px solid var(--line)",
                  outline: selectedColor === c ? "4px solid var(--paper)" : "none",
                  outlineOffset: -6,
                  cursor: "pointer",
                }} />
              ))}
            </div>
          </div>

          {/* Size row */}
          <div style={{ marginTop: 24 }}>
            <div className="mono" style={{
              fontSize: 10,
              color: "var(--muted)",
              marginBottom: 10,
              display: "flex",
              justifyContent: "space-between",
              letterSpacing: "0.14em",
            }}>
              <span>SIZE</span>
              <span style={{ textDecoration: "underline", cursor: "pointer" }}>SIZE GUIDE</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
              {SIZES.map((s) => (
                <button key={s} onClick={() => setSize(s)} style={{
                  height: 38,
                  border: `1px solid ${s === selectedSize ? "var(--ink)" : "var(--line)"}`,
                  background: s === selectedSize ? "var(--ink)" : "transparent",
                  color: s === selectedSize ? "var(--cream)" : "var(--ink)",
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  cursor: "pointer",
                }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* CTA */}
          <button onClick={handleAddToBag} style={{
            marginTop: 24,
            width: "100%",
            height: 54,
            background: added ? "var(--muted)" : "var(--ink)",
            color: "var(--cream)",
            border: "none",
            fontFamily: "var(--mono)",
            fontSize: 11,
            letterSpacing: "0.2em",
            cursor: "pointer",
            transition: "background 300ms",
          }}>
            {added ? "ADDED ✓" : `ADD TO BAG · $${product.price}`}
          </button>

          {/* Meta rows */}
          <div style={{ marginTop: 32 }}>
            {[
              ["Composition", "100% plant-dyed cotton twill"],
              ["Made in", "Porto, Portugal"],
              ["Care", "Cold wash, line dry, iron warm"],
              ["Shipping", "Carbon neutral · 3–5 days"],
            ].map(([k, v]) => (
              <div key={k} style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "14px 0",
                borderBottom: "1px solid var(--line)",
              }}>
                <span className="mono" style={{
                  fontSize: 10,
                  color: "var(--muted)",
                  letterSpacing: "0.14em",
                }}>
                  {k.toUpperCase()}
                </span>
                <span style={{
                  fontFamily: "var(--sans)",
                  fontSize: 13,
                  color: "var(--ink)",
                }}>
                  {v}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
