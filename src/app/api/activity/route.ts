import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET /api/activity - Get activity log with pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const type = searchParams.get("type");
    const skip = (page - 1) * limit;

    // Since we don't have an activity log table, we'll synthesize from existing data
    // In production, you'd want a proper ActivityLog table
    const [users, sessions, recordings] = await Promise.all([
      db.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
        },
      }),
      db.session.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          teacher: { select: { firstName: true, lastName: true } },
        },
      }),
    db.recording.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        teacher: { select: { firstName: true, lastName: true, role: true } },
      },
    }),
    ]);

    // Build activity items
    const activities: Array<{
      id: string;
      type: string;
      description: string;
      userId: string | null;
      userName: string | null;
      userRole: string | null;
      metadata: Record<string, unknown> | null;
      createdAt: Date;
    }> = [];

    // Add user creation activities
    users.forEach((user) => {
      activities.push({
        id: `user-${user.id}`,
        type: "USER_CREATED",
        description: `New ${user.role.toLowerCase()} account created: ${user.firstName} ${user.lastName}`,
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        userRole: user.role,
        metadata: null,
        createdAt: user.createdAt,
      });
    });

    // Add session creation activities
    sessions.forEach((sess) => {
      activities.push({
        id: `session-${sess.id}`,
        type: "SESSION_CREATED",
        description: `Session scheduled: ${sess.title}`,
        userId: sess.teacherId,
        userName: `${sess.teacher.firstName} ${sess.teacher.lastName}`,
        userRole: "TEACHER",
        metadata: { subject: sess.subject, yearGroup: sess.yearGroup },
        createdAt: sess.createdAt,
      });
    });

    // Add recording upload activities
    recordings.forEach((rec) => {
      activities.push({
        id: `recording-${rec.id}`,
        type: "RECORDING_UPLOADED",
        description: `Recording uploaded: ${rec.title}`,
        userId: rec.teacherId,
        userName: `${rec.teacher.firstName} ${rec.teacher.lastName}`,
        userRole: rec.teacher.role,
        metadata: { subject: rec.subject, yearGroup: rec.yearGroup },
        createdAt: rec.createdAt,
      });
    });

    // Sort by date
    activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Filter by type if specified
    const filteredActivities = type
      ? activities.filter((a) => a.type === type)
      : activities;

    // Paginate
    const paginatedActivities = filteredActivities.slice(skip, skip + limit);
    const total = filteredActivities.length;

    return NextResponse.json({
      data: paginatedActivities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching activity:", error);
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
  }
}

