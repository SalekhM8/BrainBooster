import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";

// GET /api/pricing-plans - Get all pricing plans (public for pricing page)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

    const where = activeOnly ? { isActive: true } : {};

    const plans = await db.pricingPlan.findMany({
      where,
      orderBy: { sortOrder: "asc" },
    });

    // Parse JSON fields
    const parsedPlans = plans.map((plan) => ({
      ...plan,
      features: JSON.parse(plan.features || "[]"),
      subjects: JSON.parse(plan.subjects || "[]"),
    }));

    return NextResponse.json(parsedPlans);
  } catch (error) {
    console.error("Error fetching pricing plans:", error);
    return NextResponse.json({ error: "Failed to fetch pricing plans" }, { status: 500 });
  }
}

// Helper to create Stripe product and prices
async function createStripeProductAndPrices(
  name: string,
  description: string | null,
  priceMonthlyPence: number,
  priceYearlyPence: number | null
): Promise<{ productId: string; monthlyPriceId: string; yearlyPriceId: string | null }> {
  const stripe = getStripe();

  // Create Stripe product
  const product = await stripe.products.create({
    name: `BrainBooster - ${name}`,
    description: description || `${name} subscription plan`,
  });

  // Create monthly price
  const monthlyPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: priceMonthlyPence,
    currency: "gbp",
    recurring: { interval: "month" },
  });

  // Create yearly price if provided
  let yearlyPriceId: string | null = null;
  if (priceYearlyPence) {
    const yearlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: priceYearlyPence,
      currency: "gbp",
      recurring: { interval: "year" },
    });
    yearlyPriceId = yearlyPrice.id;
  }

  return {
    productId: product.id,
    monthlyPriceId: monthlyPrice.id,
    yearlyPriceId,
  };
}

// POST /api/pricing-plans - Create a new pricing plan (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      tier,
      priceMonthly,
      priceYearly,
      features,
      subjects,
      isPopular,
      isActive,
      sortOrder,
    } = body;

    const priceMonthlyPence = Math.round(priceMonthly * 100);
    const priceYearlyPence = priceYearly ? Math.round(priceYearly * 100) : null;

    // Automatically create Stripe product and prices
    const { productId, monthlyPriceId, yearlyPriceId } = await createStripeProductAndPrices(
      name,
      description,
      priceMonthlyPence,
      priceYearlyPence
    );

    const plan = await db.pricingPlan.create({
      data: {
        name,
        description,
        tier,
        priceMonthly: priceMonthlyPence,
        priceYearly: priceYearlyPence,
        features: JSON.stringify(features || []),
        subjects: JSON.stringify(subjects || []),
        isPopular: isPopular || false,
        isActive: isActive !== false,
        sortOrder: sortOrder || 0,
        stripeProductId: productId,
        stripePriceIdMonthly: monthlyPriceId,
        stripePriceIdYearly: yearlyPriceId,
      },
    });

    return NextResponse.json({
      ...plan,
      features: JSON.parse(plan.features),
      subjects: JSON.parse(plan.subjects),
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating pricing plan:", error);
    return NextResponse.json({ error: "Failed to create pricing plan" }, { status: 500 });
  }
}

