"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const CATS = ["All", "Women", "Men", "Kids"];

function Filters({ active, activeColor }: { active: string; activeColor: string }) {
  const searchParams = useSearchParams();
  const color = searchParams.get("color") ?? "all";

  return (
    <div className="scroll-x" style={{
      position: "sticky",
      top: 57,
      zIndex: 40,
      display: "flex",
      gap: 24,
      padding: "14px 0",
      borderBottom: "1px solid var(--line)",
      background: "rgba(244,239,230,0.9)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      whiteSpace: "nowrap",
    }}>
      {CATS.map((cat) => (
        <Link key={cat} href={`/shop?cat=${cat}${color !== "all" ? `&color=${color}` : ""}`} style={{
          textDecoration: "none",
          fontFamily: "var(--mono)",
          fontSize: 10,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: active === cat ? "var(--ink)" : "var(--muted)",
          borderBottom: active === cat ? "1px solid var(--ink)" : "1px solid transparent",
          paddingBottom: 2,
        }}>
          {cat}
        </Link>
      ))}
    </div>
  );
}

export default function ShopFilters({ active, activeColor }: { active: string; activeColor: string }) {
  return (
    <Suspense>
      <Filters active={active} activeColor={activeColor} />
    </Suspense>
  );
}
