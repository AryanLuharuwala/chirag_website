import { db } from "./index";
import { products, siteSettings } from "./schema";
import bcrypt from "bcryptjs";
import { users } from "./schema";

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

async function seed() {
  console.log("Seeding database...");

  // Seed products
  await db.insert(products).values(GARMENTS).onConflictDoNothing();
  console.log(`Seeded ${GARMENTS.length} products`);

  // Seed admin user
  const hash = await bcrypt.hash("admin123", 12);
  await db.insert(users).values({
    email: process.env.ADMIN_EMAIL || "admin@theexclusiverack.com",
    passwordHash: hash,
    name: "Admin",
    role: "admin",
  }).onConflictDoNothing();
  console.log("Seeded admin user");

  // Seed site settings
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await db.insert(siteSettings).values({ key, value }).onConflictDoUpdate({
      target: siteSettings.key,
      set: { value, updatedAt: new Date() },
    });
  }
  console.log("Seeded site settings");

  console.log("Done.");
}

seed().catch(console.error);
