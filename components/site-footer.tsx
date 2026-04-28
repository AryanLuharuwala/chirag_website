import Link from "next/link";

const COLS = [
  ["SHOP",   [["Women", "/shop?cat=Women"], ["Men", "/shop?cat=Men"], ["Kids", "/shop?cat=Kids"], ["Lookbook", "/lookbook"]]],
  ["HOUSE",  [["Our makers", "#"], ["Repairs", "#"], ["Stores", "#"], ["Contact", "#"]]],
  ["HELP",   [["Shipping", "#"], ["Returns", "#"], ["Size guide", "#"], ["FAQ", "#"]]],
  ["LETTER", [["Once a season. No louder than that.", "#"]]],
] as const;

export default function SiteFooter() {
  return (
    <footer style={{
      background: "var(--cream-2)",
      color: "var(--ink)",
      padding: "80px 36px 28px",
      borderTop: "1px solid var(--line)",
    }}>
      <div className="serif" style={{
        fontSize: "clamp(60px, 9vw, 140px)",
        lineHeight: 0.85,
        letterSpacing: "-0.045em",
        fontWeight: 300,
      }}>
        Wear it<br /><em style={{ fontWeight: 400 }}>out.</em>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 24,
        marginTop: 64,
        paddingTop: 28,
        borderTop: "1px solid var(--line)",
      }}>
        {COLS.map(([heading, items]) => (
          <div key={heading}>
            <div className="mono" style={{
              fontSize: 10,
              color: "var(--muted)",
              marginBottom: 14,
              letterSpacing: "0.16em",
            }}>
              {heading}
            </div>
            {items.map(([label, href]) => (
              <div key={label} style={{ marginBottom: 6 }}>
                <Link href={href} style={{
                  fontFamily: "var(--sans)",
                  fontSize: 13,
                  color: "var(--ink)",
                  textDecoration: "none",
                }}>
                  {label}
                </Link>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 48,
        display: "flex",
        justifyContent: "space-between",
        fontFamily: "var(--mono)",
        fontSize: 9.5,
        color: "var(--muted)",
        letterSpacing: "0.16em",
      }}>
        <span>© THE EXCLUSIVE RACK · 2026</span>
        <span>PORTO · LISBON · NEW YORK</span>
      </div>
    </footer>
  );
}
