import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      planId, 
      billingInterval = "monthly",
      email,
      password,
      firstName,
      lastName,
      yearGroup,
      subjects,
    } = body;

    // Validate required fields
    if (!planId || !email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Hash the password to store in metadata
    const hashedPassword = await bcrypt.hash(password, 12);

    // Get the pricing plan
    const plan = await db.pricingPlan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.isActive) {
      return NextResponse.json(
        { error: "Invalid or inactive plan" },
        { status: 400 }
      );
    }

    // Get the appropriate Stripe price ID
    const stripePriceId = billingInterval === "yearly" 
      ? plan.stripePriceIdYearly 
      : plan.stripePriceIdMonthly;

    if (!stripePriceId) {
      return NextResponse.json(
        { error: "Stripe price not configured for this plan" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please login." },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3003";
    
    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      customer_email: email,
      metadata: {
        planId: plan.id,
        planTier: plan.tier,
        firstName,
        lastName,
        yearGroup: yearGroup || "",
        subjects: JSON.stringify(subjects || []),
        hashedPassword,
      },
      success_url: `${appUrl}/auth/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing?cancelled=true`,
      subscription_data: {
        metadata: {
          planId: plan.id,
          planTier: plan.tier,
        },
      },
    });

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

