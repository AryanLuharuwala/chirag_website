import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart-context";

export const metadata: Metadata = {
  title: "The Exclusive Rack — Summer Essentials",
  description: "Premium everyday wear. Women, Men, Kids. Timeless, confident, modern.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
