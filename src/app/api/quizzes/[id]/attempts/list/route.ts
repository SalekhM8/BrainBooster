import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET /api/quizzes/[id]/attempts/list
// Admin / assigned teacher: list all attempts on a quiz with student + parent contact
// + latest report status, so the teacher can manually resend results.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const quiz = await db.quiz.findUnique({
      where: { id },
      include: { session: { select: { teacherId: true } } },
    });
    if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

    const isAdmin = session.user.role === "ADMIN";
    const isAssignedTeacher = session.user.role === "TEACHER" && quiz.session.teacherId === session.user.id;
    if (!isAdmin && !isAssignedTeacher) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const attempts = await db.quizAttempt.findMany({
      where: { quizId: id },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, parentName: true, parentEmail: true },
        },
        reports: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { completedAt: "desc" },
    });

    return NextResponse.json({ data: attempts });
  } catch (err) {
    console.error("[quiz attempts list] error:", err);
    return NextResponse.json({ error: "Failed to load attempts" }, { status: 500 });
  }
}
