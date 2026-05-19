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
  generatedAt: string | null;
  approvedAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  session: {
    id: string;
    title: string;
    subject: string;
    yearGroup: string;
    scheduledAt: string;
    duration: number;
  };
  _count: { questions: number; attempts: number };
}

function statusVariant(status: string): "success" | "warning" | "primary" | "default" {
  if (status === "PUBLISHED") return "success";
  if (status === "APPROVED") return "primary";
  if (status === "DRAFT") return "warning";
  return "default";
}

export default function TeacherQuizzesPage() {
  const { data, isLoading } = useSWR<{ data: QuizRow[] }>("/api/quizzes", fetcher);
  const quizzes = data?.data ?? [];

  const drafts = quizzes.filter((q) => q.status === "DRAFT");
  const approved = quizzes.filter((q) => q.status === "APPROVED");
  const published = quizzes.filter((q) => q.status === "PUBLISHED");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Quizzes</h1>
        <p className="text-slate-500">Review and approve AI-generated quizzes before they go out to students.</p>
      </div>

      {isLoading && <Card variant="bordered" className="p-6 text-sm text-slate-500">Loading…</Card>}
      {!isLoading && quizzes.length === 0 && (
        <Card variant="bordered" className="p-6 text-sm text-slate-500">
          No quizzes yet. When an admin creates a session with &quot;Auto-generate quiz&quot; ticked,
          a draft will appear here for you to review.
        </Card>
      )}

      {drafts.length > 0 && <Section title="Awaiting your review" rows={drafts} />}
      {approved.length > 0 && <Section title="Approved — waiting for session to end" rows={approved} />}
      {published.length > 0 && <Section title="Published" rows={published} />}
    </div>
  );
}

function Section({ title, rows }: { title: string; rows: QuizRow[] }) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
      <div className="space-y-3">
        {rows.map((q) => (
          <Link key={q.id} href={`/teacher/quizzes/${q.id}`}>
            <Card variant="bordered" className="p-4 hover:border-indigo-300 hover:shadow-sm transition cursor-pointer">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900 truncate">{q.title}</h3>
                    <Badge variant={statusVariant(q.status)}>{q.status}</Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    Session: <span className="text-slate-700">{q.session.title}</span> · {q.session.subject} ·{" "}
                    {q.session.yearGroup} · {new Date(q.session.scheduledAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right text-xs text-slate-500 shrink-0">
                  <div>{q._count.questions} questions</div>
                  <div>{q._count.attempts} attempts</div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
