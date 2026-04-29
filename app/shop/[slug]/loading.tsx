import TopNav from "@/components/top-nav";
import SiteFooter from "@/components/site-footer";
import { TextLineSkeleton } from "@/components/skeletons";

export default function ProductDetailLoading() {
  return (
    <>
      <TopNav />
      <section
        style={{
          background: "var(--paper)",
          padding: "64px 36px",
          borderTop: "1px solid var(--line)",
        }}
      >
        <TextLineSkeleton width={220} height={10} style={{ marginBottom: 24 }} />
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 48 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div
              className="skeleton"
              style={{ aspectRatio: "0.78", width: "100%" }}
              aria-hidden
            />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="skeleton"
                  style={{ aspectRatio: "1", width: "100%" }}
                  aria-hidden
                />
              ))}
            </div>
          </div>
          <div>
            <TextLineSkeleton height={56} />
            <TextLineSkeleton height={56} width="80%" style={{ marginTop: 8 }} />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 22,
                paddingBottom: 22,
                borderBottom: "1px solid var(--line)",
              }}
            >
              <TextLineSkeleton width={120} height={28} />
              <TextLineSkeleton width={140} height={12} />
            </div>
            <div style={{ marginTop: 22 }}>
              <TextLineSkeleton height={16} />
              <TextLineSkeleton height={16} width="92%" style={{ marginTop: 8 }} />
              <TextLineSkeleton height={16} width="78%" style={{ marginTop: 8 }} />
            </div>
            <div style={{ marginTop: 28, display: "flex", gap: 10 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="skeleton"
                  style={{ width: 28, height: 28, borderRadius: "50%" }}
                  aria-hidden
                />
              ))}
            </div>
            <div
              style={{
                marginTop: 24,
                display: "grid",
                gridTemplateColumns: "repeat(6, 1fr)",
                gap: 6,
              }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <TextLineSkeleton key={i} height={38} />
              ))}
            </div>
            <TextLineSkeleton height={54} style={{ marginTop: 24 }} />
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
