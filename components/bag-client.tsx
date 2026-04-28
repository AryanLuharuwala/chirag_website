"use client";

import { useCart } from "./cart-context";
import { useState } from "react";

const STRIPE_ENABLED = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const COLOR_MAP: Record<string, string> = {
  white: "var(--c-white)",
  sky:   "var(--c-sky)",
  red:   "var(--c-red)",
  sage:  "var(--c-sage)",
};

export default function BagClient() {
  const { items, count, total, removeItem, updateQty } = useCart();
  const [loading, setLoading] = useState(false);

  const shipping = total >= 150 ? 0 : 12;
  const tax = total * 0.08;
  const orderTotal = total + shipping + tax;

  const handleCheckout = async () => {
    if (!STRIPE_ENABLED) return;
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <section style={{
        padding: "80px 36px",
        background: "var(--cream)",
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
      }}>
        <h1 className="serif" style={{
          fontSize: 56,
          margin: 0,
          color: "var(--ink)",
          letterSpacing: "-0.02em",
          fontWeight: 400,
        }}>
          Your bag is empty.
        </h1>
        <p style={{
          fontFamily: "var(--sans)",
          fontSize: 14,
          color: "var(--muted)",
          marginTop: 16,
        }}>
          You haven&apos;t added anything yet.
        </p>
        <a href="/shop" style={{
          marginTop: 32,
          display: "inline-block",
          fontFamily: "var(--mono)",
          fontSize: 11,
          letterSpacing: "0.2em",
          color: "var(--ink)",
          textDecoration: "none",
          borderBottom: "1px solid var(--ink)",
          paddingBottom: 2,
        }}>
          SHOP NOW →
        </a>
      </section>
    );
  }

  return (
    <section style={{
      padding: "64px 36px",
      background: "var(--cream)",
      borderTop: "1px solid var(--line)",
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: 36,
      }}>
        <h1 className="serif" style={{
          fontSize: 56,
          margin: 0,
          color: "var(--ink)",
          letterSpacing: "-0.02em",
          fontWeight: 400,
        }}>
          Your bag.
        </h1>
        <span className="mono" style={{
          fontSize: 10,
          color: "var(--muted)",
          letterSpacing: "0.16em",
        }}>
          {count} PIECE{count !== 1 ? "S" : ""} · WRAPPED IN PAPER
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 40 }}>
        {/* Line items */}
        <div>
          {items.map((item) => (
            <div key={item.id} style={{
              display: "grid",
              gridTemplateColumns: "120px 1fr auto",
              gap: 24,
              padding: "20px 0",
              borderTop: "1px solid var(--line)",
              alignItems: "center",
            }}>
              <div style={{
                width: 120,
                height: 150,
                background: COLOR_MAP[item.colorKey] ?? "var(--cream-2)",
                position: "relative",
                overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute",
                  left: "50%", top: "50%",
                  transform: "translate(-50%,-50%)",
                  width: "60%",
                  aspectRatio: "0.7",
                  background: "rgba(0,0,0,0.06)",
                  clipPath: "polygon(15% 8%, 30% 0%, 70% 0%, 85% 8%, 100% 22%, 92% 32%, 80% 26%, 80% 100%, 20% 100%, 20% 26%, 8% 32%, 0% 22%)",
                }} />
              </div>
              <div>
                <div className="serif" style={{
                  fontSize: 22,
                  color: "var(--ink)",
                  fontWeight: 400,
                }}>
                  {item.product.name}
                </div>
                <div className="mono" style={{
                  fontSize: 10,
                  color: "var(--muted)",
                  marginTop: 6,
                  letterSpacing: "0.14em",
                }}>
                  {item.product.tone?.toUpperCase()} · SIZE {item.size} · QTY {item.quantity}
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
                  <button
                    onClick={() => updateQty(item.id, item.quantity + 1)}
                    className="mono"
                    style={{
                      fontSize: 10,
                      color: "var(--ink)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      textDecoration: "underline",
                      letterSpacing: "0.14em",
                    }}
                  >
                    +QTY
                  </button>
                  {item.quantity > 1 && (
                    <button
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                      className="mono"
                      style={{
                        fontSize: 10,
                        color: "var(--muted)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        letterSpacing: "0.14em",
                      }}
                    >
                      -QTY
                    </button>
                  )}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="mono"
                    style={{
                      fontSize: 10,
                      color: "var(--muted)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      letterSpacing: "0.14em",
                    }}
                  >
                    REMOVE
                  </button>
                </div>
              </div>
              <div className="serif" style={{ fontSize: 22, color: "var(--ink)" }}>
                ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
          <div style={{ borderTop: "1px solid var(--line)", height: 1 }} />
        </div>

        {/* Summary panel */}
        <div style={{
          background: "var(--paper)",
          padding: 28,
          alignSelf: "start",
          position: "sticky",
          top: 80,
          boxShadow: "0 1px 3px rgba(0,0,0,.08), 0 4px 16px rgba(0,0,0,.06)",
        }}>
          <div className="mono" style={{
            fontSize: 10,
            color: "var(--muted)",
            marginBottom: 16,
            letterSpacing: "0.16em",
          }}>
            SUMMARY
          </div>
          {[
            ["Subtotal", `$${total.toFixed(2)}`],
            ["Shipping", shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`],
            ["Tax (est.)", `$${tax.toFixed(2)}`],
          ].map(([k, v]) => (
            <div key={k} style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "12px 0",
              borderBottom: "1px solid var(--line)",
              fontFamily: "var(--sans)",
              fontSize: 14,
            }}>
              <span style={{ color: "var(--muted)" }}>{k}</span>
              <span style={{ color: "var(--ink)" }}>{v}</span>
            </div>
          ))}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "20px 0",
            alignItems: "baseline",
          }}>
            <span className="mono" style={{
              fontSize: 11,
              color: "var(--ink)",
              letterSpacing: "0.14em",
            }}>
              TOTAL
            </span>
            <span className="serif" style={{ fontSize: 32, color: "var(--ink)" }}>
              ${orderTotal.toFixed(2)}
            </span>
          </div>
          {STRIPE_ENABLED ? (
            <button
              onClick={handleCheckout}
              disabled={loading}
              style={{
                width: "100%",
                height: 54,
                background: "var(--ink)",
                color: "var(--cream)",
                border: "none",
                fontFamily: "var(--mono)",
                fontSize: 11,
                letterSpacing: "0.2em",
                cursor: loading ? "wait" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "REDIRECTING..." : "CHECKOUT →"}
            </button>
          ) : (
            <div>
              <div style={{
                width: "100%",
                height: 54,
                background: "var(--cream-2)",
                border: "1px solid var(--line)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--mono)",
                fontSize: 10,
                letterSpacing: "0.16em",
                color: "var(--muted)",
              }}>
                CHECKOUT UNAVAILABLE
              </div>
              <div className="mono" style={{
                fontSize: 9,
                color: "var(--muted)",
                textAlign: "center",
                marginTop: 10,
                letterSpacing: "0.12em",
                lineHeight: 1.5,
              }}>
                Payments not configured yet.{" "}
                <a href="/admin/settings" style={{ color: "var(--ink)", textDecoration: "underline" }}>
                  Add Stripe key in admin →
                </a>
              </div>
            </div>
          )}
          <div className="mono" style={{
            fontSize: 9.5,
            color: "var(--muted)",
            textAlign: "center",
            marginTop: 14,
            letterSpacing: "0.16em",
          }}>
            FREE RETURNS · 30 DAYS · CARBON NEUTRAL
          </div>
        </div>
      </div>
    </section>
  );
}
