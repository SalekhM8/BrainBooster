import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET /api/sessions - Get sessions with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subject = searchParams.get("subject");
    const yearGroup = searchParams.get("yearGroup");
    const upcoming = searchParams.get("upcoming");
    const teacherId = searchParams.get("teacherId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100); // Max 100
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      isCancelled: false,
    };

    if (subject) where.subject = subject;
    if (yearGroup) where.yearGroup = yearGroup;
    if (teacherId) where.teacherId = teacherId;
    if (upcoming === "true") {
      where.scheduledAt = { gte: new Date() };
    }

    // Students only see sessions matching their subjects/year
    if (session.user.role === "STUDENT") {
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { subjects: true, yearGroup: true },
      });
      
      if (user?.subjects) {
        const subjects = JSON.parse(user.subjects);
        where.subject = { in: subjects };
      }
      if (user?.yearGroup) {
        where.yearGroup = user.yearGroup;
      }
    }

    // Teachers only see their own sessions
    if (session.user.role === "TEACHER") {
      where.teacherId = session.user.id;
    }

    // Parallel fetch for performance
    // Use ascending order for upcoming (soonest first), descending for past/all (most recent first)
    const orderDirection = upcoming === "true" ? "asc" : "desc";
    
    const [sessions, total] = await Promise.all([
      db.session.findMany({
        where,
        include: {
          teacher: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
        orderBy: { scheduledAt: orderDirection },
        skip,
        take: limit,
      }),
      db.session.count({ where }),
    ]);

    return NextResponse.json({
      data: sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

// POST /api/sessions - Create a new session (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, subject, yearGroup, scheduledAt, duration, meetingLink, teacherId } = body;

    const newSession = await db.session.create({
      data: {
        title,
        description,
        subject,
        yearGroup,
        scheduledAt: new Date(scheduledAt),
        duration: duration || 60,
        meetingLink,
        teacherId,
      },
      include: {
        teacher: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return NextResponse.json(newSession, { status: 201 });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
