import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.toLowerCase();

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const results: {
      type: string;
      id: string;
      title: string;
      subtitle: string;
      link: string;
    }[] = [];

    // Search based on role
    if (session.user.role === "ADMIN") {
      // Admin can search users, sessions, recordings
      const [users, sessions, recordings] = await Promise.all([
        db.user.findMany({
          where: {
            OR: [
              { firstName: { contains: query } },
              { lastName: { contains: query } },
              { email: { contains: query } },
            ],
          },
          take: 5,
          select: { id: true, firstName: true, lastName: true, email: true, role: true },
        }),
        db.session.findMany({
          where: {
            OR: [
              { title: { contains: query } },
              { description: { contains: query } },
            ],
          },
          take: 5,
          select: { id: true, title: true, subject: true, yearGroup: true },
        }),
        db.recording.findMany({
          where: {
            OR: [
              { title: { contains: query } },
              { description: { contains: query } },
            ],
          },
          take: 5,
          select: { id: true, title: true, subject: true, yearGroup: true },
        }),
      ]);

      users.forEach((u) =>
        results.push({
          type: "user",
          id: u.id,
          title: `${u.firstName} ${u.lastName}`,
          subtitle: `${u.role} - ${u.email}`,
          link: `/admin/users/${u.id}`,
        })
      );

      sessions.forEach((s) =>
        results.push({
          type: "session",
          id: s.id,
          title: s.title,
          subtitle: `${s.subject} - ${s.yearGroup}`,
          link: `/admin/sessions`,
        })
      );

      recordings.forEach((r) =>
        results.push({
          type: "recording",
          id: r.id,
          title: r.title,
          subtitle: `${r.subject} - ${r.yearGroup}`,
          link: `/admin/recordings`,
        })
      );
    } else if (session.user.role === "TEACHER") {
      // Teachers search their sessions and recordings
      const [sessions, recordings] = await Promise.all([
        db.session.findMany({
          where: {
            teacherId: session.user.id,
            OR: [
              { title: { contains: query } },
              { description: { contains: query } },
            ],
          },
          take: 5,
          select: { id: true, title: true, subject: true, scheduledAt: true },
        }),
        db.recording.findMany({
          where: {
            uploaderId: session.user.id,
            OR: [
              { title: { contains: query } },
              { description: { contains: query } },
            ],
          },
          take: 5,
          select: { id: true, title: true, subject: true },
        }),
      ]);

      sessions.forEach((s) =>
        results.push({
          type: "session",
          id: s.id,
          title: s.title,
          subtitle: `${s.subject} - ${new Date(s.scheduledAt).toLocaleDateString()}`,
          link: `/teacher/schedule`,
        })
      );

      recordings.forEach((r) =>
        results.push({
          type: "recording",
          id: r.id,
          title: r.title,
          subtitle: r.subject,
          link: `/teacher/recordings`,
        })
      );
    } else {
      // Students search sessions and recordings
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { subjects: true, yearGroup: true },
      });

      const userSubjects = user?.subjects ? JSON.parse(user.subjects) : [];

      const [sessions, recordings] = await Promise.all([
        db.session.findMany({
          where: {
            isCancelled: false,
            scheduledAt: { gte: new Date() },
            ...(userSubjects.length ? { subject: { in: userSubjects } } : {}),
            ...(user?.yearGroup ? { yearGroup: user.yearGroup } : {}),
            OR: [
              { title: { contains: query } },
              { description: { contains: query } },
            ],
          },
          take: 5,
          select: { id: true, title: true, subject: true, scheduledAt: true },
        }),
        db.recording.findMany({
          where: {
            isPublished: true,
            ...(userSubjects.length ? { subject: { in: userSubjects } } : {}),
            ...(user?.yearGroup ? { yearGroup: user.yearGroup } : {}),
            OR: [
              { title: { contains: query } },
              { description: { contains: query } },
            ],
          },
          take: 5,
          select: { id: true, title: true, subject: true },
        }),
      ]);

      sessions.forEach((s) =>
        results.push({
          type: "session",
          id: s.id,
          title: s.title,
          subtitle: `${s.subject} - ${new Date(s.scheduledAt).toLocaleDateString()}`,
          link: `/dashboard/live-classes`,
        })
      );

      recordings.forEach((r) =>
        results.push({
          type: "recording",
          id: r.id,
          title: r.title,
          subtitle: r.subject,
          link: `/dashboard/recordings/${r.id}`,
        })
      );
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}

