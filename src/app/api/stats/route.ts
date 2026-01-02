import { NextResponse } from "next/server";
import { db, getCached, setCache, userSelectMinimal } from "@/lib/db";
import { getSession } from "@/lib/auth";

// Cache TTL in seconds
const CACHE_TTL = 30;

// GET /api/stats - Get dashboard stats with caching
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cacheKey = `stats:${session.user.id}:${session.user.role}`;
    
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

    let data;

    // Admin stats
    if (session.user.role === "ADMIN") {
      const [
        totalUsers,
        activeSubscribers,
        totalSessions,
        totalRecordings,
        upcomingSessions,
        totalViews,
        recentUsers,
      ] = await Promise.all([
        db.user.count(),
        db.subscription.count({ where: { status: "ACTIVE" } }),
        db.session.count(),
        db.recording.count(),
        db.session.count({
          where: {
            scheduledAt: { gte: new Date() },
            isCancelled: false,
          },
        }),
        db.recording.aggregate({
          _sum: { viewCount: true },
        }),
        db.user.findMany({
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            ...userSelectMinimal,
            role: true,
            createdAt: true,
          },
        }),
      ]);

      data = {
        totalUsers,
        activeSubscribers,
        totalSessions,
        totalRecordings,
        upcomingSessions,
        totalViews: totalViews._sum.viewCount || 0,
        recentUsers,
      };
    }

    // Teacher stats
    else if (session.user.role === "TEACHER") {
      const [
        totalSessions,
        upcomingSessions,
        totalRecordings,
        totalViews,
      ] = await Promise.all([
        db.session.count({ where: { teacherId: session.user.id } }),
        db.session.count({
          where: {
            teacherId: session.user.id,
            scheduledAt: { gte: new Date() },
            isCancelled: false,
          },
        }),
        db.recording.count({ where: { uploaderId: session.user.id } }),
        db.recording.aggregate({
          where: { uploaderId: session.user.id },
          _sum: { viewCount: true },
        }),
      ]);

      data = {
        totalSessions,
        upcomingSessions,
        totalRecordings,
        totalViews: totalViews._sum.viewCount || 0,
      };
    }

    // Student stats
    else if (session.user.role === "STUDENT") {
      const [user, upcomingSessions, watchedRecordings] = await Promise.all([
        db.user.findUnique({
          where: { id: session.user.id },
          select: {
            subscription: {
              select: { status: true, tier: true },
            },
          },
        }),
        db.session.count({
          where: {
            scheduledAt: { gte: new Date() },
            isCancelled: false,
          },
        }),
        db.recordingView.count({
          where: { userId: session.user.id },
        }),
      ]);

      data = {
        subscriptionStatus: user?.subscription?.status || "INACTIVE",
        subscriptionTier: user?.subscription?.tier || null,
        upcomingSessions,
        watchedRecordings,
      };
    }

    else {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Cache the result
    setCache(cacheKey, data, CACHE_TTL);

    return NextResponse.json(data, {
      headers: {
        "X-Cache": "MISS",
        "Cache-Control": "private, max-age=30",
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
