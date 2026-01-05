import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const metadata = session.metadata;
  if (!metadata) {
    console.error("No metadata in checkout session");
    return;
  }

  const email = session.customer_email;
  if (!email) {
    console.error("No customer email in checkout session");
    return;
  }

  // Check if user already exists
  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    // Get the price ID from the Stripe subscription
    let stripePriceId: string | null = null;
    if (session.subscription) {
      const stripeSubscription = await getStripe().subscriptions.retrieve(session.subscription as string);
      stripePriceId = stripeSubscription.items.data[0]?.price?.id || null;
    }
    
    // Update existing user's subscription
    await db.subscription.upsert({
      where: { userId: existingUser.id },
      create: {
        userId: existingUser.id,
        tier: metadata.planTier || "BASIC",
        status: "ACTIVE",
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: session.subscription as string,
        stripePriceId,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        homeworkSiteAccess: metadata.planTier === "PREMIUM",
      },
      update: {
        tier: metadata.planTier || "BASIC",
        status: "ACTIVE",
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: session.subscription as string,
        stripePriceId,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        homeworkSiteAccess: metadata.planTier === "PREMIUM",
      },
    });
    return;
  }

  // Create new user - use the password hash from checkout form
  const hashedPassword = metadata.hashedPassword;
  
  if (!hashedPassword) {
    console.error("No hashed password in metadata");
    return;
  }

  const subjects = metadata.subjects ? JSON.parse(metadata.subjects) : ["MATHS", "ENGLISH"];

  // Get the price ID from the Stripe subscription
  let newUserStripePriceId: string | null = null;
  if (session.subscription) {
    const stripeSubscription = await getStripe().subscriptions.retrieve(session.subscription as string);
    newUserStripePriceId = stripeSubscription.items.data[0]?.price?.id || null;
  }

  const user = await db.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName: metadata.firstName || "New",
      lastName: metadata.lastName || "Student",
      role: "STUDENT",
      subjects: JSON.stringify(subjects),
      yearGroup: metadata.yearGroup || "GCSE",
      isActive: true,
      subscription: {
        create: {
          tier: metadata.planTier || "BASIC",
          status: "ACTIVE",
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          stripePriceId: newUserStripePriceId,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          homeworkSiteAccess: metadata.planTier === "PREMIUM",
        },
      },
    },
  });

  // Create welcome notification
  await db.notification.create({
    data: {
      userId: user.id,
      type: "SYSTEM",
      title: "Welcome to BrainBooster! 🎉",
      message: `Your ${metadata.planTier} subscription is now active. Check out your timetable and start learning!`,
      link: "/dashboard",
    },
  });

  console.log(`New user created: ${email}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const stripeSubscriptionId = subscription.id;
  
  // Find the subscription in our database
  const dbSubscription = await db.subscription.findFirst({
    where: { stripeSubscriptionId },
  });

  if (!dbSubscription) {
    console.log("Subscription not found in database:", stripeSubscriptionId);
    return;
  }

  // Map Stripe status to our status
  let status: "ACTIVE" | "CANCELLED" | "EXPIRED" | "PAST_DUE" = "ACTIVE";
  switch (subscription.status) {
    case "active":
      status = "ACTIVE";
      break;
    case "canceled":
      status = "CANCELLED";
      break;
    case "past_due":
      status = "PAST_DUE";
      break;
    case "unpaid":
      status = "EXPIRED";
      break;
    default:
      status = "ACTIVE";
  }

  // Get the current price ID from the subscription
  const currentPriceId = subscription.items.data[0]?.price?.id;
  
  // Try to determine the tier from the price ID
  let tier = dbSubscription.tier;
  let homeworkSiteAccess = dbSubscription.homeworkSiteAccess;
  
  if (currentPriceId) {
    // Find the plan that matches this price ID
    const matchingPlan = await db.pricingPlan.findFirst({
      where: {
        OR: [
          { stripePriceIdMonthly: currentPriceId },
          { stripePriceIdYearly: currentPriceId },
        ],
      },
    });
    
    if (matchingPlan) {
      tier = matchingPlan.tier;
      homeworkSiteAccess = matchingPlan.tier === "PREMIUM";
    }
  }

  // Update subscription - use type assertion for Stripe API compatibility
  const subData = subscription as unknown as { current_period_start: number; current_period_end: number };
  await db.subscription.update({
    where: { id: dbSubscription.id },
    data: {
      status,
      tier,
      homeworkSiteAccess,
      stripePriceId: currentPriceId || dbSubscription.stripePriceId,
      currentPeriodStart: new Date(subData.current_period_start * 1000),
      currentPeriodEnd: new Date(subData.current_period_end * 1000),
    },
  });
  
  console.log(`Subscription updated: ${stripeSubscriptionId} - tier: ${tier}, status: ${status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const stripeSubscriptionId = subscription.id;
  
  const dbSubscription = await db.subscription.findFirst({
    where: { stripeSubscriptionId },
  });

  if (!dbSubscription) {
    console.log("Subscription not found for deletion:", stripeSubscriptionId);
    return;
  }

  // Mark subscription as cancelled
  await db.subscription.update({
    where: { id: dbSubscription.id },
    data: {
      status: "CANCELLED",
    },
  });

  // Create notification
  await db.notification.create({
    data: {
      userId: dbSubscription.userId,
      type: "SUBSCRIPTION",
      title: "Subscription Cancelled",
      message: "Your subscription has been cancelled. You can resubscribe anytime to regain access.",
      link: "/pricing",
    },
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Use type assertion for Stripe API compatibility
  const invoiceData = invoice as unknown as { subscription: string | null };
  const subscriptionId = invoiceData.subscription;
  
  if (!subscriptionId) {
    return;
  }

  const dbSubscription = await db.subscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!dbSubscription) {
    return;
  }

  // Update status to past due
  await db.subscription.update({
    where: { id: dbSubscription.id },
    data: {
      status: "PAST_DUE",
    },
  });

  // Create notification
  await db.notification.create({
    data: {
      userId: dbSubscription.userId,
      type: "SUBSCRIPTION",
      title: "Payment Failed",
      message: "We couldn't process your payment. Please update your payment method to continue your subscription.",
      link: "/dashboard/subscription",
    },
  });
}

