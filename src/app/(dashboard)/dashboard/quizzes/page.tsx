"use client";

import useSWR from "swr";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetcher } from "@/lib/fetcher";

interface QuizRow {
  id: string;
  title: string;
  status: string;
  session: {
    id: string;
    title: string;
    subject: string;
    yearGroup: string;
    scheduledAt: string;
    duration: number;
  };
  attempts: Array<{ id: string; score: number; total: number; completedAt: string }>;
  _count: { questions: number };
}

export default function StudentQuizzesPage() {
  const { data, isLoading } = useSWR<{ data: QuizRow[] }>("/api/quizzes", fetcher);
  const quizzes = data?.data ?? [];

  const pending = quizzes.filter((q) => q.attempts.length === 0);
  const completed = quizzes.filter((q) => q.attempts.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Quizzes</h1>
        <p className="text-slate-500">Short MCQ checks released after each of your live sessions.</p>
      </div>

      {isLoading && <Card variant="bordered" className="p-6 text-sm text-slate-500">Loading…</Card>}
      {!isLoading && quizzes.length === 0 && (
        <Card variant="bordered" className="p-6 text-sm text-slate-500">
          No quizzes yet. After your next live session, a quiz will appear here for you to take.
        </Card>
      )}

      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Ready to take</h2>
          {pending.map((q) => (
            <Link key={q.id} href={`/dashboard/quizzes/${q.id}`}>
              <Card variant="bordered" className="p-4 hover:border-indigo-300 hover:shadow-sm transition cursor-pointer">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{q.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {q.session.subject} · {q.session.yearGroup} · {q._count.questions} questions
                    </p>
                  </div>
                  <Badge variant="primary">Start</Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {completed.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Completed</h2>
          {completed.map((q) => {
            const a = q.attempts[0];
            const pct = Math.round((a.score / a.total) * 100);
            return (
              <Link key={q.id} href={`/dashboard/quizzes/${q.id}`}>
                <Card variant="bordered" className="p-4 hover:border-indigo-300 transition cursor-pointer">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">{q.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {q.session.subject} · Taken {new Date(a.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-slate-900">
                        {a.score}/{a.total}
                      </p>
                      <p className="text-xs text-slate-500">{pct}%</p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
