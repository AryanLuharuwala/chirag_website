export const stripeEnabled = Boolean(process.env.STRIPE_SECRET_KEY);

// Lazily initialised so the module is safe to import at build time
// even when STRIPE_SECRET_KEY is absent.
let _stripe: import("stripe").default | null = null;

export function getStripe() {
  if (!stripeEnabled) return null;
  if (!_stripe) {
    // Dynamic require keeps the import out of the module evaluation path
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Stripe = require("stripe");
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-04-22.dahlia",
    });
  }
  return _stripe;
}

export function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
