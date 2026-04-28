"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((u) => {
      if (!u || u.role !== "admin") {
        if (pathname !== "/admin/login") router.replace("/admin/login");
        else setReady(true);
      } else {
        setReady(true);
      }
    });
  }, [router, pathname]);

  if (!ready) return (
    <div style={{
      position: "fixed", inset: 0,
      background: "var(--cream)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <span className="mono" style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.2em" }}>
        LOADING...
      </span>
    </div>
  );

  return <>{children}</>;
}
