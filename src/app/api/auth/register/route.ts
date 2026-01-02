import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { sendEmail, generateWelcomeEmail } from "@/lib/email";
import { createNotification } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, subjects, yearGroup } = body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user with subscription
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        role: "STUDENT",
        subjects: subjects ? JSON.stringify(subjects) : JSON.stringify(["MATHS", "ENGLISH"]),
        yearGroup: yearGroup || "GCSE",
        subscription: {
          create: {
            tier: "BASIC",
            status: "ACTIVE",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
          },
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    // Create welcome notification
    await createNotification({
      userId: user.id,
      type: "SYSTEM",
      title: "Welcome to BrainBooster! 🎉",
      message: "Your account is ready. Start by checking your timetable or browsing recordings.",
      link: "/dashboard",
    });

    // Send welcome email
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    await sendEmail({
      to: user.email,
      subject: "Welcome to BrainBooster!",
      html: generateWelcomeEmail(user.firstName, `${baseUrl}/auth/login`),
    });

    return NextResponse.json({
      message: "Account created successfully",
      user: { email: user.email, firstName: user.firstName },
    }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}

