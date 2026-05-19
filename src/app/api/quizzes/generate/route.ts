import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { generateQuiz, isAnthropicConfigured } from "@/lib/anthropic";

// POST /api/quizzes/generate
// body: { sessionId: string, regenerate?: boolean }
// Admin or assigned teacher only. Creates (or replaces) a DRAFT quiz for the session.
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAnthropicConfigured()) {
      return NextResponse.json(
        { error: "AI quiz generation is not configured. Set ANTHROPIC_API_KEY." },
        { status: 503 },
      );
    }

    const body = await request.json();
    const { sessionId, regenerate } = body as { sessionId?: string; regenerate?: boolean };

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const sessionRow = await db.session.findUnique({
      where: { id: sessionId },
      include: { quiz: { include: { questions: true } } },
    });

    if (!sessionRow) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Permission: admin OR the assigned teacher
    const isAdmin = session.user.role === "ADMIN";
    const isAssignedTeacher = session.user.role === "TEACHER" && sessionRow.teacherId === session.user.id;
    if (!isAdmin && !isAssignedTeacher) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!sessionRow.topicsTaught || !sessionRow.topicsTaught.trim()) {
      return NextResponse.json(
        { error: 'Add "topics taught" to the session before generating a quiz.' },
        { status: 400 },
      );
    }

    if (sessionRow.quiz && !regenerate) {
      return NextResponse.json(
        { error: "Quiz already exists. Pass regenerate=true to replace it." },
        { status: 409 },
      );
    }

    // Don't allow regenerate after publish
    if (sessionRow.quiz && sessionRow.quiz.status === "PUBLISHED") {
      return NextResponse.json(
        { error: "Quiz is already published — cannot regenerate." },
        { status: 409 },
      );
    }

    const generated = await generateQuiz({
      subject: sessionRow.subject,
      yearGroup: sessionRow.yearGroup,
      topicsTaught: sessionRow.topicsTaught,
      sessionTitle: sessionRow.title,
    });

    // Wipe + recreate in a transaction
    const quiz = await db.$transaction(async (tx) => {
      if (sessionRow.quiz) {
        await tx.quizQuestion.deleteMany({ where: { quizId: sessionRow.quiz.id } });
        return tx.quiz.update({
          where: { id: sessionRow.quiz.id },
          data: {
            title: generated.title,
            topicsTaught: sessionRow.topicsTaught,
            status: "DRAFT",
            generatedAt: new Date(),
            approvedAt: null,
            approvedById: null,
            publishedAt: null,
            questions: {
              create: generated.questions.map((q, i) => ({
                order: i + 1,
                prompt: q.prompt,
                optionA: q.optionA,
                optionB: q.optionB,
                optionC: q.optionC,
                optionD: q.optionD,
                correctOption: q.correctOption,
                explanation: q.explanation,
              })),
            },
          },
          include: { questions: { orderBy: { order: "asc" } } },
        });
      }

      return tx.quiz.create({
        data: {
          sessionId: sessionRow.id,
          title: generated.title,
          topicsTaught: sessionRow.topicsTaught,
          status: "DRAFT",
          generatedAt: new Date(),
          questions: {
            create: generated.questions.map((q, i) => ({
              order: i + 1,
              prompt: q.prompt,
              optionA: q.optionA,
              optionB: q.optionB,
              optionC: q.optionC,
              optionD: q.optionD,
              correctOption: q.correctOption,
              explanation: q.explanation,
            })),
          },
        },
        include: { questions: { orderBy: { order: "asc" } } },
      });
    });

    return NextResponse.json({ quiz }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[quizzes/generate] error:", err);
    if (message === "ANTHROPIC_NOT_CONFIGURED") {
      return NextResponse.json({ error: "AI quiz generation not configured." }, { status: 503 });
    }
    return NextResponse.json({ error: "Failed to generate quiz", detail: message }, { status: 500 });
  }
}
