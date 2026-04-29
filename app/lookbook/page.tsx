import TopNav from "@/components/top-nav";
import SiteFooter from "@/components/site-footer";
import Link from "next/link";

export default function LookbookPage() {
  return (
    <>
      <TopNav />
      <section style={{
        background: "var(--ink)",
        color: "var(--cream)",
        padding: "var(--section-y-lg) 0",
      }}>
        {/* Hero */}
        <div className="section-header-row" style={{
          padding: "0 var(--section-x) var(--section-gap)",
        }}>
          <div>
            <div className="mono" style={{
              fontSize: 10,
              color: "var(--muted)",
              marginBottom: 12,
              letterSpacing: "0.16em",
            }}>
              EDITORIAL · CHAPTER ONE
            </div>
            <h1 className="serif" style={{
              fontSize: "clamp(48px, 7vw, 84px)",
              lineHeight: 0.9,
              letterSpacing: "-0.04em",
              margin: 0,
              fontWeight: 300,
              color: "var(--cream)",
            }}>
              A long lunch<br />
              <em style={{ fontWeight: 400 }}>in cotton.</em>
            </h1>
          </div>
          <p className="serif lookbook-intro" style={{
            maxWidth: 320,
            fontSize: 16,
            lineHeight: 1.5,
            color: "var(--muted)",
          }}>
            Photographed in Cádiz at the end of June. Worn by the people who live there, in the rooms they live in.
          </p>
        </div>

        {/* 2-up image grid */}
        <div className="lookbook-grid-2">
          <div className="ph" style={{
            background: "var(--c-red)",
            height: 520,
            color: "rgba(255,255,255,0.9)",
          }}>
            <div style={{
              position: "absolute", inset: 0,
              background: "radial-gradient(120% 80% at 70% 30%, rgba(255,255,255,0.35), transparent 60%)",
            }} />
            <div className="ph-label" style={{
              background: "rgba(0,0,0,0.4)",
              color: "rgba(255,255,255,0.95)",
            }}>
              FIGURE · DOORWAY · 35MM
            </div>
          </div>
          <div className="ph" style={{ background: "var(--c-sky)", height: 520 }}>
            <div className="ph-label">DETAIL · WRIST · MEDIUM FORMAT</div>
          </div>
        </div>

        {/* Three-column block */}
        <div className="lookbook-grid-3" style={{
          padding: "var(--section-y-md) var(--section-x)",
          alignItems: "flex-end",
        }}>
          <div className="ph" style={{ background: "var(--c-sage)", height: 360 }}>
            <div className="ph-label">STILL LIFE · FOLDED</div>
          </div>
          <div className="serif" style={{
            fontSize: 22,
            lineHeight: 1.45,
            color: "var(--cream)",
            fontStyle: "italic",
            fontWeight: 300,
          }}>
            "We made this collection from things we already own — a shirt my father wore, a dress that fit nobody but the woman who made it."
            <div className="mono" style={{
              fontSize: 10,
              color: "var(--muted)",
              marginTop: 18,
              fontStyle: "normal",
              letterSpacing: "0.14em",
            }}>
              — ANA M., DESIGNER
            </div>
          </div>
          <div className="ph" style={{
            background: "var(--c-white)",
            height: 460,
            color: "var(--ink)",
          }}>
            <div className="ph-label">FIGURE · WINDOW LIGHT · 6X7</div>
          </div>
        </div>

        {/* Chapter footer */}
        <div style={{
          padding: "28px var(--section-x) 0",
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          borderTop: "1px solid rgba(244,239,230,0.14)",
          flexWrap: "wrap",
        }}>
          <span className="mono" style={{
            fontSize: 10,
            color: "var(--muted)",
            letterSpacing: "0.16em",
          }}>
            CHAPTER 01 / 04
          </span>
          <Link href="/lookbook/quiet-morning" style={{
            fontFamily: "var(--mono)",
            fontSize: 10,
            color: "var(--cream)",
            textDecoration: "none",
            letterSpacing: "0.16em",
          }}>
            NEXT · A QUIET MORNING →
          </Link>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
