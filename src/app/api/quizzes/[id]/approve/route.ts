import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// POST /api/quizzes/[id]/approve
// Assigned teacher (or admin) moves DRAFT → APPROVED.
// The quiz will become visible to students once the session ends.
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const quiz = await db.quiz.findUnique({
      where: { id },
      include: { session: { select: { teacherId: true } }, questions: true },
    });
    if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

    const isAdmin = session.user.role === "ADMIN";
    const isAssignedTeacher = session.user.role === "TEACHER" && quiz.session.teacherId === session.user.id;
    if (!isAdmin && !isAssignedTeacher) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (quiz.status !== "DRAFT") {
      return NextResponse.json({ error: `Cannot approve a quiz in status ${quiz.status}` }, { status: 409 });
    }
    if (quiz.questions.length < 1) {
      return NextResponse.json({ error: "Quiz has no questions" }, { status: 400 });
    }

    const updated = await db.quiz.update({
      where: { id },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
        approvedById: session.user.id,
      },
    });
    return NextResponse.json({ quiz: updated });
  } catch (err) {
    console.error("[quizzes/[id]/approve] error:", err);
    return NextResponse.json({ error: "Failed to approve quiz" }, { status: 500 });
  }
}
