"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "./cart-context";

const STRIPE_ENABLED = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const COLOR_MAP: Record<string, string> = {
  white: "var(--c-white)",
  sky:   "var(--c-sky)",
  red:   "var(--c-red)",
  sage:  "var(--c-sage)",
};

export default function CartDrawer() {
  const { items, count, total, drawerOpen, closeDrawer, removeItem, updateQty } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);

  // close on Escape
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, closeDrawer]);

  // lock body scroll while open
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [drawerOpen]);

  const handleCheckout = async () => {
    if (!STRIPE_ENABLED) return;
    setCheckingOut(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setCheckingOut(false);
    }
  };

  const shipping = total >= 150 ? 0 : 12;
  const tax = total * 0.08;
  const orderTotal = total + shipping + tax;

  return (
    <>
      {/* backdrop */}
      <div
        onClick={closeDrawer}
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(21, 20, 15, 0.4)",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
          opacity: drawerOpen ? 1 : 0,
          pointerEvents: drawerOpen ? "auto" : "none",
          transition: "opacity 320ms ease",
          zIndex: 90,
        }}
      />

      <aside
        role="dialog"
        aria-label="Shopping bag"
        aria-hidden={!drawerOpen}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(440px, 92vw)",
          background: "var(--paper)",
          color: "var(--ink)",
          transform: drawerOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 420ms cubic-bezier(0.2, 0.7, 0.1, 1)",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          boxShadow: "-24px 0 60px rgba(21,20,15,0.18)",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "20px 24px",
          borderBottom: "1px solid var(--line)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}>
          <div>
            <div className="mono" style={{
              fontSize: 9,
              color: "var(--muted)",
              letterSpacing: "0.2em",
              marginBottom: 4,
            }}>
              YOUR BAG · {count} ITEM{count === 1 ? "" : "S"}
            </div>
            <div className="serif" style={{ fontSize: 22, fontWeight: 400, letterSpacing: "-0.01em" }}>
              {count === 0 ? "Empty for now." : "Almost yours."}
            </div>
          </div>
          <button
            onClick={closeDrawer}
            aria-label="Close cart"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--mono)",
              fontSize: 11,
              letterSpacing: "0.2em",
              color: "var(--muted)",
              padding: 6,
            }}
          >
            CLOSE ✕
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflow: "auto", padding: "8px 24px" }}>
          {items.length === 0 ? (
            <div style={{
              padding: "48px 0",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 16,
            }}>
              <p style={{ fontFamily: "var(--sans)", fontSize: 14, color: "var(--muted)", margin: 0 }}>
                Nothing here yet.
              </p>
              <Link
                href="/shop"
                onClick={closeDrawer}
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                  letterSpacing: "0.2em",
                  color: "var(--ink)",
                  textDecoration: "none",
                  borderBottom: "1px solid var(--ink)",
                  paddingBottom: 2,
                }}
              >
                SHOP NOW →
              </Link>
            </div>
          ) : (
            items.map((it) => (
              <div
                key={it.id}
                style={{
                  display: "flex",
                  gap: 14,
                  padding: "16px 0",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <div style={{
                  width: 72,
                  height: 96,
                  background: COLOR_MAP[it.colorKey] ?? "var(--cream-2)",
                  flexShrink: 0,
                  position: "relative",
                  overflow: "hidden",
                }}>
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "radial-gradient(120% 80% at 30% 25%, rgba(255,255,255,0.45), transparent 60%)",
                  }} />
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      gap: 8,
                    }}>
                      <Link
                        href={`/shop/${it.product.slug}`}
                        onClick={closeDrawer}
                        className="serif"
                        style={{
                          fontSize: 16,
                          color: "var(--ink)",
                          textDecoration: "none",
                          fontWeight: 400,
                        }}
                      >
                        {it.product.name}
                      </Link>
                      <span className="serif" style={{ fontSize: 15, color: "var(--ink)" }}>
                        ${(parseFloat(it.product.price) * it.quantity).toFixed(2)}
                      </span>
                    </div>
                    <div className="mono" style={{
                      fontSize: 9,
                      color: "var(--muted)",
                      marginTop: 4,
                      letterSpacing: "0.14em",
                    }}>
                      SIZE {it.size} · {it.product.tone.toUpperCase()}
                    </div>
                  </div>

                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: 6,
                  }}>
                    <div style={{
                      display: "inline-flex",
                      border: "1px solid var(--line)",
                    }}>
                      <button
                        onClick={() => updateQty(it.id, Math.max(1, it.quantity - 1))}
                        aria-label="Decrease quantity"
                        style={qtyBtn}
                      >−</button>
                      <span style={{
                        width: 28,
                        textAlign: "center",
                        fontFamily: "var(--mono)",
                        fontSize: 11,
                        alignSelf: "center",
                      }}>
                        {it.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(it.id, it.quantity + 1)}
                        aria-label="Increase quantity"
                        style={qtyBtn}
                      >+</button>
                    </div>
                    <button
                      onClick={() => removeItem(it.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "var(--mono)",
                        fontSize: 9,
                        letterSpacing: "0.18em",
                        color: "var(--muted)",
                        textDecoration: "underline",
                      }}
                    >
                      REMOVE
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{
            padding: "20px 24px 24px",
            borderTop: "1px solid var(--line)",
            background: "var(--paper)",
            flexShrink: 0,
          }}>
            <Row label="Subtotal" value={`$${total.toFixed(2)}`} />
            <Row
              label="Shipping"
              value={shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
            />
            <Row label="Tax (est.)" value={`$${tax.toFixed(2)}`} />
            <Row label="Total" value={`$${orderTotal.toFixed(2)}`} bold />

            <button
              onClick={handleCheckout}
              disabled={checkingOut || !STRIPE_ENABLED}
              style={{
                marginTop: 18,
                width: "100%",
                height: 52,
                background: STRIPE_ENABLED ? "var(--ink)" : "var(--muted)",
                color: "var(--cream)",
                border: "none",
                fontFamily: "var(--mono)",
                fontSize: 11,
                letterSpacing: "0.2em",
                cursor: STRIPE_ENABLED && !checkingOut ? "pointer" : "not-allowed",
              }}
            >
              {checkingOut
                ? "REDIRECTING…"
                : STRIPE_ENABLED
                ? `CHECKOUT · $${orderTotal.toFixed(2)}`
                : "CHECKOUT UNAVAILABLE"}
            </button>

            <Link
              href="/bag"
              onClick={closeDrawer}
              style={{
                display: "block",
                textAlign: "center",
                marginTop: 12,
                fontFamily: "var(--mono)",
                fontSize: 10,
                letterSpacing: "0.18em",
                color: "var(--muted)",
                textDecoration: "underline",
              }}
            >
              VIEW FULL BAG
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}

function Row({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "6px 0",
      fontFamily: bold ? "var(--serif)" : "var(--sans)",
      fontSize: bold ? 18 : 13,
      color: bold ? "var(--ink)" : "var(--muted)",
    }}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

const qtyBtn: React.CSSProperties = {
  width: 28,
  height: 28,
  background: "none",
  border: "none",
  cursor: "pointer",
  fontFamily: "var(--sans)",
  fontSize: 14,
  color: "var(--ink)",
};
