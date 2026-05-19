import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendQuizReports } from "@/lib/quiz-reports";

// POST /api/quizzes/attempts/[attemptId]/resend
// Admin or assigned teacher manually re-sends the parent + student emails for an attempt.
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> },
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { attemptId } = await params;
    const attempt = await db.quizAttempt.findUnique({
      where: { id: attemptId },
      include: { quiz: { include: { session: { select: { teacherId: true } } } } },
    });
    if (!attempt) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });

    const isAdmin = session.user.role === "ADMIN";
    const isAssignedTeacher = session.user.role === "TEACHER" && attempt.quiz.session.teacherId === session.user.id;
    if (!isAdmin && !isAssignedTeacher) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await sendQuizReports(attemptId, { force: true });
    return NextResponse.json({ result });
  } catch (err) {
    console.error("[resend report] error:", err);
    return NextResponse.json({ error: "Failed to resend report" }, { status: 500 });
  }
}
