import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET /api/dashboard/teacher - Dashboard data for teachers
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacherId = session.user.id;
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Parallel queries for performance
    const [
      totalSessions,
      totalRecordings,
      viewsAggregate,
      studentsCount,
      todaySessions,
      recentRecordings,
    ] = await Promise.all([
      // Sessions this week
      db.session.count({
        where: {
          teacherId,
          scheduledAt: { gte: weekAgo },
          isCancelled: false,
        },
      }),
      // Total recordings
      db.recording.count({
        where: { teacherId },
      }),
      // Total views on all recordings
      db.recording.aggregate({
        where: { teacherId },
        _sum: { viewCount: true },
      }),
      // Active students count (unique students in their subject/year groups)
      db.user.count({
        where: {
          role: "STUDENT",
          isActive: true,
        },
      }),
      // Today's sessions
      db.session.findMany({
        where: {
          teacherId,
          scheduledAt: {
            gte: startOfToday,
            lt: endOfToday,
          },
          isCancelled: false,
        },
        orderBy: { scheduledAt: "asc" },
        take: 5,
      }),
      // Recent recordings by views
      db.recording.findMany({
        where: { teacherId },
        orderBy: { viewCount: "desc" },
        take: 3,
      }),
    ]);

    return NextResponse.json({
      totalSessions,
      totalRecordings,
      totalViews: viewsAggregate._sum.viewCount || 0,
      studentsCount,
      todaySessions,
      recentRecordings,
    });
  } catch (error) {
    console.error("Teacher dashboard API error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}

