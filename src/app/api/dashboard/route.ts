import { NextResponse } from "next/server";
import { db, getCached, setCache, sessionSelectMinimal, recordingSelectMinimal, userSelectMinimal } from "@/lib/db";
import { getSession } from "@/lib/auth";

// Cache TTL in seconds
const CACHE_TTL = 30;

// GET /api/dashboard - Dashboard data for students/teachers with caching
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const role = session.user.role;
    const cacheKey = `dashboard:${userId}`;

    // Check cache first
    const cached = getCached(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          "X-Cache": "HIT",
          "Cache-Control": "private, max-age=30",
        },
      });
    }

    // Get user data with minimal select
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        subjects: true,
        yearGroup: true,
        subscription: {
          select: { status: true, tier: true },
        },
      },
    });

    const subjects = user?.subjects ? JSON.parse(user.subjects) : [];
    const yearGroup = user?.yearGroup;

    // Build where clause for sessions/recordings
    const whereClause: Record<string, unknown> = {};
    if (role === "STUDENT") {
      if (subjects.length) whereClause.subject = { in: subjects };
      if (yearGroup) whereClause.yearGroup = yearGroup;
    } else if (role === "TEACHER") {
      whereClause.teacherId = userId;
    }

    // Parallel queries for maximum performance
    const [
      upcomingSessions,
      recordingViews,
      recentSessions,
      recentRecordings,
    ] = await Promise.all([
      // Count upcoming sessions
      db.session.count({
        where: {
          ...whereClause,
          scheduledAt: { gte: new Date() },
          isCancelled: false,
        },
      }),
      // Get recording view stats
      db.recordingView.aggregate({
        where: { userId },
        _count: true,
        _sum: { progress: true },
      }),
      // Recent sessions with minimal teacher data
      db.session.findMany({
        where: {
          ...whereClause,
          scheduledAt: { gte: new Date() },
          isCancelled: false,
        },
        select: {
          ...sessionSelectMinimal,
          teacher: { select: userSelectMinimal },
        },
        orderBy: { scheduledAt: "asc" },
        take: 3,
      }),
      // Recent recordings with minimal fields
      db.recording.findMany({
        where: {
          isPublished: true,
          ...(role === "STUDENT" ? whereClause : { uploaderId: userId }),
        },
        select: recordingSelectMinimal,
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
    ]);

    const data = {
      upcomingSessions,
      totalRecordingsWatched: recordingViews._count,
      totalWatchTime: recordingViews._sum.watchTime || 0,
      subscriptionStatus: user?.subscription?.status || "NONE",
      recentSessions,
      recentRecordings,
    };

    // Cache the result
    setCache(cacheKey, data, CACHE_TTL);

    return NextResponse.json(data, {
      headers: {
        "X-Cache": "MISS",
        "Cache-Control": "private, max-age=30",
      },
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
