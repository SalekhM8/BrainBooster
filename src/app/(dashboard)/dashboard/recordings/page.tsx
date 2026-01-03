"use client";

import { useState, useCallback, useMemo, memo } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { CardGridSkeleton } from "@/components/ui/skeleton";
import { fetcher, buildUrl } from "@/lib/fetcher";

interface Recording {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  yearGroup: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  duration: number | null;
  viewCount: number;
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

// Memoized recording card
const RecordingCard = memo(function RecordingCard({
  recording,
}: {
  recording: Recording;
}) {
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  return (
    <Card
      variant="bordered"
      className="overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="aspect-video bg-slate-100 relative">
        {recording.thumbnailUrl ? (
          <img
            src={recording.thumbnailUrl}
            alt={recording.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-slate-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        )}
        {recording.duration && (
          <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {formatDuration(recording.duration)}
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Badge
            variant={recording.subject === "MATHS" ? "primary" : "warning"}
            className="text-xs"
          >
            {recording.subject === "MATHS" ? "Maths" : "English"}
          </Badge>
          <span className="text-xs text-slate-400">{recording.viewCount} views</span>
        </div>
        <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2">
          {recording.title}
        </h3>
        <p className="text-sm text-slate-500">
          {recording.teacher?.firstName} {recording.teacher?.lastName}
        </p>
        <a 
          href={recording.videoUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block mt-3"
        >
          <Button size="sm" className="w-full">
            Watch
          </Button>
        </a>
      </div>
    </Card>
  );
});

export default function RecordingsPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "MATHS" | "ENGLISH">("all");
  const [search, setSearch] = useState("");
  const limit = 12;

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    const timeout = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, []);

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

  // Handle filter change
  const handleFilterChange = useCallback((newFilter: "all" | "MATHS" | "ENGLISH") => {
    setFilter(newFilter);
    setPage(1);
  }, []);

  // Client-side search filter (for instant feedback)
  const filteredRecordings = useMemo(() => {
    if (!data?.data || !debouncedSearch) return data?.data || [];
    const q = debouncedSearch.toLowerCase();
    return data.data.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.teacher?.firstName?.toLowerCase().includes(q) ||
        r.teacher?.lastName?.toLowerCase().includes(q)
    );
  }, [data?.data, debouncedSearch]);

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
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Recordings</h1>
        <p className="text-slate-500">
          {data?.pagination.total ?? "..."} recordings available
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search recordings..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="sm:w-64"
        />
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
      </div>

      {isLoading && !data ? (
        <CardGridSkeleton count={6} />
      ) : filteredRecordings.length === 0 ? (
        <Card variant="bordered" className="p-12 text-center">
          <p className="text-slate-500">No recordings found</p>
        </Card>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecordings.map((recording) => (
              <RecordingCard key={recording.id} recording={recording} />
            ))}
          </div>

          {!debouncedSearch && data && (
            <Pagination
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onPageChange={setPage}
              isLoading={isLoading}
            />
          )}
        </>
      )}
    </div>
  );
}
