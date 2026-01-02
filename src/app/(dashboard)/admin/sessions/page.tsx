"use client";

import { useState, useCallback, useMemo, memo } from "react";
import useSWR from "swr";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { fetcher, buildUrl } from "@/lib/fetcher";

interface Session {
  id: string;
  title: string;
  subject: string;
  yearGroup: string;
  scheduledAt: string;
  duration: number;
  meetingLink: string | null;
  isLive: boolean;
  isCancelled: boolean;
  teacher: {
    firstName: string;
    lastName: string;
  };
}

interface SessionsResponse {
  data: Session[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Memoized row component for optimal re-renders
const SessionRow = memo(function SessionRow({
  session,
  onDelete,
}: {
  session: Session;
  onDelete: (id: string) => void;
}) {
  const date = new Date(session.scheduledAt);
  const isPast = date < new Date();

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3">
        <div>
          <p className="font-medium text-slate-900">{session.title}</p>
          <p className="text-sm text-slate-500">
            {session.yearGroup} • {session.duration} min
          </p>
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge variant={session.subject === "MATHS" ? "primary" : "warning"}>
          {session.subject === "MATHS" ? "Maths" : "English"}
        </Badge>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">
        {session.teacher.firstName} {session.teacher.lastName}
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">
        {date.toLocaleDateString("en-GB")} at{" "}
        {date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
      </td>
      <td className="px-4 py-3">
        {session.isCancelled ? (
          <Badge variant="error">Cancelled</Badge>
        ) : session.isLive ? (
          <Badge variant="success">Live</Badge>
        ) : isPast ? (
          <Badge variant="default">Completed</Badge>
        ) : (
          <Badge variant="primary">Scheduled</Badge>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <Link href={`/admin/sessions/${session.id}`}>
            <Button variant="ghost" size="sm">
              Edit
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => onDelete(session.id)}>
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );
});

export default function AdminSessionsPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "MATHS" | "ENGLISH">("all");
  const limit = 15;

  // Build URL with filters
  const url = useMemo(
    () =>
      buildUrl("/api/sessions", {
        page,
        limit,
        subject: filter !== "all" ? filter : undefined,
      }),
    [page, filter]
  );

  // SWR for data fetching with caching
  const { data, error, isLoading, mutate } = useSWR<SessionsResponse>(url, fetcher, {
    keepPreviousData: true,
  });

  // Optimistic delete with rollback
  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Are you sure you want to delete this session?")) return;

      // Optimistic update
      const previousData = data;
      mutate(
        (current) =>
          current
            ? {
                ...current,
                data: current.data.filter((s) => s.id !== id),
                pagination: {
                  ...current.pagination,
                  total: current.pagination.total - 1,
                },
              }
            : current,
        false
      );

      try {
        const res = await fetch(`/api/sessions/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete");
        mutate(); // Revalidate
      } catch {
        // Rollback on error
        mutate(previousData);
        alert("Failed to delete session");
      }
    },
    [data, mutate]
  );

  // Handle filter change - reset to page 1
  const handleFilterChange = useCallback((newFilter: "all" | "MATHS" | "ENGLISH") => {
    setFilter(newFilter);
    setPage(1);
  }, []);

  if (error) {
    return (
      <Card variant="bordered" className="p-12 text-center">
        <p className="text-red-600">Failed to load sessions</p>
        <Button onClick={() => mutate()} className="mt-4">
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sessions</h1>
          <p className="text-slate-500">
            {data?.pagination.total ?? "..."} total sessions
          </p>
        </div>
        <Link href="/admin/sessions/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Session
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "MATHS", "ENGLISH"] as const).map((f) => (
          <button
            key={f}
            onClick={() => handleFilterChange(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f 
                ? "bg-indigo-600 text-white" 
                : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
            }`}
          >
            {f === "all" ? "All" : f === "MATHS" ? "Maths" : "English"}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {isLoading && !data ? (
        <TableSkeleton rows={10} />
      ) : !data?.data.length ? (
        <Card variant="bordered" className="p-12 text-center">
          <p className="text-slate-500">No sessions found</p>
        </Card>
      ) : (
        <>
          <Card variant="bordered" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">
                      Session
                    </th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">
                      Subject
                    </th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">
                      Teacher
                    </th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">
                      Date/Time
                    </th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">
                      Status
                    </th>
                    <th className="text-right text-xs font-medium text-slate-500 uppercase px-4 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.data.map((session) => (
                    <SessionRow
                      key={session.id}
                      session={session}
                      onDelete={handleDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Pagination
            page={data.pagination.page}
            totalPages={data.pagination.totalPages}
            onPageChange={setPage}
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  );
}
