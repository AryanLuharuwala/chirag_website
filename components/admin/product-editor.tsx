"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: string;
  colorKey: "white" | "sky" | "red" | "sage";
  tone: string;
  description: string;
  inStock: boolean;
  position: number;
  visualConfig: Record<string, unknown>;
};

const COLOR_MAP: Record<string, string> = {
  white: "#FBFAF6",
  sky:   "oklch(82% 0.06 230)",
  red:   "oklch(60% 0.16 28)",
  sage:  "oklch(78% 0.05 145)",
};

const COLOR_HEX: Record<string, string> = {
  white: "#FBFAF6",
  sky:   "#B8D8E8",
  red:   "#C17060",
  sage:  "#A8C4A8",
};

function getSilhouettePath(p: Product) {
  if (p.category === "Kids")
    return "polygon(15% 5%, 85% 5%, 90% 35%, 75% 80%, 60% 80%, 50% 40%, 40% 80%, 25% 80%, 10% 35%)";
  if (p.name.includes("Dress") || p.name.includes("Romper"))
    return "polygon(28% 5%, 40% 0%, 60% 0%, 72% 5%, 78% 22%, 95% 100%, 5% 100%, 22% 22%)";
  if (p.name.includes("Trouser") || p.name.includes("Short"))
    return "polygon(20% 0%, 80% 0%, 84% 30%, 70% 100%, 56% 100%, 50% 35%, 44% 100%, 30% 100%, 16% 30%)";
  return "polygon(15% 8%, 30% 0%, 70% 0%, 85% 8%, 100% 22%, 92% 32%, 80% 26%, 80% 100%, 20% 100%, 20% 26%, 8% 32%, 0% 22%)";
}

