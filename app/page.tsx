import { db, products } from "@/lib/db";
import { asc, eq } from "drizzle-orm";
import TopNav from "@/components/top-nav";
import IntroMarquee from "@/components/intro-marquee";
import ProductCard from "@/components/product-card";
import SiteFooter from "@/components/site-footer";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  const rows = await db.select().from(products)
    .where(eq(products.inStock, true))
    .orderBy(asc(products.position));
  const allProducts = rows.map((p) => ({
    ...p,
    visualConfig: (p.visualConfig ?? {}) as Record<string, unknown>,
  }));
  const featured = allProducts.slice(0, 6);

  return (
    <>
      <TopNav />

      {/* Marquee intro */}
      <IntroMarquee products={allProducts} />

      {/* Shop teaser */}
      <section style={{
        padding: "var(--section-y-lg) var(--section-x)",
        background: "var(--cream)",
      }}>
        <div className="section-header-row" style={{ marginBottom: 48 }}>
          <div>
            <div className="mono" style={{
              fontSize: 10,
              color: "var(--muted)",
              marginBottom: 12,
              letterSpacing: "0.16em",
            }}>
              SS26 · {allProducts.length} PIECES
            </div>
            <h2 className="serif" style={{
              fontSize: "clamp(40px, 5vw, 64px)",
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
              margin: 0,
              color: "var(--ink)",
              fontWeight: 300,
            }}>
              Summer Essentials,<br />
              <em style={{ fontWeight: 400 }}>quietly made.</em>
            </h2>
          </div>
          <Link href="/shop" style={{
            fontFamily: "var(--mono)",
            fontSize: 10,
            letterSpacing: "0.18em",
            color: "var(--ink)",
            textDecoration: "none",
            borderBottom: "1px solid var(--ink)",
            paddingBottom: 2,
          }}>
            VIEW ALL →
          </Link>
        </div>

        <div className="products-grid">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} big={i === 0 || i === 5} />
          ))}
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
