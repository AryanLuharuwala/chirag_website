import TopNav from "@/components/top-nav";
import SiteFooter from "@/components/site-footer";
import { CardGridSkeleton, TextLineSkeleton } from "@/components/skeletons";

export default function ShopLoading() {
  return (
    <>
      <TopNav />
      <section style={{ padding: "64px 36px 80px", background: "var(--cream)" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 40,
            gap: 24,
          }}
        >
          <div style={{ flex: 1, maxWidth: 520 }}>
            <TextLineSkeleton width={140} height={10} style={{ marginBottom: 12 }} />
            <TextLineSkeleton height={48} />
            <TextLineSkeleton height={48} width="65%" style={{ marginTop: 8 }} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="skeleton"
                style={{ width: 22, height: 22, borderRadius: "50%" }}
                aria-hidden
              />
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <TextLineSkeleton key={i} width={80} height={28} />
          ))}
        </div>
        <CardGridSkeleton count={9} />
      </section>
      <SiteFooter />
    </>
  );
}
