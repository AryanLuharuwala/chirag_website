"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Colors = {
  cream: string;
  cream2: string;
  paper: string;
  ink: string;
  ink2: string;
  muted: string;
  cWhite: string;
  cSky: string;
  cRed: string;
  cSage: string;
};

type Settings = {
  colors: Colors;
  intro: string;
  siteName: string;
  tagline: string;
  footerTagline: string;
};

const DEFAULT_COLORS: Colors = {
  cream:   "#F4EFE6",
  cream2:  "#EAE3D5",
  paper:   "#FBFAF6",
  ink:     "#15140F",
  ink2:    "#2E2A22",
  muted:   "#7A7263",
  cWhite:  "#FBFAF6",
  cSky:    "#B8D8E8",
  cRed:    "#C17060",
  cSage:   "#A8C4A8",
};

const COLOR_LABELS: Record<keyof Colors, string> = {
  cream:  "Page body (warm cream)",
  cream2: "Footer / secondary surface",
  paper:  "White card / panels",
  ink:    "Primary text & CTAs",
  ink2:   "Body copy",
  muted:  "Meta / captions",
  cWhite: "Accent: Crisp White",
  cSky:   "Accent: Sky Blue",
  cRed:   "Accent: Sunset Red",
  cSage:  "Accent: Sage Green",
};

