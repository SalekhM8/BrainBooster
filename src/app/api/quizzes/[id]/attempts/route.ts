import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendQuizReports } from "@/lib/quiz-reports";

// POST /api/quizzes/[id]/attempts
// Student submits answers. Auto-marks. Triggers parent + student email reports.
// One attempt only — second submission returns 409.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Students only" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const answers = body.answers as Record<string, string> | undefined;
    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "answers map is required" }, { status: 400 });
    }

    const quiz = await db.quiz.findUnique({
      where: { id },
      include: {
        questions: { orderBy: { order: "asc" } },
        session: { select: { id: true, title: true, subject: true, yearGroup: true, scheduledAt: true, duration: true } },
      },
    });
    if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

    // Visibility: APPROVED+session ended, or PUBLISHED
    const now = new Date();
    const sessionEnd = new Date(quiz.session.scheduledAt.getTime() + quiz.session.duration * 60_000);
    const isVisible = quiz.status === "PUBLISHED" || (quiz.status === "APPROVED" && sessionEnd <= now);
    if (!isVisible) {
      return NextResponse.json({ error: "Quiz not available yet" }, { status: 403 });
    }

    // Reject second attempt
    const existing = await db.quizAttempt.findUnique({
      where: { quizId_userId: { quizId: id, userId: session.user.id } },
    });
    if (existing) {
      return NextResponse.json({ error: "You have already taken this quiz." }, { status: 409 });
    }

    // Auto-mark
    let score = 0;
    const total = quiz.questions.length;
    for (const q of quiz.questions) {
      if (answers[q.id] === q.correctOption) score++;
    }

    const attempt = await db.quizAttempt.create({
      data: {
        quizId: id,
        userId: session.user.id,
        answers: JSON.stringify(answers),
        score,
        total,
      },
    });

    // If status was APPROVED, flip it to PUBLISHED on first successful attempt
    if (quiz.status === "APPROVED") {
      await db.quiz.update({
        where: { id },
        data: { status: "PUBLISHED", publishedAt: new Date() },
      });
    }

    // Fire reports (do not block the response on email)
    queueMicrotask(() => {
      sendQuizReports(attempt.id).catch((e) => console.error("[quiz report] error:", e));
    });

    // Return the marked result so the student can see feedback
    return NextResponse.json({
      attempt: {
        id: attempt.id,
        score,
        total,
        completedAt: attempt.completedAt,
      },
      questions: quiz.questions.map((q) => ({
        id: q.id,
        prompt: q.prompt,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctOption: q.correctOption,
        explanation: q.explanation,
        studentAnswer: answers[q.id] ?? null,
      })),
    });
  } catch (err) {
    console.error("[quiz attempts] POST error:", err);
    return NextResponse.json({ error: "Failed to submit attempt" }, { status: 500 });
  }
}
