import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Prisma } from "@prisma/client";

// GET /api/quizzes
// Teacher: quizzes for sessions they teach (any status)
// Admin: all quizzes
// Student: PUBLISHED quizzes, OR APPROVED quizzes whose session has ended,
//          for sessions matching their subject + year group.
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    if (session.user.role === "ADMIN") {
      const where: Prisma.QuizWhereInput = status ? { status } : {};
      const quizzes = await db.quiz.findMany({
        where,
        include: {
          session: { select: { id: true, title: true, subject: true, yearGroup: true, scheduledAt: true, duration: true, teacherId: true } },
          _count: { select: { questions: true, attempts: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ data: quizzes });
    }

    if (session.user.role === "TEACHER") {
      const quizzes = await db.quiz.findMany({
        where: {
          session: { teacherId: session.user.id },
          ...(status ? { status } : {}),
        },
        include: {
          session: { select: { id: true, title: true, subject: true, yearGroup: true, scheduledAt: true, duration: true, teacherId: true } },
          _count: { select: { questions: true, attempts: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ data: quizzes });
    }

    // STUDENT
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { subjects: true, yearGroup: true },
    });
    if (!user) return NextResponse.json({ data: [] });

    const studentSubjects: string[] = user.subjects ? JSON.parse(user.subjects) : [];
    const now = new Date();

    const quizzes = await db.quiz.findMany({
      where: {
        status: { in: ["APPROVED", "PUBLISHED"] },
        session: {
          ...(studentSubjects.length > 0 ? { subject: { in: studentSubjects } } : {}),
          ...(user.yearGroup ? { yearGroup: user.yearGroup } : {}),
        },
      },
      include: {
        session: { select: { id: true, title: true, subject: true, yearGroup: true, scheduledAt: true, duration: true } },
        attempts: { where: { userId: session.user.id }, select: { id: true, score: true, total: true, completedAt: true } },
        _count: { select: { questions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Filter: an APPROVED quiz is only visible once its session has ended.
    const visible = quizzes.filter((q) => {
      const sessionEnd = new Date(q.session.scheduledAt.getTime() + q.session.duration * 60_000);
      if (q.status === "PUBLISHED") return true;
      return sessionEnd <= now;
    });

    return NextResponse.json({ data: visible });
  } catch (err) {
    console.error("[quizzes] GET error:", err);
    return NextResponse.json({ error: "Failed to load quizzes" }, { status: 500 });
  }
}
