"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { upload } from "@vercel/blob/client";
import type { ProductImage } from "@/lib/db/schema";

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
  images: ProductImage[];
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
  const hero = product.images?.[0];

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
      {hero ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={hero.url}
          alt=""
          style={{
            position: "absolute",
            left: `${50 + (hero.offsetX ?? 0)}%`,
            top: `${50 + (hero.offsetY ?? 0)}%`,
            transform: `translate(-50%, -50%) scale(${hero.scale ?? 1})`,
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
          top: `${silTop}%`,
          transform: "translate(-50%, -50%)",
          width: "55%",
          aspectRatio: "0.7",
          background: "rgba(0,0,0,0.06)",
          clipPath: getSilhouettePath(product),
        }} />
      )}
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

function ImageManager({
  images,
  onChange,
  productId,
  cardColor,
}: {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  productId: string;
  cardColor: string;
}) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [bgWorking, setBgWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const sel = images[selectedIdx];

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const blob = await upload(`products/${productId}/${Date.now()}.${ext}`, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
      });
      const newImg: ProductImage = {
        id: crypto.randomUUID(),
        url: blob.url,
        originalUrl: blob.url,
        role: images.length === 0 ? "hero" : "alt",
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        bgRemoved: false,
      };
      onChange([...images, newImg]);
      setSelectedIdx(images.length);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleBackgroundRemove = async () => {
    if (!sel) return;
    setError(null);
    setBgWorking(true);
    try {
      const { removeBackground } = await import("@imgly/background-removal");
      // run BG removal against the original to allow re-running cleanly
      const cutoutBlob = await removeBackground(sel.originalUrl);
      const file = new File([cutoutBlob], "cutout.png", { type: "image/png" });
      const blob = await upload(
        `products/${productId}/cutout-${Date.now()}.png`,
        file,
        { access: "public", handleUploadUrl: "/api/admin/upload" }
      );
      updateField("url", blob.url);
      updateField("bgRemoved", true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Background removal failed");
    } finally {
      setBgWorking(false);
    }
  };

  const useOriginal = () => {
    if (!sel) return;
    const updated = [...images];
    updated[selectedIdx] = { ...sel, url: sel.originalUrl, bgRemoved: false };
    onChange(updated);
  };

  function updateField<K extends keyof ProductImage>(key: K, value: ProductImage[K]) {
    if (!sel) return;
    const updated = [...images];
    updated[selectedIdx] = { ...sel, [key]: value };
    onChange(updated);
  }

  const deleteImage = () => {
    if (!sel) return;
    const updated = images.filter((_, i) => i !== selectedIdx);
    onChange(updated);
    setSelectedIdx(Math.max(0, selectedIdx - 1));
  };

  const moveImage = (dir: -1 | 1) => {
    const newIdx = selectedIdx + dir;
    if (newIdx < 0 || newIdx >= images.length) return;
    const updated = [...images];
    [updated[selectedIdx], updated[newIdx]] = [updated[newIdx], updated[selectedIdx]];
    onChange(updated);
    setSelectedIdx(newIdx);
  };

  return (
    <>
      <Label>VIEWS — FIRST IS HERO</Label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 12 }}>
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setSelectedIdx(i)}
            style={{
              aspectRatio: "1",
              background: `${cardColor} url(${img.url}) center / contain no-repeat`,
              border: i === selectedIdx ? "2px solid var(--cream)" : "1px solid rgba(244,239,230,0.14)",
              cursor: "pointer",
              position: "relative",
              padding: 0,
            }}
            title={img.role ?? "alt"}
          >
            {i === 0 && (
              <span
                className="mono"
                style={{
                  position: "absolute",
                  bottom: 2,
                  left: 2,
                  fontSize: 7,
                  color: "var(--cream)",
                  background: "rgba(0,0,0,0.6)",
                  padding: "1px 4px",
                  letterSpacing: "0.12em",
                }}
              >
                HERO
              </span>
            )}
          </button>
        ))}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{
            aspectRatio: "1",
            background: "rgba(244,239,230,0.06)",
            border: "1px dashed rgba(244,239,230,0.3)",
            color: "var(--muted)",
            cursor: uploading ? "wait" : "pointer",
            fontFamily: "var(--mono)",
            fontSize: 9,
            letterSpacing: "0.14em",
          }}
        >
          {uploading ? "..." : "+ ADD"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
      </div>

      {error && (
        <div className="mono" style={{ fontSize: 9, color: "#C17060", marginBottom: 12, letterSpacing: "0.14em" }}>
          {error.toUpperCase()}
        </div>
      )}

      {sel && (
        <div style={{ background: "rgba(244,239,230,0.04)", padding: 12, marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            <button onClick={() => moveImage(-1)} disabled={selectedIdx === 0} style={miniBtn}>← MOVE</button>
            <button onClick={() => moveImage(1)} disabled={selectedIdx === images.length - 1} style={miniBtn}>MOVE →</button>
            <button onClick={deleteImage} style={{ ...miniBtn, color: "#C17060", borderColor: "rgba(193,112,96,0.4)" }}>DELETE</button>
          </div>

          <Label>ROLE</Label>
          <select
            value={sel.role ?? "alt"}
            onChange={(e) => updateField("role", e.target.value as ProductImage["role"])}
            style={{ ...adminInput, height: 32 }}
          >
            <option value="hero">Hero</option>
            <option value="detail">Detail</option>
            <option value="back">Back</option>
            <option value="fabric">Fabric</option>
            <option value="alt">Alt</option>
          </select>

          <Label>CAPTION</Label>
          <input
            value={sel.label ?? ""}
            onChange={(e) => updateField("label", e.target.value)}
            style={{ ...adminInput, height: 32 }}
            placeholder="e.g. Detail · Stitch"
          />

          <Label>SCALE — {(sel.scale ?? 1).toFixed(2)}</Label>
          <input
            type="range"
            min={0.3}
            max={2}
            step={0.05}
            value={sel.scale ?? 1}
            onChange={(e) => updateField("scale", parseFloat(e.target.value))}
            style={{ width: "100%", marginBottom: 12, accentColor: "var(--cream)" }}
          />

          <Label>OFFSET Y — {sel.offsetY ?? 0}</Label>
          <input
            type="range"
            min={-50}
            max={50}
            step={1}
            value={sel.offsetY ?? 0}
            onChange={(e) => updateField("offsetY", parseInt(e.target.value))}
            style={{ width: "100%", marginBottom: 12, accentColor: "var(--cream)" }}
          />

          <Label>OFFSET X — {sel.offsetX ?? 0}</Label>
          <input
            type="range"
            min={-50}
            max={50}
            step={1}
            value={sel.offsetX ?? 0}
            onChange={(e) => updateField("offsetX", parseInt(e.target.value))}
            style={{ width: "100%", marginBottom: 12, accentColor: "var(--cream)" }}
          />

          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={handleBackgroundRemove} disabled={bgWorking} style={{ ...miniBtn, flex: 1, height: 32 }}>
              {bgWorking ? "REMOVING…" : sel.bgRemoved ? "RE-RUN BG REMOVE" : "REMOVE BG"}
            </button>
            {sel.bgRemoved && (
              <button onClick={useOriginal} style={{ ...miniBtn, flex: 1, height: 32 }}>USE ORIGINAL</button>
            )}
          </div>
        </div>
      )}
    </>
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
        const normalized: Product[] = (data ?? []).map((p: Product) => ({
          ...p,
          images: Array.isArray(p.images) ? p.images : [],
        }));
        setProducts(normalized);
        if (normalized.length) {
          setSelected(normalized[0]);
          setDraft(normalized[0]);
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
    const normalized: Product = { ...updated, images: Array.isArray(updated.images) ? updated.images : [] };
    setProducts((ps) => ps.map((p) => (p.id === normalized.id ? normalized : p)));
    setSelected(normalized);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const live = selected ? ({ ...selected, ...draft, images: draft.images ?? selected.images ?? [] } as Product) : null;
  const filtered = filter === "All" ? products : products.filter((p) => p.category === filter);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      background: "var(--ink)",
      color: "var(--cream)",
    }}>
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
        <div style={{
          width: 240,
          borderRight: "1px solid rgba(244,239,230,0.12)",
          overflow: "auto",
          flexShrink: 0,
        }}>
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
                background: p.images?.[0]?.url
                  ? `${COLOR_MAP[p.colorKey]} url(${p.images[0].url}) center / contain no-repeat`
                  : COLOR_MAP[p.colorKey],
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
                  {p.category} · ${p.price} · {p.images?.length ?? 0} view{(p.images?.length ?? 0) === 1 ? "" : "s"}
                </div>
              </div>
            </button>
          ))}
        </div>

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
                LIVE PREVIEW · CARD ON LEFT/RIGHT JUMPS TO NEIGHBOR
              </div>

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
                    <CardPreview
                      product={i === 1 ? live : (products[products.indexOf(selected!) + i - 1] ?? live)}
                      scale={i === 1 ? 1 : 0.7}
                    />
                  </div>
                ))}
              </div>

              {/* Detail-page thumb strip showing all views */}
              {(live.images?.length ?? 0) > 1 && (
                <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
                  {live.images.slice(0, 4).map((img) => (
                    <div
                      key={img.id}
                      style={{
                        width: 80,
                        height: 80,
                        background: `${COLOR_MAP[live.colorKey]} url(${img.url}) center / contain no-repeat`,
                        border: "1px solid rgba(244,239,230,0.16)",
                      }}
                      title={img.label || img.role || "alt"}
                    />
                  ))}
                </div>
              )}

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

        {live && (
          <div style={{
            width: 340,
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

            <ImageManager
              images={live.images ?? []}
              onChange={(imgs) => updateDraft("images", imgs)}
              productId={live.id}
              cardColor={COLOR_MAP[live.colorKey]}
            />

            <div style={{ borderTop: "1px solid rgba(244,239,230,0.12)", marginBottom: 16 }} />

            <Label>NAME</Label>
            <input
              value={draft.name ?? ""}
              onChange={(e) => updateDraft("name", e.target.value)}
              style={adminInput}
            />

            <Label>PRICE (USD)</Label>
            <input
              type="number"
              step="0.01"
              value={draft.price ?? ""}
              onChange={(e) => updateDraft("price", e.target.value)}
              style={adminInput}
            />

            <Label>DESCRIPTION</Label>
            <textarea
              value={draft.description ?? ""}
              onChange={(e) => updateDraft("description", e.target.value)}
              rows={4}
              style={{ ...adminInput, height: "auto", resize: "vertical", padding: 10 }}
            />

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

            <Label>
              SILHOUETTE POSITION — {typeof draft.visualConfig?.silhouetteTop === "number" ? draft.visualConfig.silhouetteTop : 50}% (used when no image)
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

            <div style={{ borderTop: "1px solid rgba(244,239,230,0.12)", marginBottom: 16 }} />

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

            <Label>COLOR TONE LABEL</Label>
            <input
              value={draft.tone ?? ""}
              onChange={(e) => updateDraft("tone", e.target.value)}
              style={adminInput}
              placeholder="e.g. Crisp White"
            />

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

const miniBtn: React.CSSProperties = {
  flex: 1,
  height: 26,
  background: "rgba(244,239,230,0.06)",
  border: "1px solid rgba(244,239,230,0.18)",
  color: "var(--cream)",
  fontFamily: "var(--mono)",
  fontSize: 9,
  letterSpacing: "0.14em",
  cursor: "pointer",
};
