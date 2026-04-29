// One-off seed runner that uses node-postgres (TCP) instead of @vercel/postgres (WebSocket).
// Needed locally because IPv6 routing to Neon is broken on this machine.
import dns from "dns";
dns.setDefaultResultOrder("ipv4first");
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import bcrypt from "bcryptjs";
import * as schema from "../lib/db/schema";
import { products, users, siteSettings } from "../lib/db/schema";

const GARMENTS = [
  { slug: "linen-shirt", name: "The Linen Shirt", category: "Women" as const, price: "89.00", colorKey: "white" as const, tone: "Crisp White", description: "Belgian linen, mother-of-pearl buttons. A single seam runs the length of the back; relaxed through the body, drawn at the cuff.", position: 1 },
  { slug: "wide-leg-trouser", name: "Wide-Leg Trouser", category: "Women" as const, price: "145.00", colorKey: "sky" as const, tone: "Sky Blue", description: "High-rise, fluid cotton sateen. Cut for movement; pressed pleat holds without ironing.", position: 2 },
  { slug: "cropped-knit-tee", name: "Cropped Knit Tee", category: "Women" as const, price: "64.00", colorKey: "sage" as const, tone: "Sage Green", description: "Egyptian cotton rib. Sits an inch above the waistband. Wears in, never out.", position: 3 },
  { slug: "sun-dress", name: "The Sun Dress", category: "Women" as const, price: "168.00", colorKey: "red" as const, tone: "Sunset Red", description: "Plant-dyed twill, rouleau straps, hidden side zip. Heavier than it looks.", position: 4 },
  { slug: "oxford-off-white", name: "Oxford in Off-White", category: "Men" as const, price: "110.00", colorKey: "white" as const, tone: "Crisp White", description: "Yarn-dyed Japanese oxford. Double-needle felled seams. Softens in three washes.", position: 5 },
  { slug: "pleated-walking-short", name: "Pleated Walking Short", category: "Men" as const, price: "92.00", colorKey: "sky" as const, tone: "Sky Blue", description: "8-inch inseam. Single forward pleat, side adjusters. Cotton-linen twill, garment dyed.", position: 6 },
  { slug: "camp-collar-shirt", name: "Camp Collar Shirt", category: "Men" as const, price: "96.00", colorKey: "sage" as const, tone: "Sage Green", description: "Open weave, drapes wet. Made for a pocket of cigarettes you no longer smoke.", position: 7 },
  { slug: "terry-polo", name: "Terry Polo", category: "Men" as const, price: "78.00", colorKey: "red" as const, tone: "Sunset Red", description: "12-gauge cotton terry, three buttons. The texture does the talking.", position: 8 },
  { slug: "pinafore-tee", name: "Pinafore Tee", category: "Kids" as const, price: "38.00", colorKey: "white" as const, tone: "Crisp White", description: "Soft jersey, no tags. Generous in the body so it grows with them, not on them.", position: 9 },
  { slug: "sailor-short", name: "Sailor Short", category: "Kids" as const, price: "34.00", colorKey: "sky" as const, tone: "Sky Blue", description: "Elastic back, two pockets, cotton ripstop. Survives the weekend.", position: 10 },
  { slug: "garden-bucket-hat", name: "Garden Bucket Hat", category: "Kids" as const, price: "28.00", colorKey: "sage" as const, tone: "Sage Green", description: "Lined brim, chin tie. Folds flat for the bag.", position: 11 },
  { slug: "strawberry-romper", name: "Strawberry Romper", category: "Kids" as const, price: "52.00", colorKey: "red" as const, tone: "Sunset Red", description: "Snap front, snap shoulders. Naturally dyed; the color fades into something better.", position: 12 },
];

const DEFAULT_SETTINGS = {
  colors: {
    cream: "#F4EFE6",
    cream2: "#EAE3D5",
    paper: "#FBFAF6",
    ink: "#15140F",
    ink2: "#2E2A22",
    muted: "#7A7263",
    cWhite: "#FBFAF6",
    cSky: "oklch(82% 0.06 230)",
    cRed: "oklch(60% 0.16 28)",
    cSage: "oklch(78% 0.05 145)",
  },
  intro: "marquee",
  siteName: "The Exclusive Rack",
  tagline: "Summer Essentials, quietly made.",
  footerTagline: "PORTO · LISBON · NEW YORK",
};

const url = process.env.DATABASE_URL_UNPOOLED || process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) throw new Error("No POSTGRES_URL/DATABASE_URL set");

async function run() {
  const u = new URL(url!);
const v4 = await dns.promises.lookup(u.hostname, { family: 4 });
console.log(`Resolved ${u.hostname} -> ${v4.address}`);
const pool = new pg.Pool({
  host: v4.address,
  port: Number(u.port) || 5432,
  user: decodeURIComponent(u.username),
  password: decodeURIComponent(u.password),
  database: u.pathname.replace(/^\//, ""),
  ssl: { rejectUnauthorized: false, servername: u.hostname },
});
  const db = drizzle(pool, { schema });

  if (process.argv.includes("--migrate")) {
    const fs = await import("fs");
    const path = await import("path");
    const dir = path.resolve("drizzle");
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
    for (const f of files) {
      console.log(`Applying ${f}...`);
      const sqlText = fs.readFileSync(path.join(dir, f), "utf8");
      const stmts = sqlText.split("--> statement-breakpoint").map((s) => s.trim()).filter(Boolean);
      for (const s of stmts) {
        try { await pool.query(s); }
        catch (e: any) {
          if (/already exists/i.test(e.message)) console.log(`  skip (exists): ${e.message.split("\n")[0]}`);
          else throw e;
        }
      }
    }
  }

  console.log("Seeding database...");

  await db.insert(products).values(GARMENTS).onConflictDoNothing();
  console.log(`Seeded ${GARMENTS.length} products`);

  const hash = await bcrypt.hash("admin123", 12);
  await db.insert(users).values({
    email: process.env.ADMIN_EMAIL || "admin@theexclusiverack.com",
    passwordHash: hash,
    name: "Admin",
    role: "admin",
  }).onConflictDoNothing();
  console.log("Seeded admin user");

  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await db.insert(siteSettings).values({ key, value }).onConflictDoUpdate({
      target: siteSettings.key,
      set: { value, updatedAt: new Date() },
    });
  }
  console.log("Seeded site settings");

  console.log("Done.");
  await pool.end();
}

run().catch((e) => { console.error(e); process.exit(1); });
