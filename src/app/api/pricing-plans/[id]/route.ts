import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

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
      stripePriceIdMonthly,
      stripePriceIdYearly,
    } = body;

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (tier !== undefined) updateData.tier = tier;
    if (priceMonthly !== undefined) updateData.priceMonthly = Math.round(priceMonthly * 100);
    if (priceYearly !== undefined) updateData.priceYearly = priceYearly ? Math.round(priceYearly * 100) : null;
    if (features !== undefined) updateData.features = JSON.stringify(features);
    if (subjects !== undefined) updateData.subjects = JSON.stringify(subjects);
    if (isPopular !== undefined) updateData.isPopular = isPopular;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    if (stripePriceIdMonthly !== undefined) updateData.stripePriceIdMonthly = stripePriceIdMonthly;
    if (stripePriceIdYearly !== undefined) updateData.stripePriceIdYearly = stripePriceIdYearly;

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

