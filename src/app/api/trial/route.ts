import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

// POST /api/trial — public endpoint, parent submits trial booking from landing page
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      parentName,
      parentEmail,
      parentPhone,
      childFirstName,
      childYearGroup,
      subject,
      preferredTime,
      notes,
      source,
    } = body;

    if (!parentName || !parentEmail || !childFirstName || !childYearGroup || !subject) {
      return NextResponse.json(
        { error: "Please fill out all required fields." },
        { status: 400 }
      );
    }

    const allowedYears = ["KS3", "KS4", "GCSE", "A_LEVEL"];
    const allowedSubjects = ["MATHS", "ENGLISH", "BOTH"];
    if (!allowedYears.includes(childYearGroup)) {
      return NextResponse.json({ error: "Invalid year group." }, { status: 400 });
    }
    if (!allowedSubjects.includes(subject)) {
      return NextResponse.json({ error: "Invalid subject." }, { status: 400 });
    }

    const booking = await db.trialBooking.create({
      data: {
        parentName: parentName.trim(),
        parentEmail: parentEmail.trim().toLowerCase(),
        parentPhone: parentPhone?.trim() || null,
        childFirstName: childFirstName.trim(),
        childYearGroup,
        subject,
        preferredTime: preferredTime?.trim() || null,
        notes: notes?.trim() || null,
        source: source || "LANDING",
      },
    });

    // Notify admin (console-logged email in dev)
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "salekh.mahmood1@gmail.com";
    await sendEmail({
      to: adminEmail,
      subject: `New trial booking — ${booking.parentName} (${booking.childYearGroup} ${booking.subject})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2>New trial booking</h2>
          <p><strong>Parent:</strong> ${booking.parentName} &lt;${booking.parentEmail}&gt;</p>
          <p><strong>Phone:</strong> ${booking.parentPhone || "—"}</p>
          <p><strong>Child:</strong> ${booking.childFirstName} (${booking.childYearGroup})</p>
          <p><strong>Subject:</strong> ${booking.subject}</p>
          <p><strong>Preferred time:</strong> ${booking.preferredTime || "—"}</p>
          <p><strong>Notes:</strong> ${booking.notes || "—"}</p>
          <p style="margin-top:20px;"><a href="${process.env.NEXTAUTH_URL || ""}/admin/trials">View in admin →</a></p>
        </div>
      `,
    });

    // Confirmation to parent
    await sendEmail({
      to: booking.parentEmail,
      subject: "We received your trial request — BrainBooster",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color:#0f2557">Thanks, ${booking.parentName.split(" ")[0]}!</h2>
          <p>We've received your trial request for <strong>${booking.childFirstName}</strong>.</p>
          <p>A member of the BrainBooster team will be in touch within one working day to confirm a session time. If it's urgent, WhatsApp us on +44 7756 980100.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
          <p style="color:#7a8aaa;font-size:13px">The BrainBooster Academy</p>
        </div>
      `,
    });

    return NextResponse.json(
      { ok: true, id: booking.id, message: "Trial request received." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Trial booking error:", error);
    return NextResponse.json(
      { error: "Failed to submit trial request." },
      { status: 500 }
    );
  }
}

// GET /api/trial — admin only, list bookings with optional status filter
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status && status !== "all") where.status = status;

    const [bookings, total] = await Promise.all([
      db.trialBooking.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.trialBooking.count({ where }),
    ]);

    return NextResponse.json({
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("List trial bookings error:", error);
    return NextResponse.json({ error: "Failed to load trials" }, { status: 500 });
  }
}
