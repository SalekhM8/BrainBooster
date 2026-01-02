import Stripe from "stripe";

// Lazy-initialized Stripe instance to avoid build-time errors
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    stripeInstance = new Stripe(secretKey, {
      typescript: true,
    });
  }
  return stripeInstance;
}

// For backwards compatibility - use getStripe() in new code
export const stripe = {
  get checkout() { return getStripe().checkout; },
  get customers() { return getStripe().customers; },
  get subscriptions() { return getStripe().subscriptions; },
  get billingPortal() { return getStripe().billingPortal; },
  get webhooks() { return getStripe().webhooks; },
  get prices() { return getStripe().prices; },
  get products() { return getStripe().products; },
};

// Helper to format price for display
export function formatPrice(priceInCents: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(priceInCents / 100);
}

// Helper to get Stripe price ID from plan
export function getStripePriceId(
  plan: { stripePriceIdMonthly: string | null; stripePriceIdYearly: string | null },
  billingInterval: "monthly" | "yearly"
): string | null {
  return billingInterval === "yearly" ? plan.stripePriceIdYearly : plan.stripePriceIdMonthly;
}
