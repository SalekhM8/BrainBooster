import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";

// GET /api/pricing-plans/[id] - Get a single pricing plan
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const plan = await db.pricingPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...plan,
      features: JSON.parse(plan.features || "[]"),
      subjects: JSON.parse(plan.subjects || "[]"),
    });
  } catch (error) {
    console.error("Error fetching pricing plan:", error);
    return NextResponse.json({ error: "Failed to fetch pricing plan" }, { status: 500 });
  }
}

// Helper to create or update Stripe prices
async function updateStripePrices(
  existingProductId: string | null,
  name: string,
  description: string | null,
  priceMonthlyPence: number,
  priceYearlyPence: number | null,
  oldMonthlyPriceId: string | null,
  oldYearlyPriceId: string | null,
  priceChanged: boolean
): Promise<{ productId: string; monthlyPriceId: string; yearlyPriceId: string | null }> {
  const stripe = getStripe();

  let productId = existingProductId;

  // Create product if it doesn't exist
  if (!productId) {
    const product = await stripe.products.create({
      name: `BrainBooster - ${name}`,
      description: description || `${name} subscription plan`,
    });
    productId = product.id;
  } else {
    // Update product name/description
    await stripe.products.update(productId, {
      name: `BrainBooster - ${name}`,
      description: description || `${name} subscription plan`,
    });
  }

  let monthlyPriceId = oldMonthlyPriceId;
  let yearlyPriceId = oldYearlyPriceId;

  // If price changed or no price exists, create new prices
  if (priceChanged || !monthlyPriceId) {
    // Archive old prices if they exist
    if (oldMonthlyPriceId) {
      await stripe.prices.update(oldMonthlyPriceId, { active: false });
    }
    if (oldYearlyPriceId) {
      await stripe.prices.update(oldYearlyPriceId, { active: false });
    }

    // Create new monthly price
    const newMonthlyPrice = await stripe.prices.create({
      product: productId,
      unit_amount: priceMonthlyPence,
      currency: "gbp",
      recurring: { interval: "month" },
    });
    monthlyPriceId = newMonthlyPrice.id;

    // Create new yearly price if provided
    if (priceYearlyPence) {
      const newYearlyPrice = await stripe.prices.create({
        product: productId,
        unit_amount: priceYearlyPence,
        currency: "gbp",
        recurring: { interval: "year" },
      });
      yearlyPriceId = newYearlyPrice.id;
    } else {
      yearlyPriceId = null;
    }
  }

  return { productId, monthlyPriceId: monthlyPriceId!, yearlyPriceId };
}

// PUT /api/pricing-plans/[id] - Update a pricing plan (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
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

    // Get existing plan to check for price changes
    const existingPlan = await db.pricingPlan.findUnique({ where: { id } });
    if (!existingPlan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (tier !== undefined) updateData.tier = tier;
    if (features !== undefined) updateData.features = JSON.stringify(features);
    if (subjects !== undefined) updateData.subjects = JSON.stringify(subjects);
    if (isPopular !== undefined) updateData.isPopular = isPopular;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    // Handle price changes - auto-create new Stripe prices
    const newPriceMonthlyPence = priceMonthly !== undefined ? Math.round(priceMonthly * 100) : existingPlan.priceMonthly;
    const newPriceYearlyPence = priceYearly !== undefined ? (priceYearly ? Math.round(priceYearly * 100) : null) : existingPlan.priceYearly;

    const priceChanged = 
      newPriceMonthlyPence !== existingPlan.priceMonthly ||
      newPriceYearlyPence !== existingPlan.priceYearly;

    // Only interact with Stripe if prices changed OR if we don't have Stripe IDs
    if (priceChanged || !existingPlan.stripePriceIdMonthly) {
      const { productId, monthlyPriceId, yearlyPriceId } = await updateStripePrices(
        existingPlan.stripeProductId,
        name || existingPlan.name,
        description !== undefined ? description : existingPlan.description,
        newPriceMonthlyPence,
        newPriceYearlyPence,
        existingPlan.stripePriceIdMonthly,
        existingPlan.stripePriceIdYearly,
        priceChanged
      );

      updateData.stripeProductId = productId;
      updateData.stripePriceIdMonthly = monthlyPriceId;
      updateData.stripePriceIdYearly = yearlyPriceId;
    }

    if (priceMonthly !== undefined) updateData.priceMonthly = newPriceMonthlyPence;
    if (priceYearly !== undefined) updateData.priceYearly = newPriceYearlyPence;

    const plan = await db.pricingPlan.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      ...plan,
      features: JSON.parse(plan.features || "[]"),
      subjects: JSON.parse(plan.subjects || "[]"),
    });
  } catch (error) {
    console.error("Error updating pricing plan:", error);
    return NextResponse.json({ error: "Failed to update pricing plan" }, { status: 500 });
  }
}

// DELETE /api/pricing-plans/[id] - Delete a pricing plan (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await db.pricingPlan.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting pricing plan:", error);
    return NextResponse.json({ error: "Failed to delete pricing plan" }, { status: 500 });
  }
}

