import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, hashPassword } from "@/lib/auth";

// GET /api/users/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        subjects: true,
        yearGroup: true,
        createdAt: true,
        subscription: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

// PUT /api/users/[id]
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

    const updateData: Record<string, unknown> = {};

    // User fields
    if (body.firstName !== undefined) updateData.firstName = body.firstName;
    if (body.lastName !== undefined) updateData.lastName = body.lastName;
    if (body.role !== undefined) updateData.role = body.role;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.yearGroup !== undefined) updateData.yearGroup = body.yearGroup;

    if (body.subjects) {
      updateData.subjects = JSON.stringify(body.subjects);
    }

    if (body.password) {
      updateData.password = await hashPassword(body.password);
    }

    // Update user
    const user = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        subjects: true,
        yearGroup: true,
        createdAt: true,
        subscription: true,
      },
    });

    // Update subscription/homework credentials if provided
    if (body.subscription && user.subscription) {
      await db.subscription.update({
        where: { userId: id },
        data: {
          tier: body.subscription.tier ?? user.subscription.tier,
          status: body.subscription.status ?? user.subscription.status,
          homeworkSiteAccess: body.subscription.homeworkSiteAccess ?? user.subscription.homeworkSiteAccess,
          homeworkSiteUrl: body.subscription.homeworkSiteUrl ?? user.subscription.homeworkSiteUrl,
          homeworkUsername: body.subscription.homeworkUsername ?? user.subscription.homeworkUsername,
          homeworkPassword: body.subscription.homeworkPassword ?? user.subscription.homeworkPassword,
        },
      });
    }

    // Fetch updated user with subscription
    const updatedUser = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        subjects: true,
        yearGroup: true,
        createdAt: true,
        subscription: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

// DELETE /api/users/[id]
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
    
    // Don't actually delete, just deactivate
    await db.user.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}

