import { db, products } from "@/lib/db";
import { asc, eq } from "drizzle-orm";
import TopNav from "@/components/top-nav";
import ProductCard from "@/components/product-card";
import SiteFooter from "@/components/site-footer";
import ShopFilters from "@/components/shop-filters";

export const dynamic = "force-dynamic";

const COLOR_DOTS: Record<string, string> = {
  white: "var(--c-white)",
  sky:   "var(--c-sky)",
  red:   "var(--c-red)",
  sage:  "var(--c-sage)",
};

type Props = { searchParams: Promise<{ cat?: string; color?: string }> };

export default async function ShopPage({ searchParams }: Props) {
  const { cat, color } = await searchParams;
  const rows = await db.select().from(products)
    .where(eq(products.inStock, true))
    .orderBy(asc(products.position));
  const all = rows.map((p) => ({
    ...p,
    visualConfig: (p.visualConfig ?? {}) as Record<string, unknown>,
  }));

  const filtered = all.filter((p) => {
    if (cat && cat !== "All" && p.category !== cat) return false;
    if (color && color !== "all" && p.colorKey !== color) return false;
    return true;
  });

  return (
    <>
      <TopNav />
      <section style={{
        padding: "var(--section-y-md) var(--section-x) var(--section-y-lg)",
        background: "var(--cream)",
      }}>
        <div className="section-header-row" style={{ marginBottom: 40 }}>
          <div>
            <div className="mono" style={{
              fontSize: 10,
              color: "var(--muted)",
              marginBottom: 12,
              letterSpacing: "0.16em",
            }}>
              SS26 · {filtered.length} PIECES
            </div>
            <h1 className="serif" style={{
              fontSize: "clamp(36px, 5vw, 64px)",
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
              margin: 0,
              color: "var(--ink)",
              fontWeight: 300,
            }}>
              Summer Essentials,<br />
              <em style={{ fontWeight: 400 }}>quietly made.</em>
            </h1>
          </div>

          {/* Color swatches */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {Object.entries(COLOR_DOTS).map(([key, val]) => (
              <a key={key} href={`/shop?${cat ? `cat=${cat}&` : ""}color=${key}`} style={{
                display: "block",
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: val,
                border: color === key ? "1.5px solid var(--ink)" : "1px solid var(--line)",
                outline: color === key ? "4px solid var(--cream)" : "none",
                outlineOffset: -6,
                textDecoration: "none",
              }} />
            ))}
          </div>
        </div>

        {/* Sticky filter bar */}
        <ShopFilters active={cat ?? "All"} activeColor={color ?? "all"} />

        <div className="products-grid" style={{ marginTop: 24 }}>
          {filtered.map((p, i) => (
            <ProductCard key={p.id} product={p} big={i === 0 || i === 5} />
          ))}
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
