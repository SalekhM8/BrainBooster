"use client";

import { useState, useCallback, useMemo, memo } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/ui/skeleton";
import { fetcher, buildUrl } from "@/lib/fetcher";
import { Plus } from "lucide-react";

interface Recording {
  id: string;
  title: string;
  subject: string;
  yearGroup: string;
  videoUrl: string;
  duration: number | null;
  viewCount: number;
  isPublished: boolean;
  createdAt: string;
  teacher: {
    firstName: string;
    lastName: string;
  };
}

interface RecordingsResponse {
  data: Recording[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const formatDuration = (seconds: number | null) => {
  if (!seconds) return "—";
  const mins = Math.floor(seconds / 60);
  return `${mins} min`;
};

// Memoized recording row
const RecordingRow = memo(function RecordingRow({
  recording,
  onTogglePublished,
  onDelete,
}: {
  recording: Recording;
  onTogglePublished: (id: string, isPublished: boolean) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3">
        <div>
          <p className="font-medium text-slate-900">{recording.title}</p>
          <p className="text-sm text-slate-500">
            {recording.yearGroup} • {formatDuration(recording.duration)}
          </p>
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge variant={recording.subject === "MATHS" ? "primary" : "warning"}>
          {recording.subject === "MATHS" ? "Maths" : "English"}
        </Badge>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">
        {recording.teacher?.firstName} {recording.teacher?.lastName}
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">{recording.viewCount}</td>
      <td className="px-4 py-3">
        <Badge variant={recording.isPublished ? "success" : "warning"}>
          {recording.isPublished ? "Published" : "Draft"}
        </Badge>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <a href={recording.videoUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm">
              View
            </Button>
          </a>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTogglePublished(recording.id, recording.isPublished)}
          >
            {recording.isPublished ? "Unpublish" : "Publish"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(recording.id)}>
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );
});

export default function AdminRecordingsPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "MATHS" | "ENGLISH">("all");
  const limit = 15;

  // Build URL
  const url = useMemo(
    () =>
      buildUrl("/api/recordings", {
        page,
        limit,
        subject: filter !== "all" ? filter : undefined,
      }),
    [page, filter]
  );

  // SWR fetch
  const { data, error, isLoading, mutate } = useSWR<RecordingsResponse>(url, fetcher, {
    keepPreviousData: true,
  });

  // Optimistic toggle
  const handleTogglePublished = useCallback(
    async (id: string, isPublished: boolean) => {
      const previousData = data;

      mutate(
        (current) =>
          current
            ? {
                ...current,
                data: current.data.map((r) =>
                  r.id === id ? { ...r, isPublished: !isPublished } : r
                ),
              }
            : current,
        false
      );

      try {
        const res = await fetch(`/api/recordings/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPublished: !isPublished }),
        });
        if (!res.ok) throw new Error("Failed");
        mutate();
      } catch {
        mutate(previousData);
        alert("Failed to update recording");
      }
    },
    [data, mutate]
  );

  // Optimistic delete
  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Are you sure you want to delete this recording?")) return;

      const previousData = data;

      mutate(
        (current) =>
          current
            ? {
                ...current,
                data: current.data.filter((r) => r.id !== id),
                pagination: {
                  ...current.pagination,
                  total: current.pagination.total - 1,
                },
              }
            : current,
        false
      );

      try {
        const res = await fetch(`/api/recordings/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed");
        mutate();
      } catch {
        mutate(previousData);
        alert("Failed to delete recording");
      }
    },
    [data, mutate]
  );

  // Handle filter change
  const handleFilterChange = useCallback((newFilter: "all" | "MATHS" | "ENGLISH") => {
    setFilter(newFilter);
    setPage(1);
  }, []);

  if (error) {
    return (
      <Card variant="bordered" className="p-12 text-center">
        <p className="text-red-600">Failed to load recordings</p>
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
          <h1 className="text-2xl font-bold text-slate-900">Recordings</h1>
          <p className="text-slate-500">
            {data?.pagination.total ?? "..."} total recordings
          </p>
        </div>
        <Link href="/admin/recordings/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Recording
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "MATHS", "ENGLISH"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "primary" : "outline"}
            size="sm"
            onClick={() => handleFilterChange(f)}
          >
            {f === "all" ? "All" : f === "MATHS" ? "Maths" : "English"}
          </Button>
        ))}
      </div>

      {isLoading && !data ? (
        <TableSkeleton rows={10} />
      ) : !data?.data.length ? (
        <Card variant="bordered" className="p-12 text-center">
          <p className="text-slate-500">No recordings found</p>
        </Card>
      ) : (
        <>
          <Card variant="bordered" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">
                      Recording
                    </th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">
                      Subject
                    </th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">
                      Uploaded By
                    </th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">
                      Views
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
                  {data.data.map((recording) => (
                    <RecordingRow
                      key={recording.id}
                      recording={recording}
                      onTogglePublished={handleTogglePublished}
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
