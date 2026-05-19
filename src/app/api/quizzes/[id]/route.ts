import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET /api/quizzes/[id]
// Admin / assigned teacher: full quiz including correct answers.
// Student: only when visible (APPROVED+session ended, or PUBLISHED); answers stripped.
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
      include: {
        session: { select: { id: true, title: true, subject: true, yearGroup: true, scheduledAt: true, duration: true, teacherId: true } },
        questions: { orderBy: { order: "asc" } },
        attempts: { where: { userId: session.user.id } },
      },
    });
    if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

    const isAdmin = session.user.role === "ADMIN";
    const isAssignedTeacher = session.user.role === "TEACHER" && quiz.session.teacherId === session.user.id;

    if (isAdmin || isAssignedTeacher) {
      return NextResponse.json({ quiz });
    }

    // STUDENT path — enforce visibility + strip answers
    if (session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date();
    const sessionEnd = new Date(quiz.session.scheduledAt.getTime() + quiz.session.duration * 60_000);
    const isVisible =
      quiz.status === "PUBLISHED" || (quiz.status === "APPROVED" && sessionEnd <= now);
    if (!isVisible) {
      return NextResponse.json({ error: "Quiz not available yet" }, { status: 403 });
    }

    // Check year/subject eligibility
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { subjects: true, yearGroup: true },
    });
    const studentSubjects: string[] = user?.subjects ? JSON.parse(user.subjects) : [];
    const yearMatch = !user?.yearGroup || user.yearGroup === quiz.session.yearGroup;
    const subjectMatch = studentSubjects.length === 0 || studentSubjects.includes(quiz.session.subject);
    if (!yearMatch || !subjectMatch) {
      return NextResponse.json({ error: "Not eligible for this quiz" }, { status: 403 });
    }

    const alreadyAttempted = quiz.attempts[0] ?? null;

    return NextResponse.json({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        status: quiz.status,
        session: quiz.session,
        questions: quiz.questions.map((q) => ({
          id: q.id,
          order: q.order,
          prompt: q.prompt,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
        })),
        attempt: alreadyAttempted,
      },
    });
  } catch (err) {
    console.error("[quizzes/[id]] GET error:", err);
    return NextResponse.json({ error: "Failed to load quiz" }, { status: 500 });
  }
}

// PUT /api/quizzes/[id]
// Edit quiz (title, questions). Admin or assigned teacher. Only allowed when status=DRAFT.
export async function PUT(
  request: NextRequest,
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
    if (quiz.status !== "DRAFT") {
      return NextResponse.json({ error: "Only DRAFT quizzes are editable" }, { status: 409 });
    }

    const body = await request.json();
    const { title, questions } = body as {
      title?: string;
      questions?: Array<{
        prompt: string;
        optionA: string;
        optionB: string;
        optionC: string;
        optionD: string;
        correctOption: "A" | "B" | "C" | "D";
        explanation?: string;
      }>;
    };

    const updated = await db.$transaction(async (tx) => {
      const updateData: { title?: string } = {};
      if (title) updateData.title = title;

      if (questions && Array.isArray(questions)) {
        if (questions.length < 1) {
          throw new Error("Quiz needs at least one question");
        }
        await tx.quizQuestion.deleteMany({ where: { quizId: id } });
        await tx.quizQuestion.createMany({
          data: questions.map((q, i) => ({
            quizId: id,
            order: i + 1,
            prompt: q.prompt,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correctOption: q.correctOption,
            explanation: q.explanation ?? null,
          })),
        });
      }

      return tx.quiz.update({
        where: { id },
        data: updateData,
        include: { questions: { orderBy: { order: "asc" } } },
      });
    });

    return NextResponse.json({ quiz: updated });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to update quiz";
    console.error("[quizzes/[id]] PUT error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/quizzes/[id] — admin or assigned teacher, DRAFT only
export async function DELETE(
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
    if (quiz.status !== "DRAFT") {
      return NextResponse.json({ error: "Only DRAFT quizzes can be deleted" }, { status: 409 });
    }

    await db.quiz.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[quizzes/[id]] DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete quiz" }, { status: 500 });
  }
}
