"use client";

import { useState, useEffect, use } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Question {
  id: string;
  order: number;
  prompt: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  // Server-side stripped for unattempted quizzes; included after submit.
  correctOption?: "A" | "B" | "C" | "D";
  explanation?: string;
  studentAnswer?: string | null;
}

interface Quiz {
  id: string;
  title: string;
  status: string;
  session: { title: string; subject: string; yearGroup: string };
  questions: Question[];
  attempt?: { id: string; score: number; total: number; completedAt: string } | null;
}

interface ResultPayload {
  attempt: { id: string; score: number; total: number; completedAt: string };
  questions: Question[];
}

export default function StudentTakeQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ResultPayload | null>(null);

  useEffect(() => {
    fetch(`/api/quizzes/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else {
          setQuiz(data.quiz);
          if (data.quiz?.attempt) {
            // Already attempted — fetch the previous result by including answers from a no-op refetch?
            // Simpler: just show the score banner. Student has already received the email.
          }
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const submit = async () => {
    if (!quiz) return;
    if (quiz.questions.some((q) => !answers[q.id])) {
      setError("Please answer every question before submitting.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/quizzes/${id}/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Submission failed");
      setResult(body);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Card variant="bordered" className="p-6 text-sm text-slate-500">Loading…</Card>;
  if (error && !quiz) return <Card variant="bordered" className="p-6 text-sm text-red-600">{error}</Card>;
  if (!quiz) return null;

  // RESULT view (after submission, or for re-visiting a completed quiz)
  if (result) {
    const pct = Math.round((result.attempt.score / result.attempt.total) * 100);
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Card variant="bordered" className="p-8 text-center bg-indigo-50/40 border-indigo-200">
          <p className="text-sm text-slate-500 mb-1">Your score</p>
          <p className="text-4xl font-extrabold text-indigo-900">
            {result.attempt.score} / {result.attempt.total}
          </p>
          <p className="text-lg font-semibold text-indigo-700 mt-1">{pct}%</p>
          <p className="mt-3 text-xs text-slate-500">
            Your parent has also been emailed a copy of these results.
          </p>
        </Card>

        <div className="space-y-3">
          {result.questions.map((q, i) => {
            const correct = q.studentAnswer === q.correctOption;
            return (
              <Card
                key={q.id}
                variant="bordered"
                className={`p-5 ${correct ? "border-emerald-200 bg-emerald-50/30" : "border-red-200 bg-red-50/30"}`}
              >
                <p className="text-sm font-semibold text-slate-900 mb-3">
                  Q{i + 1}. {q.prompt}
                </p>
                <div className="space-y-1.5 text-sm">
                  {(["A", "B", "C", "D"] as const).map((letter) => {
                    const text = q[`option${letter}` as keyof Question] as string;
                    const isCorrect = q.correctOption === letter;
                    const isStudent = q.studentAnswer === letter;
                    return (
                      <div
                        key={letter}
                        className={`px-3 py-1.5 rounded-md border ${
                          isCorrect
                            ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                            : isStudent
                            ? "border-red-300 bg-red-50 text-red-900"
                            : "border-slate-200 text-slate-700"
                        }`}
                      >
                        <span className="font-semibold mr-2">{letter}.</span>
                        {text}
                        {isCorrect && <span className="ml-2 text-emerald-700">✓ correct</span>}
                        {!isCorrect && isStudent && <span className="ml-2 text-red-700">✗ your answer</span>}
                      </div>
                    );
                  })}
                </div>
                {q.explanation && (
                  <p className="mt-3 text-xs text-slate-600 italic">{q.explanation}</p>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // If already attempted but result not in state, show a brief banner.
  if (quiz.attempt && !result) {
    const pct = Math.round((quiz.attempt.score / quiz.attempt.total) * 100);
    return (
      <Card variant="bordered" className="p-8 text-center bg-indigo-50/40 border-indigo-200 max-w-3xl mx-auto">
        <p className="text-sm text-slate-500">You&apos;ve already taken this quiz</p>
        <p className="mt-2 text-3xl font-extrabold text-indigo-900">
          {quiz.attempt.score} / {quiz.attempt.total}
        </p>
        <p className="text-base font-semibold text-indigo-700">{pct}%</p>
        <p className="mt-3 text-xs text-slate-500">Detailed results were emailed to you and your parent.</p>
      </Card>
    );
  }

  // TAKE view
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{quiz.title}</h1>
        <p className="text-sm text-slate-500 mt-1">
          {quiz.session.subject} · {quiz.session.yearGroup} · {quiz.questions.length} questions · One attempt only
        </p>
      </div>

      {error && <Card variant="bordered" className="p-3 border-red-200 bg-red-50 text-sm text-red-700">{error}</Card>}

      <div className="space-y-4">
        {quiz.questions.map((q, i) => (
          <Card key={q.id} variant="bordered" className="p-5">
            <p className="text-sm font-semibold text-slate-900 mb-3">
              Q{i + 1}. {q.prompt}
            </p>
            <div className="space-y-2">
              {(["A", "B", "C", "D"] as const).map((letter) => {
                const text = q[`option${letter}` as keyof Question] as string;
                const checked = answers[q.id] === letter;
                return (
                  <label
                    key={letter}
                    className={`flex items-start gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition ${
                      checked
                        ? "border-indigo-300 bg-indigo-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={letter}
                      checked={checked}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: letter }))}
                      className="mt-0.5"
                    />
                    <span className="text-sm">
                      <span className="font-semibold mr-1">{letter}.</span>
                      {text}
                    </span>
                  </label>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-slate-500">
          {Object.keys(answers).length} / {quiz.questions.length} answered
        </p>
        <Button onClick={submit} isLoading={submitting}>
          Submit quiz
        </Button>
      </div>
    </div>
  );
}