function CardPreview({ product, scale = 1 }: { product: Product; scale?: number }) {
  const vc = product.visualConfig ?? {};
  const silTop = typeof vc.silhouetteTop === "number" ? vc.silhouetteTop : 50;
  const color = COLOR_MAP[product.colorKey];

  return (
    <div style={{
      position: "relative",
      height: 340 * scale,
      width: 240 * scale,
      background: color,
      overflow: "hidden",
      flexShrink: 0,
    }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "repeating-linear-gradient(90deg, transparent 0 4px, rgba(0,0,0,0.03) 4px 5px)",
      }} />
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(120% 80% at 30% 25%, rgba(255,255,255,0.45), transparent 60%)",
      }} />
      {/* silhouette at adjustable Y position */}
      <div style={{
        position: "absolute",
        left: "50%",
        top: `${silTop}%`,
        transform: "translate(-50%, -50%)",
        width: "55%",
        aspectRatio: "0.7",
        background: "rgba(0,0,0,0.06)",
        clipPath: getSilhouettePath(product),
      }} />
      {/* price docked */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: `${14 * scale}px ${22 * scale}px`,
        display: "flex",
        justifyContent: "space-between",
        fontFamily: "var(--mono)",
        fontSize: 10 * scale,
        letterSpacing: "0.16em",
        color: "rgba(255,255,255,0.85)",
      }}>
        <span>{product.category.toUpperCase()}</span>
        <span style={{ fontFamily: "var(--serif)", fontSize: 18 * scale }}>${product.price}</span>
      </div>
      {/* reveal panel — always visible in admin */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        background: "var(--paper)",
        padding: `${14 * scale}px ${18 * scale}px ${12 * scale}px`,
        transform: `translateY(calc(100% - ${56 * scale}px))`,
        transition: "transform 700ms cubic-bezier(0.2,0.7,0.1,1)",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}>
          <span style={{
            fontFamily: "var(--serif)",
            fontSize: 16 * scale,
            color: "var(--ink)",
            fontWeight: 400,
          }}>
            {product.name}
          </span>
          <span style={{
            fontFamily: "var(--serif)",
            fontSize: 15 * scale,
            color: "var(--ink)",
          }}>
            ${product.price}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function AdminProductEditor() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Product | null>(null);
  const [draft, setDraft] = useState<Partial<Product>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data);
        if (data.length) {
          setSelected(data[0]);
          setDraft(data[0]);
        }
      });
  }, []);

  const selectProduct = (p: Product) => {
    setSelected(p);
    setDraft({ ...p });
    setSaved(false);
  };

  const updateDraft = (field: keyof Product, value: unknown) => {
    setDraft((d) => ({ ...d, [field]: value }));
  };

  const updateVisualConfig = (key: string, value: unknown) => {
    setDraft((d) => ({
      ...d,
      visualConfig: { ...(d.visualConfig ?? {}), [key]: value },
    }));
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    const res = await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selected.id, ...draft }),
    });
    const updated = await res.json();
    setProducts((ps) => ps.map((p) => (p.id === updated.id ? updated : p)));
    setSelected(updated);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const live = selected ? { ...selected, ...draft } as Product : null;
  const filtered = filter === "All" ? products : products.filter((p) => p.category === filter);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      background: "var(--ink)",
      color: "var(--cream)",
    }}>
      {/* Admin nav */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 24px",
        borderBottom: "1px solid rgba(244,239,230,0.12)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Link href="/admin" style={{
            fontFamily: "var(--mono)",
            fontSize: 10,
            color: "var(--muted)",
            textDecoration: "none",
            letterSpacing: "0.14em",
          }}>
            ← DASHBOARD
          </Link>
          <span className="serif" style={{ fontSize: 18, color: "var(--cream)", fontWeight: 400 }}>
            Product Editor
          </span>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Link href="/shop" target="_blank" style={{
            fontFamily: "var(--mono)",
            fontSize: 10,
            color: "var(--muted)",
            textDecoration: "none",
            letterSpacing: "0.14em",
          }}>
            VIEW STORE ↗
          </Link>
          <button onClick={save} disabled={saving} style={{
            height: 36,
            padding: "0 20px",
            background: saved ? "rgba(168,196,168,0.3)" : "rgba(244,239,230,0.12)",
            border: "1px solid rgba(244,239,230,0.2)",
            color: "var(--cream)",
            fontFamily: "var(--mono)",
            fontSize: 10,
            letterSpacing: "0.16em",
            cursor: saving ? "wait" : "pointer",
          }}>
            {saving ? "SAVING..." : saved ? "SAVED ✓" : "SAVE CHANGES"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* LEFT: product list */}
        <div style={{
          width: 240,
          borderRight: "1px solid rgba(244,239,230,0.12)",
          overflow: "auto",
          flexShrink: 0,
        }}>
          {/* Filter */}
          <div style={{
            padding: "12px 16px",
            borderBottom: "1px solid rgba(244,239,230,0.08)",
            display: "flex",
            gap: 10,
          }}>
            {["All", "Women", "Men", "Kids"].map((f) => (
              <button key={f} onClick={() => setFilter(f)} style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--mono)",
                fontSize: 9,
                letterSpacing: "0.14em",
                color: filter === f ? "var(--cream)" : "var(--muted)",
                borderBottom: filter === f ? "1px solid var(--cream)" : "1px solid transparent",
                paddingBottom: 2,
                padding: "0 0 2px",
              }}>
                {f.toUpperCase()}
              </button>
            ))}
          </div>

          {filtered.map((p) => (
            <button key={p.id} onClick={() => selectProduct(p)} style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              width: "100%",
              padding: "12px 16px",
              background: selected?.id === p.id ? "rgba(244,239,230,0.08)" : "none",
              border: "none",
              borderBottom: "1px solid rgba(244,239,230,0.06)",
              cursor: "pointer",
              textAlign: "left",
            }}>
              <div style={{
                width: 32,
                height: 40,
                background: COLOR_MAP[p.colorKey],
                flexShrink: 0,
              }} />
              <div>
                <div style={{
                  fontFamily: "var(--sans)",
                  fontSize: 12,
                  color: "var(--cream)",
                  lineHeight: 1.3,
                }}>
                  {p.name}
                </div>
                <div className="mono" style={{
                  fontSize: 9,
                  color: "var(--muted)",
                  marginTop: 3,
                  letterSpacing: "0.12em",
                }}>
                  {p.category} · ${p.price}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* CENTER: live preview */}
        <div style={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 48,
          background: "#1A1813",
        }}>
          {live && (
            <>
              <div className="mono" style={{
                fontSize: 9,
                color: "var(--muted)",
                marginBottom: 20,
                letterSpacing: "0.2em",
              }}>
                LIVE PREVIEW · CLICK CARD BELOW TO EDIT
              </div>

              {/* Grid preview showing 3 cards */}
              <div style={{ display: "flex", gap: 16 }}>
                {[0.6, 1, 0.6].map((s, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      const idx = products.indexOf(selected!);
                      const neighbor = products[idx + i - 1] ?? products[0];
                      if (i === 1) return;
                      selectProduct(neighbor);
                    }}
                    style={{ cursor: i !== 1 ? "pointer" : "default", opacity: i !== 1 ? 0.5 : 1 }}
                  >
                    <CardPreview product={i === 1 ? live : (products[products.indexOf(selected!) + i - 1] ?? live)} scale={i === 1 ? 1 : 0.7} />
                  </div>
                ))}
              </div>

              <div className="mono" style={{
                marginTop: 20,
                fontSize: 9,
                color: "var(--muted)",
                letterSpacing: "0.14em",
              }}>
                {live.name} · {live.category} · ${live.price}
              </div>
            </>
          )}
        </div>

        {/* RIGHT: edit panel */}
        {live && (
          <div style={{
            width: 320,
            borderLeft: "1px solid rgba(244,239,230,0.12)",
            overflow: "auto",
            padding: "20px 20px",
            flexShrink: 0,
          }}>
            <div className="mono" style={{
              fontSize: 9,
              color: "var(--muted)",
              marginBottom: 20,
              letterSpacing: "0.18em",
            }}>
              EDIT PRODUCT
            </div>

            {/* Name */}
            <Label>NAME</Label>
            <input
              value={draft.name ?? ""}
              onChange={(e) => updateDraft("name", e.target.value)}
              style={adminInput}
            />

            {/* Price */}
            <Label>PRICE (USD)</Label>
            <input
              type="number"
              step="0.01"
              value={draft.price ?? ""}
              onChange={(e) => updateDraft("price", e.target.value)}
              style={adminInput}
            />

            {/* Description */}
            <Label>DESCRIPTION</Label>
            <textarea
              value={draft.description ?? ""}
              onChange={(e) => updateDraft("description", e.target.value)}
              rows={4}
              style={{ ...adminInput, height: "auto", resize: "vertical", padding: 10 }}
            />

            {/* Color key */}
            <Label>COLOR BLOCK</Label>
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              {(["white", "sky", "red", "sage"] as const).map((c) => (
                <button key={c} onClick={() => updateDraft("colorKey", c)} style={{
                  width: 36,
                  height: 36,
                  background: COLOR_HEX[c],
                  border: draft.colorKey === c
                    ? "2px solid var(--cream)"
                    : "1px solid rgba(244,239,230,0.2)",
                  cursor: "pointer",
                  borderRadius: 2,
                }} title={c} />
              ))}
            </div>

            {/* Silhouette vertical position */}
            <Label>
              SILHOUETTE POSITION — {typeof draft.visualConfig?.silhouetteTop === "number" ? draft.visualConfig.silhouetteTop : 50}%
            </Label>
            <input
              type="range"
              min={20}
              max={85}
              step={1}
              value={typeof draft.visualConfig?.silhouetteTop === "number" ? draft.visualConfig.silhouetteTop as number : 50}
              onChange={(e) => updateVisualConfig("silhouetteTop", parseInt(e.target.value))}
              style={{ width: "100%", marginBottom: 20, accentColor: "var(--cream)" }}
            />

            {/* Divider */}
            <div style={{
              borderTop: "1px solid rgba(244,239,230,0.12)",
              marginBottom: 16,
            }} />

            {/* Category */}
            <Label>CATEGORY</Label>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {["Women", "Men", "Kids"].map((cat) => (
                <button key={cat} onClick={() => updateDraft("category", cat)} style={{
                  flex: 1,
                  height: 32,
                  background: draft.category === cat ? "rgba(244,239,230,0.15)" : "none",
                  border: `1px solid ${draft.category === cat ? "rgba(244,239,230,0.4)" : "rgba(244,239,230,0.12)"}`,
                  color: draft.category === cat ? "var(--cream)" : "var(--muted)",
                  fontFamily: "var(--mono)",
                  fontSize: 9,
                  letterSpacing: "0.14em",
                  cursor: "pointer",
                }}>
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Tone label */}
            <Label>COLOR TONE LABEL</Label>
            <input
              value={draft.tone ?? ""}
              onChange={(e) => updateDraft("tone", e.target.value)}
              style={adminInput}
              placeholder="e.g. Crisp White"
            />

            {/* In stock */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}>
              <Label style={{ margin: 0 }}>IN STOCK</Label>
              <button onClick={() => updateDraft("inStock", !draft.inStock)} style={{
                width: 44,
                height: 24,
                background: draft.inStock ? "rgba(168,196,168,0.4)" : "rgba(244,239,230,0.1)",
                border: "1px solid rgba(244,239,230,0.2)",
                borderRadius: 12,
                cursor: "pointer",
                position: "relative",
              }}>
                <div style={{
                  position: "absolute",
                  top: 3,
                  left: draft.inStock ? 22 : 3,
                  width: 16,
                  height: 16,
                  background: draft.inStock ? "#A8C4A8" : "var(--muted)",
                  borderRadius: "50%",
                  transition: "left 200ms",
                }} />
              </button>
            </div>

            {/* Save button */}
            <button onClick={save} disabled={saving} style={{
              width: "100%",
              height: 46,
              background: saved ? "rgba(168,196,168,0.25)" : "rgba(244,239,230,0.12)",
              border: "1px solid rgba(244,239,230,0.2)",
              color: "var(--cream)",
              fontFamily: "var(--mono)",
              fontSize: 10,
              letterSpacing: "0.18em",
              cursor: saving ? "wait" : "pointer",
            }}>
              {saving ? "SAVING..." : saved ? "SAVED ✓" : "SAVE PRODUCT"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Label({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="mono" style={{
      fontSize: 9,
      color: "var(--muted)",
      letterSpacing: "0.16em",
      marginBottom: 8,
      ...style,
    }}>
      {children}
    </div>
  );
}

const adminInput: React.CSSProperties = {
  width: "100%",
  height: 38,
  padding: "0 10px",
  background: "rgba(244,239,230,0.06)",
  border: "1px solid rgba(244,239,230,0.14)",
  color: "var(--cream)",
  fontFamily: "var(--sans)",
  fontSize: 13,
  outline: "none",
  marginBottom: 16,
};
