"use client";

import { useState, useEffect } from "react";

type User = { id: string; email: string; name?: string; role: string };
type Order = {
  id: string;
  status: string;
  total: string;
  createdAt: string;
};

export default function AccountClient() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((u) => {
      setUser(u);
      setLoading(false);
      if (u) fetch("/api/orders").then((r) => r.json()).then(setOrders);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const body = mode === "login" ? { email, password } : { email, password, name };
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setUser(data);
    fetch("/api/orders").then((r) => r.json()).then(setOrders);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setOrders([]);
  };

  if (loading) return <div style={{ padding: "120px 36px", background: "var(--cream)" }} />;

  if (!user) {
    return (
      <section style={{
        padding: "80px 36px",
        background: "var(--cream)",
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}>
        <h1 className="serif" style={{
          fontSize: 56,
          margin: "0 0 8px",
          color: "var(--ink)",
          letterSpacing: "-0.02em",
          fontWeight: 400,
        }}>
          {mode === "login" ? "Welcome back." : "Create account."}
        </h1>
        <div className="mono" style={{
          fontSize: 10,
          color: "var(--muted)",
          marginBottom: 40,
          letterSpacing: "0.16em",
        }}>
          MY CLOSET · THE EXCLUSIVE RACK
        </div>

        <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 400 }}>
          {mode === "register" && (
            <div style={{ marginBottom: 16 }}>
              <label className="mono" style={{
                display: "block",
                fontSize: 10,
                color: "var(--muted)",
                marginBottom: 8,
                letterSpacing: "0.14em",
              }}>
                NAME
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
                placeholder="Ana M."
              />
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <label className="mono" style={{
              display: "block",
              fontSize: 10,
              color: "var(--muted)",
              marginBottom: 8,
              letterSpacing: "0.14em",
            }}>
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
              placeholder="you@example.com"
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label className="mono" style={{
              display: "block",
              fontSize: 10,
              color: "var(--muted)",
              marginBottom: 8,
              letterSpacing: "0.14em",
            }}>
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          {error && (
            <div style={{
              fontFamily: "var(--sans)",
              fontSize: 13,
              color: "var(--c-red)",
              marginBottom: 16,
            }}>
              {error}
            </div>
          )}
          <button type="submit" style={ctaStyle}>
            {mode === "login" ? "SIGN IN →" : "CREATE ACCOUNT →"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          style={{
            marginTop: 20,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--mono)",
            fontSize: 10,
            color: "var(--muted)",
            letterSpacing: "0.14em",
            textDecoration: "underline",
          }}
        >
          {mode === "login" ? "NEW HERE? CREATE AN ACCOUNT" : "ALREADY HAVE AN ACCOUNT? SIGN IN"}
        </button>
      </section>
    );
  }

  return (
    <section style={{ padding: "64px 36px", background: "var(--cream)", minHeight: "70vh" }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: 48,
      }}>
        <div>
          <div className="mono" style={{
            fontSize: 10,
            color: "var(--muted)",
            marginBottom: 12,
            letterSpacing: "0.16em",
          }}>
            MY CLOSET
          </div>
          <h1 className="serif" style={{
            fontSize: 56,
            margin: 0,
            color: "var(--ink)",
            letterSpacing: "-0.02em",
            fontWeight: 400,
          }}>
            {user.name ? `Hello, ${user.name.split(" ")[0]}.` : "Hello."}
          </h1>
          <div style={{
            fontFamily: "var(--sans)",
            fontSize: 14,
            color: "var(--muted)",
            marginTop: 8,
          }}>
            {user.email}
          </div>
        </div>
        <button onClick={handleLogout} style={{
          background: "none",
          border: "1px solid var(--line)",
          cursor: "pointer",
          fontFamily: "var(--mono)",
          fontSize: 10,
          color: "var(--muted)",
          letterSpacing: "0.14em",
          padding: "10px 18px",
        }}>
          SIGN OUT
        </button>
      </div>

      <div className="mono" style={{
        fontSize: 10,
        color: "var(--muted)",
        marginBottom: 20,
        letterSpacing: "0.16em",
        borderBottom: "1px solid var(--line)",
        paddingBottom: 14,
      }}>
        ORDER HISTORY · {orders.length} ORDER{orders.length !== 1 ? "S" : ""}
      </div>

      {orders.length === 0 ? (
        <p style={{ fontFamily: "var(--sans)", fontSize: 14, color: "var(--muted)" }}>
          No orders yet. When you shop, they&apos;ll appear here.
        </p>
      ) : (
        <div>
          {orders.map((o) => (
            <div key={o.id} style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "18px 0",
              borderBottom: "1px solid var(--line)",
            }}>
              <div>
                <div style={{ fontFamily: "var(--sans)", fontSize: 14, color: "var(--ink)" }}>
                  Order #{o.id.slice(-8).toUpperCase()}
                </div>
                <div className="mono" style={{
                  fontSize: 10,
                  color: "var(--muted)",
                  marginTop: 4,
                  letterSpacing: "0.12em",
                }}>
                  {new Date(o.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })} · {o.status.toUpperCase()}
                </div>
              </div>
              <div className="serif" style={{ fontSize: 22, color: "var(--ink)" }}>
                ${parseFloat(o.total).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 44,
  padding: "0 14px",
  background: "var(--paper)",
  border: "1px solid var(--line)",
  fontFamily: "var(--sans)",
  fontSize: 14,
  color: "var(--ink)",
  outline: "none",
};

const ctaStyle: React.CSSProperties = {
  width: "100%",
  height: 54,
  background: "var(--ink)",
  color: "var(--cream)",
  border: "none",
  fontFamily: "var(--mono)",
  fontSize: 11,
  letterSpacing: "0.2em",
  cursor: "pointer",
};
