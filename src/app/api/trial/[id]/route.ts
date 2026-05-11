import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// PATCH /api/trial/[id] — admin updates status / assigns session / edits notes
export async function PATCH(
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
    const { status, assignedSessionId, notes } = body;

    const allowedStatuses = [
      "PENDING",
      "CONFIRMED",
      "ATTENDED",
      "CONVERTED",
      "DECLINED",
      "NO_SHOW",
    ];

    const data: Record<string, unknown> = {};
    if (status !== undefined) {
      if (!allowedStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      data.status = status;
    }
    if (assignedSessionId !== undefined) data.assignedSessionId = assignedSessionId || null;
    if (notes !== undefined) data.notes = notes;

    const updated = await db.trialBooking.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update trial error:", error);
    return NextResponse.json({ error: "Failed to update trial" }, { status: 500 });
  }
}

// DELETE /api/trial/[id] — admin removes a booking
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await db.trialBooking.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete trial error:", error);
    return NextResponse.json({ error: "Failed to delete trial" }, { status: 500 });
  }
}
