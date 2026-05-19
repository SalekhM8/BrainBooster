import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface SendOptions {
  // If true, allow re-sending even if a SENT report already exists for that audience.
  // Used by the teacher "Resend report" button. Default false.
  force?: boolean;
}

// Builds the parent + student emails for a completed quiz attempt and tracks
// each delivery in QuizReport. Safe to call multiple times — without `force`,
// it skips audiences that already have a SENT report.
export async function sendQuizReports(attemptId: string, opts: SendOptions = {}): Promise<{
  parentStatus: "SENT" | "FAILED" | "SKIPPED" | "NO_CONTACT";
  studentStatus: "SENT" | "FAILED" | "SKIPPED";
}> {
  const attempt = await db.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          parentName: true,
          parentEmail: true,
        },
      },
      quiz: {
        include: {
          questions: { orderBy: { order: "asc" } },
          session: { select: { title: true, subject: true, yearGroup: true } },
        },
      },
      reports: true,
    },
  });
  if (!attempt) return { parentStatus: "NO_CONTACT", studentStatus: "SKIPPED" };

  const answers: Record<string, string> = JSON.parse(attempt.answers);
  const pct = Math.round((attempt.score / attempt.total) * 100);

  const optText = (q: typeof attempt.quiz.questions[number], letter: string) => {
    if (letter === "A") return q.optionA;
    if (letter === "B") return q.optionB;
    if (letter === "C") return q.optionC;
    if (letter === "D") return q.optionD;
    return "(no answer)";
  };

  const breakdown = attempt.quiz.questions
    .map((q, i) => {
      const studentAnswer = answers[q.id] ?? "—";
      const correct = studentAnswer === q.correctOption;
      return `
        <div style="margin: 12px 0; padding: 12px; background: ${correct ? "#ECFDF5" : "#FEF2F2"}; border-radius: 8px;">
          <p style="margin: 0 0 6px 0; font-size: 13px; color: #475569;"><strong>Q${i + 1}.</strong> ${escapeHtml(q.prompt)}</p>
          <p style="margin: 4px 0; font-size: 13px;">
            <strong>${escapeHtml(attempt.user.firstName)}&#39;s answer:</strong>
            <span style="color: ${correct ? "#047857" : "#B91C1C"};">${studentAnswer} — ${escapeHtml(optText(q, studentAnswer))}</span>
            ${correct ? "✓" : "✗"}
          </p>
          ${!correct ? `<p style="margin: 4px 0; font-size: 13px; color: #047857;"><strong>Correct:</strong> ${q.correctOption} — ${escapeHtml(optText(q, q.correctOption))}</p>` : ""}
          ${q.explanation ? `<p style="margin: 6px 0 0 0; font-size: 12px; color: #64748b; font-style: italic;">${escapeHtml(q.explanation)}</p>` : ""}
        </div>
      `;
    })
    .join("");

  const summaryHtml = `
    <div style="font-family: -apple-system, Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #0f172a;">
      <h1 style="color: #4F46E5; margin-bottom: 4px;">Quiz results — ${escapeHtml(attempt.user.firstName)} ${escapeHtml(attempt.user.lastName)}</h1>
      <p style="color: #64748b; margin: 0 0 16px 0;">
        ${escapeHtml(attempt.quiz.session.title)} · ${attempt.quiz.session.subject} · ${attempt.quiz.session.yearGroup}
      </p>
      <div style="background: #EEF2FF; padding: 16px 20px; border-radius: 12px; margin: 16px 0;">
        <p style="margin: 0; font-size: 28px; font-weight: 700; color: #312E81;">${attempt.score} / ${attempt.total}</p>
        <p style="margin: 4px 0 0 0; color: #4338CA; font-weight: 600;">${pct}%</p>
      </div>
      <h2 style="font-size: 16px; color: #0f172a; margin: 24px 0 8px 0;">Question-by-question breakdown</h2>
      ${breakdown}
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #64748b; font-size: 12px;">BrainBooster — keeping you in the loop on your child&#39;s progress.</p>
    </div>
  `;

  let parentStatus: "SENT" | "FAILED" | "SKIPPED" | "NO_CONTACT" = "NO_CONTACT";
  let studentStatus: "SENT" | "FAILED" | "SKIPPED" = "SKIPPED";

  // Parent
  if (attempt.user.parentEmail) {
    const alreadySent = attempt.reports.some(
      (r) => r.audience === "PARENT" && r.channel === "EMAIL" && r.status === "SENT",
    );
    if (alreadySent && !opts.force) {
      parentStatus = "SKIPPED";
    } else {
      const greeting = attempt.user.parentName ? `Hi ${attempt.user.parentName.split(" ")[0]},` : "Hi,";
      const parentHtml = `
        <div style="font-family: -apple-system, Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #0f172a;">
          <p>${greeting}</p>
          <p>${escapeHtml(attempt.user.firstName)} just completed a post-lesson quiz. Here&#39;s how they got on:</p>
        </div>
        ${summaryHtml}
      `;
      const record = await db.quizReport.create({
        data: {
          quizAttemptId: attempt.id,
          channel: "EMAIL",
          recipient: attempt.user.parentEmail,
          audience: "PARENT",
        },
      });
      const ok = await sendEmail({
        to: attempt.user.parentEmail,
        subject: `${attempt.user.firstName}'s quiz results — ${pct}% on ${attempt.quiz.session.subject}`,
        html: parentHtml,
      });
      await db.quizReport.update({
        where: { id: record.id },
        data: { status: ok ? "SENT" : "FAILED", sentAt: ok ? new Date() : null },
      });
      parentStatus = ok ? "SENT" : "FAILED";
    }
  }

  // Student
  const studentSent = attempt.reports.some(
    (r) => r.audience === "STUDENT" && r.channel === "EMAIL" && r.status === "SENT",
  );
  if (studentSent && !opts.force) {
    studentStatus = "SKIPPED";
  } else {
    const record = await db.quizReport.create({
      data: {
        quizAttemptId: attempt.id,
        channel: "EMAIL",
        recipient: attempt.user.email,
        audience: "STUDENT",
      },
    });
    const ok = await sendEmail({
      to: attempt.user.email,
      subject: `Your quiz results — ${pct}%`,
      html: summaryHtml,
    });
    await db.quizReport.update({
      where: { id: record.id },
      data: { status: ok ? "SENT" : "FAILED", sentAt: ok ? new Date() : null },
    });
    studentStatus = ok ? "SENT" : "FAILED";
  }

  return { parentStatus, studentStatus };
}
