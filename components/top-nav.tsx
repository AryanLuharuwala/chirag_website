"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

  return (
    <nav style={{
      position: "sticky",
      top: 0,
      zIndex: 50,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "18px 36px",
      background: "rgba(244,239,230,0.85)",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      borderBottom: "1px solid var(--line)",
    }}>
      <Link href="/" style={{ textDecoration: "none" }}>
        <span className="serif" style={{
          fontSize: 22,
          color: "var(--ink)",
          letterSpacing: "-0.02em",
          fontWeight: 500,
        }}>
          The Exclusive Rack
        </span>
      </Link>

      <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
        {LINKS.map(({ href, label }) => {
          const active = pathname.startsWith(href.split("?")[0]);
          return (
            <Link key={label} href={href} style={{
              textDecoration: "none",
              fontFamily: "var(--mono)",
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: active ? "var(--ink)" : "var(--muted)",
              borderBottom: active ? "1px solid var(--ink)" : "1px solid transparent",
              paddingBottom: 2,
            }}>
              {label}
            </Link>
          );
        })}
        <button
          onClick={openDrawer}
          aria-label={`Open bag, ${count} items`}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            fontFamily: "var(--mono)",
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: pathname === "/bag" ? "var(--ink)" : "var(--muted)",
            borderBottom: pathname === "/bag" ? "1px solid var(--ink)" : "1px solid transparent",
            paddingBottom: 2,
          }}
        >
          Bag {count > 0 && `(${count})`}
        </button>
        <Link href="/account" style={{
          textDecoration: "none",
          fontFamily: "var(--mono)",
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: pathname === "/account" ? "var(--ink)" : "var(--muted)",
          paddingBottom: 2,
        }}>
          Account
        </Link>
      </div>
    </nav>
  );
}
