import type { Metadata } from "next";
import { db, products } from "@/lib/db";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import TopNav from "@/components/top-nav";
import SiteFooter from "@/components/site-footer";
import ProductDetailClient from "@/components/product-detail-client";

// Always fetch fresh — product availability and details change
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);
  if (!product) return {};
  const title = `${product.name} — The Exclusive Rack`;
  const description = product.description;
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const rows = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  const product = rows[0];
  if (!product) notFound();

  return (
    <>
      <TopNav />
      <ProductDetailClient product={product} />
      <SiteFooter />
    </>
  );
}