export default function AdminThemeEditor() {
  const [settings, setSettings] = useState<Settings>({
    colors: DEFAULT_COLORS,
    intro: "marquee",
    siteName: "The Exclusive Rack",
    tagline: "Summer Essentials, quietly made.",
    footerTagline: "PORTO · LISBON · NEW YORK",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings").then((r) => r.json()).then((data) => {
      if (data.colors) setSettings((s) => ({ ...s, colors: data.colors as Colors }));
      if (data.intro) setSettings((s) => ({ ...s, intro: data.intro as string }));
      if (data.siteName) setSettings((s) => ({ ...s, siteName: data.siteName as string }));
      if (data.tagline) setSettings((s) => ({ ...s, tagline: data.tagline as string }));
      if (data.footerTagline) setSettings((s) => ({ ...s, footerTagline: data.footerTagline as string }));
    });
  }, []);

  const updateColor = (key: keyof Colors, value: string) => {
    setSettings((s) => ({ ...s, colors: { ...s.colors, [key]: value } }));
  };

  const save = async () => {
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const previewStyle = {
    "--cream":   settings.colors.cream,
    "--cream-2": settings.colors.cream2,
    "--paper":   settings.colors.paper,
    "--ink":     settings.colors.ink,
    "--ink-2":   settings.colors.ink2,
    "--muted":   settings.colors.muted,
    "--c-white": settings.colors.cWhite,
    "--c-sky":   settings.colors.cSky,
    "--c-red":   settings.colors.cRed,
    "--c-sage":  settings.colors.cSage,
  } as React.CSSProperties;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--ink)", color: "var(--cream)" }}>
      {/* nav */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 24px",
        borderBottom: "1px solid rgba(244,239,230,0.12)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Link href="/admin" style={{
            fontFamily: "var(--mono)",
            fontSize: 10,
            color: "var(--muted)",
            textDecoration: "none",
            letterSpacing: "0.14em",
          }}>
            ← DASHBOARD
          </Link>
          <span className="serif" style={{ fontSize: 18, fontWeight: 400 }}>Theme & Settings</span>
        </div>
        <button onClick={save} disabled={saving} style={{
          height: 36,
          padding: "0 20px",
          background: saved ? "rgba(168,196,168,0.3)" : "rgba(244,239,230,0.12)",
          border: "1px solid rgba(244,239,230,0.2)",
          color: "var(--cream)",
          fontFamily: "var(--mono)",
          fontSize: 10,
          letterSpacing: "0.16em",
          cursor: saving ? "wait" : "pointer",
        }}>
          {saving ? "SAVING..." : saved ? "SAVED ✓" : "SAVE SETTINGS"}
        </button>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* edit panel */}
        <div style={{
          width: 360,
          borderRight: "1px solid rgba(244,239,230,0.12)",
          overflow: "auto",
          padding: "24px 20px",
          flexShrink: 0,
        }}>
          <Section>PAYMENTS</Section>

          {/* Stripe status indicator */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 14,
            padding: "10px 12px",
            background: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
              ? "rgba(168,196,168,0.15)"
              : "rgba(193,112,96,0.15)",
            border: `1px solid ${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? "rgba(168,196,168,0.3)" : "rgba(193,112,96,0.3)"}`,
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? "#A8C4A8" : "#C17060",
              flexShrink: 0,
            }} />
            <span style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.14em", color: "var(--cream)" }}>
              STRIPE {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? "CONNECTED" : "NOT CONFIGURED"}
            </span>
          </div>

          <FieldLabel>HOW TO ENABLE PAYMENTS</FieldLabel>
          <div style={{
            fontFamily: "var(--sans)",
            fontSize: 12,
            color: "var(--muted)",
            lineHeight: 1.6,
            marginBottom: 16,
            padding: "10px 12px",
            background: "rgba(244,239,230,0.04)",
            border: "1px solid rgba(244,239,230,0.1)",
          }}>
            Add these to your environment variables (Vercel dashboard → Settings → Environment Variables):
            <br /><br />
            <code style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--cream)", letterSpacing: "0.06em" }}>
              STRIPE_SECRET_KEY=sk_live_...
              <br />
              STRIPE_WEBHOOK_SECRET=whsec_...
              <br />
              NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
            </code>
            <br /><br />
            Then redeploy. The checkout button will activate automatically.
          </div>

          <Section>SITE INFO</Section>

          <FieldLabel>SITE NAME</FieldLabel>
          <input
            value={settings.siteName}
            onChange={(e) => setSettings((s) => ({ ...s, siteName: e.target.value }))}
            style={adminInput}
          />

          <FieldLabel>TAGLINE</FieldLabel>
          <input
            value={settings.tagline}
            onChange={(e) => setSettings((s) => ({ ...s, tagline: e.target.value }))}
            style={adminInput}
          />

          <FieldLabel>FOOTER CITIES</FieldLabel>
          <input
            value={settings.footerTagline}
            onChange={(e) => setSettings((s) => ({ ...s, footerTagline: e.target.value }))}
            style={adminInput}
          />

          <Section>INTRO VARIANT</Section>
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {[
              { value: "rack",     label: "Rolling Rack" },
              { value: "marquee",  label: "Marquee" },
              { value: "parallax", label: "Parallax" },
            ].map(({ value, label }) => (
              <button key={value} onClick={() => setSettings((s) => ({ ...s, intro: value }))} style={{
                flex: 1,
                height: 36,
                background: settings.intro === value ? "rgba(244,239,230,0.15)" : "none",
                border: `1px solid ${settings.intro === value ? "rgba(244,239,230,0.4)" : "rgba(244,239,230,0.12)"}`,
                color: settings.intro === value ? "var(--cream)" : "var(--muted)",
                fontFamily: "var(--mono)",
                fontSize: 9,
                letterSpacing: "0.12em",
                cursor: "pointer",
              }}>
                {label.toUpperCase()}
              </button>
            ))}
          </div>

          <Section>COLOR PALETTE</Section>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {(Object.entries(settings.colors) as [keyof Colors, string][]).map(([key, val]) => (
              <div key={key} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <div>
                  <div style={{
                    fontFamily: "var(--sans)",
                    fontSize: 12,
                    color: "var(--cream)",
                  }}>
                    {COLOR_LABELS[key]}
                  </div>
                  <div className="mono" style={{
                    fontSize: 9,
                    color: "var(--muted)",
                    letterSpacing: "0.12em",
                    marginTop: 2,
                  }}>
                    {val}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {/* swatch */}
                  <div style={{
                    width: 28,
                    height: 28,
                    background: val,
                    border: "1px solid rgba(244,239,230,0.2)",
                    borderRadius: 2,
                  }} />
                  {/* color picker */}
                  <input
                    type="color"
                    value={val.startsWith("#") ? val : DEFAULT_COLORS[key]}
                    onChange={(e) => updateColor(key, e.target.value)}
                    style={{
                      width: 36,
                      height: 28,
                      padding: 2,
                      background: "none",
                      border: "1px solid rgba(244,239,230,0.2)",
                      cursor: "pointer",
                      borderRadius: 2,
                    }}
                  />
                  {/* hex input */}
                  <input
                    value={val}
                    onChange={(e) => updateColor(key, e.target.value)}
                    style={{
                      width: 92,
                      height: 28,
                      padding: "0 8px",
                      background: "rgba(244,239,230,0.06)",
                      border: "1px solid rgba(244,239,230,0.14)",
                      color: "var(--cream)",
                      fontFamily: "var(--mono)",
                      fontSize: 10,
                      letterSpacing: "0.08em",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live preview panel */}
        <div style={{
          flex: 1,
          overflow: "auto",
          padding: 40,
          background: "#1A1813",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}>
          <div className="mono" style={{
            fontSize: 9,
            color: "var(--muted)",
            marginBottom: 24,
            letterSpacing: "0.2em",
          }}>
            LIVE PALETTE PREVIEW
          </div>

          {/* mini storefront preview */}
          <div style={{ ...previewStyle, width: "100%", maxWidth: 680, borderRadius: 2, overflow: "hidden" }}>
            {/* Nav preview */}
            <div style={{
              background: `${settings.colors.cream}DD`,
              padding: "14px 24px",
              display: "flex",
              justifyContent: "space-between",
              borderBottom: `1px solid rgba(21,20,15,0.12)`,
            }}>
              <span style={{
                fontFamily: "var(--serif)",
                fontSize: 16,
                color: settings.colors.ink,
                fontWeight: 500,
              }}>
                {settings.siteName}
              </span>
              <div style={{ display: "flex", gap: 16 }}>
                {["Women", "Men", "Kids", "Lookbook"].map((l) => (
                  <span key={l} style={{
                    fontFamily: "var(--mono)",
                    fontSize: 9,
                    color: settings.colors.muted,
                    letterSpacing: "0.16em",
                  }}>
                    {l.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>

            {/* Hero preview */}
            <div style={{
              background: settings.colors.cream,
              padding: "40px 24px",
              textAlign: "center",
            }}>
              <div style={{
                fontFamily: "var(--serif)",
                fontSize: 36,
                color: settings.colors.ink,
                letterSpacing: "-0.03em",
                fontWeight: 300,
                lineHeight: 0.95,
              }}>
                {settings.tagline}
              </div>
            </div>

            {/* 4 swatches */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 6,
              padding: "0 24px 24px",
              background: settings.colors.cream,
            }}>
              {([
                ["cWhite", "Crisp White"],
                ["cSky",   "Sky Blue"],
                ["cRed",   "Sunset Red"],
                ["cSage",  "Sage Green"],
              ] as [keyof Colors, string][]).map(([key, label]) => (
                <div key={key} style={{
                  height: 80,
                  background: settings.colors[key],
                  display: "flex",
                  alignItems: "flex-end",
                  padding: "8px 10px",
                }}>
                  <span style={{
                    fontFamily: "var(--mono)",
                    fontSize: 8,
                    letterSpacing: "0.12em",
                    color: "rgba(0,0,0,0.4)",
                  }}>
                    {label.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>

            {/* Footer preview */}
            <div style={{
              background: settings.colors.cream2,
              padding: "20px 24px",
              display: "flex",
              justifyContent: "space-between",
              borderTop: `1px solid rgba(21,20,15,0.12)`,
            }}>
              <span style={{
                fontFamily: "var(--mono)",
                fontSize: 9,
                color: settings.colors.muted,
                letterSpacing: "0.14em",
              }}>
                © THE EXCLUSIVE RACK · 2026
              </span>
              <span style={{
                fontFamily: "var(--mono)",
                fontSize: 9,
                color: settings.colors.muted,
                letterSpacing: "0.14em",
              }}>
                {settings.footerTagline}
              </span>
            </div>
          </div>

          {/* CTA swatch */}
          <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
            <div style={{
              height: 44,
              padding: "0 20px",
              background: settings.colors.ink,
              color: settings.colors.cream,
              fontFamily: "var(--mono)",
              fontSize: 10,
              letterSpacing: "0.18em",
              display: "flex",
              alignItems: "center",
            }}>
              ADD TO BAG · $89
            </div>
            <div style={{
              height: 44,
              padding: "0 20px",
              background: settings.colors.paper,
              border: `1px solid rgba(21,20,15,0.12)`,
              color: settings.colors.ink,
              fontFamily: "var(--mono)",
              fontSize: 10,
              letterSpacing: "0.18em",
              display: "flex",
              alignItems: "center",
            }}>
              CHECKOUT →
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div className="mono" style={{
      fontSize: 9,
      color: "var(--muted)",
      letterSpacing: "0.2em",
      borderTop: "1px solid rgba(244,239,230,0.12)",
      paddingTop: 16,
      marginBottom: 16,
      marginTop: 8,
    }}>
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mono" style={{
      fontSize: 9,
      color: "var(--muted)",
      letterSpacing: "0.16em",
      marginBottom: 8,
    }}>
      {children}
    </div>
  );
}

const adminInput: React.CSSProperties = {
  width: "100%",
  height: 38,
  padding: "0 10px",
  background: "rgba(244,239,230,0.06)",
  border: "1px solid rgba(244,239,230,0.14)",
  color: "var(--cream)",
  fontFamily: "var(--sans)",
  fontSize: 13,
  outline: "none",
  marginBottom: 16,
};
