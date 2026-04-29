import TopNav from "@/components/top-nav";
import SiteFooter from "@/components/site-footer";
import { CardGridSkeleton, TextLineSkeleton } from "@/components/skeletons";

export default function HomeLoading() {
  return (
    <>
      <TopNav />
      {/* Marquee placeholder */}
      <div
        className="skeleton"
        style={{ height: 360, width: "100%" }}
        aria-hidden
      />
      <section style={{ padding: "80px 36px", background: "var(--cream)" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 48,
            gap: 24,
          }}
        >
          <div style={{ flex: 1, maxWidth: 480 }}>
            <TextLineSkeleton width={120} height={10} style={{ marginBottom: 12 }} />
            <TextLineSkeleton height={48} />
            <TextLineSkeleton height={48} width="70%" style={{ marginTop: 8 }} />
          </div>
          <TextLineSkeleton width={80} height={10} />
        </div>
        <CardGridSkeleton count={6} />
      </section>
      <SiteFooter />
    </>
  );
}
