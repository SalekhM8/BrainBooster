import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET /api/recordings - Get recordings with pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subject = searchParams.get("subject");
    const yearGroup = searchParams.get("yearGroup");
    const teacherIdParam = searchParams.get("teacherId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "12"), 50); // Max 50
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (subject && subject !== "all") where.subject = subject;
    if (yearGroup) where.yearGroup = yearGroup;
    if (teacherIdParam) where.teacherId = teacherIdParam;

    // Students only see published recordings matching their subjects/year
    if (session.user.role === "STUDENT") {
      where.isPublished = true;
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

    // Teachers only see their own recordings (published and drafts)
    if (session.user.role === "TEACHER") {
      where.teacherId = session.user.id;
    }
    
    // Admins see ALL recordings (no filter on isPublished)

    // Parallel fetch for performance
    const [recordings, total] = await Promise.all([
      db.recording.findMany({
        where,
        include: {
          teacher: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.recording.count({ where }),
    ]);

    return NextResponse.json({
      data: recordings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching recordings:", error);
    return NextResponse.json({ error: "Failed to fetch recordings" }, { status: 500 });
  }
}

// POST /api/recordings
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !["ADMIN", "TEACHER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, subject, yearGroup, videoUrl, thumbnailUrl, duration, sessionId } = body;

    const recording = await db.recording.create({
      data: {
        title,
        description,
        subject,
        yearGroup,
        videoUrl,
        thumbnailUrl,
        duration,
        sessionId,
        teacherId: session.user.id,
      },
      include: {
        teacher: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return NextResponse.json(recording, { status: 201 });
  } catch (error) {
    console.error("Error creating recording:", error);
    return NextResponse.json({ error: "Failed to create recording" }, { status: 500 });
  }
}
