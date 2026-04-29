"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "./cart-context";

const LINKS = [
  { href: "/shop?cat=Women", label: "Women" },
  { href: "/shop?cat=Men",   label: "Men" },
  { href: "/shop?cat=Kids",  label: "Kids" },
  { href: "/lookbook",       label: "Lookbook" },
];

export default function TopNav() {
  const pathname = usePathname();
  const { count, openDrawer } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  // close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // lock body scroll while menu is open
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [menuOpen]);

  // close on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <>
      <nav style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px var(--section-x)",
        background: "rgba(244,239,230,0.85)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--line)",
        gap: 12,
      }}>
        <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
          <span className="serif" style={{
            fontSize: "clamp(18px, 3.4vw, 22px)",
            color: "var(--ink)",
            letterSpacing: "-0.02em",
            fontWeight: 500,
          }}>
            The Exclusive Rack
          </span>
        </Link>

        {/* Desktop links */}
        <div className="desktop-only" style={{ display: "flex", gap: 28, alignItems: "center" }}>
          {LINKS.map(({ href, label }) => {
            const active = pathname.startsWith(href.split("?")[0]);
            return (
              <Link key={label} href={href} style={navLink(active)}>
                {label}
              </Link>
            );
          })}
          <button onClick={openDrawer} aria-label={`Open bag, ${count} items`} style={{
            ...navLink(pathname === "/bag"),
            background: "none",
            border: "none",
            cursor: "pointer",
          }}>
            Bag {count > 0 && `(${count})`}
          </button>
          <Link href="/account" style={navLink(pathname === "/account")}>
            Account
          </Link>
        </div>

        {/* Mobile actions: cart count + hamburger */}
        <div className="mobile-only" style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={openDrawer} aria-label={`Open bag, ${count} items`} style={{
            ...navLink(false),
            background: "none",
            border: "none",
            cursor: "pointer",
          }}>
            Bag{count > 0 && ` (${count})`}
          </button>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            style={{
              width: 32,
              height: 32,
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "inline-flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 5,
              padding: 0,
            }}
          >
            <span style={{
              width: 22,
              height: 1.5,
              background: "var(--ink)",
              transform: menuOpen ? "translateY(3px) rotate(45deg)" : "none",
              transition: "transform 220ms ease",
            }} />
            <span style={{
              width: 22,
              height: 1.5,
              background: "var(--ink)",
              transform: menuOpen ? "translateY(-3px) rotate(-45deg)" : "none",
              transition: "transform 220ms ease",
            }} />
          </button>
        </div>
      </nav>

      {/* Mobile menu sheet */}
      <div
        aria-hidden={!menuOpen}
        style={{
          position: "fixed",
          inset: "60px 0 0 0",
          background: "var(--cream)",
          zIndex: 49,
          padding: "24px var(--section-x)",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
          transform: menuOpen ? "translateY(0)" : "translateY(-8px)",
          transition: "opacity 220ms ease, transform 220ms ease",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {LINKS.map(({ href, label }) => {
          const active = pathname.startsWith(href.split("?")[0]);
          return (
            <Link
              key={label}
              href={href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: "block",
                padding: "20px 0",
                borderBottom: "1px solid var(--line)",
                textDecoration: "none",
                fontFamily: "var(--serif)",
                fontSize: 32,
                color: active ? "var(--ink)" : "var(--ink-2)",
                fontWeight: 400,
                letterSpacing: "-0.01em",
              }}
            >
              {label}
            </Link>
          );
        })}
        <Link
          href="/account"
          onClick={() => setMenuOpen(false)}
          style={{
            display: "block",
            padding: "20px 0",
            borderBottom: "1px solid var(--line)",
            textDecoration: "none",
            fontFamily: "var(--serif)",
            fontSize: 32,
            color: pathname === "/account" ? "var(--ink)" : "var(--ink-2)",
            fontWeight: 400,
          }}
        >
          Account
        </Link>
      </div>
    </>
  );
}

function navLink(active: boolean): React.CSSProperties {
  return {
    textDecoration: "none",
    fontFamily: "var(--mono)",
    fontSize: 10,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: active ? "var(--ink)" : "var(--muted)",
    borderBottom: active ? "1px solid var(--ink)" : "1px solid transparent",
    paddingBottom: 2,
  };
}
