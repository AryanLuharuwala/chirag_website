"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok || data.role !== "admin") {
      setError("Invalid credentials or insufficient permissions.");
      return;
    }
    router.replace("/admin");
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--cream)",
    }}>
      <div style={{ width: 380 }}>
        <div className="mono" style={{
          fontSize: 10,
          color: "var(--muted)",
          marginBottom: 12,
          letterSpacing: "0.2em",
        }}>
          THE EXCLUSIVE RACK
        </div>
        <h1 className="serif" style={{
          fontSize: 40,
          margin: "0 0 32px",
          color: "var(--ink)",
          fontWeight: 400,
          letterSpacing: "-0.02em",
        }}>
          Admin access.
        </h1>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email"
              style={iStyle}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
              style={iStyle}
            />
          </div>
          {error && (
            <div style={{
              fontFamily: "var(--sans)",
              fontSize: 13,
              color: "#c0392b",
              marginBottom: 16,
            }}>
              {error}
            </div>
          )}
          <button type="submit" style={{
            width: "100%",
            height: 50,
            background: "var(--ink)",
            color: "var(--cream)",
            border: "none",
            fontFamily: "var(--mono)",
            fontSize: 11,
            letterSpacing: "0.2em",
            cursor: "pointer",
          }}>
            ENTER →
          </button>
        </form>
      </div>
    </div>
  );
}

const iStyle: React.CSSProperties = {
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
