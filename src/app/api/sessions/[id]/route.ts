import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET /api/sessions/[id] - Get a single session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const sessionData = await db.session.findUnique({
      where: { id },
      include: {
        teacher: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    if (!sessionData) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(sessionData);
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
  }
}

// PUT /api/sessions/[id] - Update a session
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
      title,
      description,
      subject,
      yearGroup,
      scheduledAt,
      duration,
      meetingLink,
      meetingPassword,
      teacherId,
      isLive,
      isCancelled,
    } = body;

    const updateData: Record<string, unknown> = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (subject !== undefined) updateData.subject = subject;
    if (yearGroup !== undefined) updateData.yearGroup = yearGroup;
    if (scheduledAt !== undefined) updateData.scheduledAt = new Date(scheduledAt);
    if (duration !== undefined) updateData.duration = duration;
    if (meetingLink !== undefined) updateData.meetingLink = meetingLink;
    if (meetingPassword !== undefined) updateData.meetingPassword = meetingPassword;
    if (teacherId !== undefined) updateData.teacherId = teacherId;
    if (isLive !== undefined) updateData.isLive = isLive;
    if (isCancelled !== undefined) updateData.isCancelled = isCancelled;

    const sessionData = await db.session.update({
      where: { id },
      data: updateData,
      include: {
        teacher: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return NextResponse.json(sessionData);
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }
}

// DELETE /api/sessions/[id] - Delete a session
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

    await db.session.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }
}
