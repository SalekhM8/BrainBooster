import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

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

    const plan = await db.pricingPlan.create({
      data: {
        name,
        description,
        tier,
        priceMonthly: Math.round(priceMonthly * 100), // Convert to pence
        priceYearly: priceYearly ? Math.round(priceYearly * 100) : null,
        features: JSON.stringify(features || []),
        subjects: JSON.stringify(subjects || []),
        isPopular: isPopular || false,
        isActive: isActive !== false,
        sortOrder: sortOrder || 0,
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

