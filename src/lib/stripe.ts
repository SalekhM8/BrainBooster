import Stripe from "stripe";

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

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

