import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--ink)", color: "var(--cream)" }}>
      {/* Admin nav */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "18px 36px",
        borderBottom: "1px solid rgba(244,239,230,0.12)",
      }}>
        <span className="serif" style={{ fontSize: 20, fontWeight: 500, color: "var(--cream)" }}>
          The Exclusive Rack
        </span>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <Link href="/admin/products" style={navLink}>Products</Link>
          <Link href="/admin/settings" style={navLink}>Settings</Link>
          <Link href="/" target="_blank" style={navLink}>View site ↗</Link>
        </div>
      </div>

      <div style={{ padding: "64px 36px" }}>
        <div className="mono" style={{
          fontSize: 10,
          color: "var(--muted)",
          marginBottom: 12,
          letterSpacing: "0.16em",
        }}>
          ADMIN PANEL
        </div>
        <h1 className="serif" style={{
          fontSize: 56,
          margin: "0 0 48px",
          fontWeight: 300,
          letterSpacing: "-0.03em",
          color: "var(--cream)",
        }}>
          Dashboard
        </h1>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
          maxWidth: 800,
        }}>
          {[
            {
              href: "/admin/products",
              title: "Products",
              desc: "Edit names, descriptions, prices, colors, and visual layout of each product card.",
              tag: "VISUAL EDITOR",
            },
            {
              href: "/admin/settings",
              title: "Theme & Colors",
              desc: "Adjust the global color palette, intro variant, and site-wide settings.",
              tag: "SETTINGS",
            },
            {
              href: "/shop",
              target: "_blank",
              title: "Live Store",
              desc: "Open the customer-facing storefront in a new tab.",
              tag: "VIEW ONLY",
            },
          ].map((card) => (
            <Link
              key={card.href}
              href={card.href}
              target={card.target}
              style={{
                display: "block",
                background: "rgba(244,239,230,0.06)",
                border: "1px solid rgba(244,239,230,0.12)",
                padding: 24,
                textDecoration: "none",
                transition: "background 200ms",
              }}
            >
              <div className="mono" style={{
                fontSize: 9,
                color: "var(--muted)",
                marginBottom: 12,
                letterSpacing: "0.18em",
              }}>
                {card.tag}
              </div>
              <div className="serif" style={{
                fontSize: 24,
                color: "var(--cream)",
                fontWeight: 400,
                marginBottom: 10,
              }}>
                {card.title}
              </div>
              <p style={{
                fontFamily: "var(--sans)",
                fontSize: 13,
                color: "var(--muted)",
                margin: 0,
                lineHeight: 1.5,
              }}>
                {card.desc}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

const navLink: React.CSSProperties = {
  fontFamily: "var(--mono)",
  fontSize: 10,
  letterSpacing: "0.16em",
  color: "var(--muted)",
  textDecoration: "none",
  textTransform: "uppercase",
};
