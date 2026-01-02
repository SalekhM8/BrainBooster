"use client";

import { useState, useMemo, memo } from "react";
import useSWR from "swr";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/ui/skeleton";
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

const SessionRow = memo(function SessionRow({ session }: { session: Session }) {
  const date = new Date(session.scheduledAt);
  const isPast = date < new Date();
  const isToday = date.toDateString() === new Date().toDateString();

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-4">
        <div>
          <p className="font-medium text-slate-900">{session.title}</p>
          <p className="text-sm text-slate-500">
            {session.yearGroup} • {session.duration} min
          </p>
        </div>
      </td>
      <td className="px-4 py-4">
        <Badge variant={session.subject === "MATHS" ? "primary" : "warning"}>
          {session.subject === "MATHS" ? "Maths" : "English"}
        </Badge>
      </td>
      <td className="px-4 py-4 text-sm text-slate-600">
        <div>
          <p className={isToday ? "font-medium text-primary-600" : ""}>
            {isToday ? "Today" : date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
          </p>
          <p className="text-slate-500">
            {date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </td>
      <td className="px-4 py-4">
        {session.isCancelled ? (
          <Badge variant="error">Cancelled</Badge>
        ) : session.isLive ? (
          <Badge variant="success">Live Now</Badge>
        ) : isPast ? (
          <Badge variant="default">Completed</Badge>
        ) : (
          <Badge variant="primary">Upcoming</Badge>
        )}
      </td>
      <td className="px-4 py-4 text-right">
        {session.meetingLink && !isPast && !session.isCancelled && (
          <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">
            <Button size="sm">
              {session.isLive ? "Join Now" : "Start Class"}
            </Button>
          </a>
        )}
      </td>
    </tr>
  );
});

export default function TeacherSessionsPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("upcoming");
  const limit = 15;

  const url = useMemo(
    () =>
      buildUrl("/api/sessions", {
        page,
        limit,
        upcoming: filter === "upcoming" ? "true" : undefined,
      }),
    [page, filter]
  );

  const { data, isLoading, mutate } = useSWR<SessionsResponse>(url, fetcher, {
    keepPreviousData: true,
  });

  const handleFilterChange = (newFilter: "all" | "upcoming" | "past") => {
    setFilter(newFilter);
    setPage(1);
  };

  // Filter past sessions client-side if needed
  const filteredData = useMemo(() => {
    if (!data) return null;
    if (filter !== "past") return data;

    const now = new Date();
    const pastSessions = data.data.filter((s) => new Date(s.scheduledAt) < now);
    return {
      ...data,
      data: pastSessions,
      pagination: {
        ...data.pagination,
        total: pastSessions.length,
        totalPages: Math.ceil(pastSessions.length / limit),
      },
    };
  }, [data, filter, limit]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Sessions</h1>
          <p className="text-slate-500">
            {filteredData?.pagination.total ?? "..."} sessions
          </p>
        </div>
        <Button variant="outline" onClick={() => mutate()}>
          Refresh
        </Button>
      </div>

      <div className="flex gap-2">
        {(["upcoming", "all", "past"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "primary" : "outline"}
            size="sm"
            onClick={() => handleFilterChange(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {isLoading && !data ? (
        <TableSkeleton rows={8} />
      ) : !filteredData?.data.length ? (
        <Card variant="bordered" className="p-12 text-center">
          <p className="text-slate-500">No sessions found</p>
          <p className="text-sm text-slate-400 mt-2">
            {filter === "upcoming"
              ? "You don't have any upcoming sessions scheduled"
              : "No sessions match your filter"}
          </p>
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
                      Date/Time
                    </th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">
                      Status
                    </th>
                    <th className="text-right text-xs font-medium text-slate-500 uppercase px-4 py-3">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.data.map((session) => (
                    <SessionRow key={session.id} session={session} />
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {filteredData.pagination.totalPages > 1 && (
            <Pagination
              page={filteredData.pagination.page}
              totalPages={filteredData.pagination.totalPages}
              onPageChange={setPage}
              isLoading={isLoading}
            />
          )}
        </>
      )}
    </div>
  );
}

