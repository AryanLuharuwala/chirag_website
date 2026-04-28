import TopNav from "@/components/top-nav";
import SiteFooter from "@/components/site-footer";
import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <>
      <TopNav />
      <section style={{
        padding: "120px 36px",
        background: "var(--cream)",
        minHeight: "70vh",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div className="mono" style={{
          fontSize: 10,
          color: "var(--muted)",
          marginBottom: 16,
          letterSpacing: "0.2em",
        }}>
          ORDER CONFIRMED
        </div>
        <h1 className="serif" style={{
          fontSize: "clamp(48px, 7vw, 84px)",
          lineHeight: 0.95,
          letterSpacing: "-0.03em",
          margin: "0 0 24px",
          color: "var(--ink)",
          fontWeight: 300,
        }}>
          Thank you.<br />
          <em style={{ fontWeight: 400 }}>It&apos;s on its way.</em>
        </h1>
        <p style={{
          fontFamily: "var(--sans)",
          fontSize: 15,
          color: "var(--muted)",
          maxWidth: 440,
          marginBottom: 40,
        }}>
          Your order is confirmed and wrapped in paper. You&apos;ll receive a shipping confirmation by email.
        </p>
        <Link href="/shop" style={{
          fontFamily: "var(--mono)",
          fontSize: 11,
          letterSpacing: "0.2em",
          color: "var(--ink)",
          textDecoration: "none",
          borderBottom: "1px solid var(--ink)",
          paddingBottom: 2,
        }}>
          CONTINUE SHOPPING →
        </Link>
      </section>
      <SiteFooter />
    </>
  );
}
