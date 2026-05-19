"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Question {
  id?: string;
  order: number;
  prompt: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: "A" | "B" | "C" | "D";
  explanation: string;
}

interface Quiz {
  id: string;
  title: string;
  status: string;
  topicsTaught: string | null;
  generatedAt: string | null;
  approvedAt: string | null;
  publishedAt: string | null;
  session: {
    id: string;
    title: string;
    subject: string;
    yearGroup: string;
    scheduledAt: string;
    duration: number;
  };
  questions: Question[];
}

interface AttemptRow {
  id: string;
  score: number;
  total: number;
  completedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    parentName: string | null;
    parentEmail: string | null;
  };
  reports: Array<{ id: string; audience: string; channel: string; status: string; sentAt: string | null }>;
}

export default function TeacherQuizEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);
  const [resendingId, setResendingId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/quizzes/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setQuiz(data.quiz);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!quiz || quiz.status === "DRAFT") return;
    fetch(`/api/quizzes/${id}/attempts/list`)
      .then((r) => r.json())
      .then((data) => {
        if (data.data) setAttempts(data.data);
      });
  }, [id, quiz]);

  const resend = async (attemptId: string) => {
    setResendingId(attemptId);
    try {
      const res = await fetch(`/api/quizzes/attempts/${attemptId}/resend`, { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Resend failed");
      // Refresh list
      const fresh = await fetch(`/api/quizzes/${id}/attempts/list`).then((r) => r.json());
      if (fresh.data) setAttempts(fresh.data);
      setInfo(`Report resent (parent: ${body.result.parentStatus}, student: ${body.result.studentStatus}).`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Resend failed");
    } finally {
      setResendingId(null);
    }
  };

  if (loading) return <Card variant="bordered" className="p-6 text-sm text-slate-500">Loading…</Card>;
  if (error || !quiz) return <Card variant="bordered" className="p-6 text-sm text-red-600">{error || "Not found"}</Card>;

  const editable = quiz.status === "DRAFT";

  const updateQuestion = (idx: number, patch: Partial<Question>) => {
    setQuiz((q) => (q ? { ...q, questions: q.questions.map((qq, i) => (i === idx ? { ...qq, ...patch } : qq)) } : q));
  };

  const removeQuestion = (idx: number) => {
    setQuiz((q) => (q ? { ...q, questions: q.questions.filter((_, i) => i !== idx) } : q));
  };

  const addQuestion = () => {
    setQuiz((q) =>
      q
        ? {
            ...q,
            questions: [
              ...q.questions,
              {
                order: q.questions.length + 1,
                prompt: "",
                optionA: "",
                optionB: "",
                optionC: "",
                optionD: "",
                correctOption: "A",
                explanation: "",
              },
            ],
          }
        : q,
    );
  };

  const save = async () => {
    setSaving(true);
    setError("");
    setInfo("");
    try {
      const res = await fetch(`/api/quizzes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: quiz.title, questions: quiz.questions }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Save failed");
      setQuiz((q) => (q ? { ...q, ...body.quiz } : q));
      setInfo("Saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const approve = async () => {
    if (!confirm("Approve this quiz? Once the session ends it will go out to students automatically.")) return;
    setSaving(true);
    setError("");
    try {
      // Save first so any edits are persisted before approval
      await fetch(`/api/quizzes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: quiz.title, questions: quiz.questions }),
      });
      const res = await fetch(`/api/quizzes/${id}/approve`, { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Approve failed");
      router.push("/teacher/quizzes");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Approve failed");
    } finally {
      setSaving(false);
    }
  };

  const regenerate = async () => {
    if (!confirm("Replace this draft with a fresh AI-generated quiz? Your edits will be lost.")) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/quizzes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: quiz.session.id, regenerate: true }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Regenerate failed");
      // Reload
      const fresh = await fetch(`/api/quizzes/${id}`).then((r) => r.json());
      setQuiz(fresh.quiz);
      setInfo("Quiz regenerated.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Regenerate failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 truncate">{quiz.title}</h1>
            <Badge variant={quiz.status === "DRAFT" ? "warning" : quiz.status === "PUBLISHED" ? "success" : "primary"}>
              {quiz.status}
            </Badge>
          </div>
          <p className="text-sm text-slate-500">
            For session: <span className="text-slate-700">{quiz.session.title}</span> · {quiz.session.subject} ·{" "}
            {quiz.session.yearGroup} · {new Date(quiz.session.scheduledAt).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          {editable && (
            <>
              <Button onClick={save} isLoading={saving}>Save</Button>
              <Button variant="outline" onClick={regenerate} disabled={saving}>
                Regenerate with AI
              </Button>
              <Button variant="primary" onClick={approve} disabled={saving}>
                Approve &amp; schedule
              </Button>
            </>
          )}
        </div>
      </div>

      {error && <Card variant="bordered" className="p-3 border-red-200 bg-red-50 text-sm text-red-700">{error}</Card>}
      {info && <Card variant="bordered" className="p-3 border-emerald-200 bg-emerald-50 text-sm text-emerald-700">{info}</Card>}

      {editable && (
        <Card variant="bordered" className="p-4">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Quiz title</label>
          <Input
            value={quiz.title}
            onChange={(e) => setQuiz((q) => (q ? { ...q, title: e.target.value } : q))}
          />
          {quiz.topicsTaught && (
            <p className="mt-3 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Topics:</span> {quiz.topicsTaught}
            </p>
          )}
        </Card>
      )}

      <div className="space-y-4">
        {quiz.questions.map((q, idx) => (
          <Card key={idx} variant="bordered" className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Question {idx + 1}</h3>
              {editable && quiz.questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(idx)}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Prompt</label>
              <textarea
                value={q.prompt}
                onChange={(e) => updateQuestion(idx, { prompt: e.target.value })}
                rows={2}
                disabled={!editable}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-slate-50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(["A", "B", "C", "D"] as const).map((letter) => {
                const key = `option${letter}` as keyof Question;
                return (
                  <div key={letter}>
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-600 mb-1">
                      <input
                        type="radio"
                        checked={q.correctOption === letter}
                        onChange={() => updateQuestion(idx, { correctOption: letter })}
                        disabled={!editable}
                      />
                      Option {letter} {q.correctOption === letter && <span className="text-emerald-600">(correct)</span>}
                    </label>
                    <Input
                      value={q[key] as string}
                      onChange={(e) => updateQuestion(idx, { [key]: e.target.value } as Partial<Question>)}
                      disabled={!editable}
                    />
                  </div>
                );
              })}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Explanation (shown to student after they answer)</label>
              <textarea
                value={q.explanation ?? ""}
                onChange={(e) => updateQuestion(idx, { explanation: e.target.value })}
                rows={2}
                disabled={!editable}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-slate-50"
              />
            </div>
          </Card>
        ))}

        {editable && (
          <Button variant="outline" onClick={addQuestion}>
            + Add question
          </Button>
        )}
      </div>

      {!editable && (
        <div className="space-y-3 pt-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Student attempts ({attempts.length})
          </h2>
          {attempts.length === 0 && (
            <Card variant="bordered" className="p-4 text-sm text-slate-500">
              No attempts yet — students will see this quiz once the session ends.
            </Card>
          )}
          {attempts.map((a) => {
            const pct = Math.round((a.score / a.total) * 100);
            const parentReport = a.reports.find((r) => r.audience === "PARENT");
            return (
              <Card key={a.id} variant="bordered" className="p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">
                      {a.user.firstName} {a.user.lastName}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {new Date(a.completedAt).toLocaleString()} ·
                      {a.user.parentEmail ? (
                        <> parent: {a.user.parentEmail}</>
                      ) : (
                        <span className="text-amber-600"> no parent email on file</span>
                      )}
                    </p>
                    {parentReport && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        Last parent send:{" "}
                        <span
                          className={
                            parentReport.status === "SENT"
                              ? "text-emerald-700"
                              : parentReport.status === "FAILED"
                                ? "text-red-700"
                                : "text-slate-700"
                          }
                        >
                          {parentReport.status}
                          {parentReport.sentAt ? ` · ${new Date(parentReport.sentAt).toLocaleString()}` : ""}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">
                        {a.score} / {a.total}
                      </p>
                      <p className="text-xs text-slate-500">{pct}%</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => resend(a.id)}
                      isLoading={resendingId === a.id}
                    >
                      Resend report
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
