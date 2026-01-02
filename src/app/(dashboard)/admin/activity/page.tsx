"use client";

import { useState, memo } from "react";
import useSWR from "swr";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/ui/skeleton";
import { fetcher, buildUrl } from "@/lib/fetcher";

interface ActivityLog {
  id: string;
  type: string;
  description: string;
  userId: string | null;
  userName: string | null;
  userRole: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

interface ActivityResponse {
  data: ActivityLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const activityTypeColors: Record<string, string> = {
  LOGIN: "primary",
  LOGOUT: "default",
  USER_CREATED: "success",
  USER_UPDATED: "warning",
  SESSION_CREATED: "primary",
  SESSION_DELETED: "error",
  RECORDING_UPLOADED: "success",
  SUBSCRIPTION_CHANGED: "warning",
};

const ActivityRow = memo(function ActivityRow({ activity }: { activity: ActivityLog }) {
  const date = new Date(activity.createdAt);
  const timeAgo = getTimeAgo(date);

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3">
        <Badge variant={activityTypeColors[activity.type] as "primary" | "success" | "warning" | "error" | "default" || "default"}>
          {activity.type.replace(/_/g, " ")}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <p className="text-sm text-slate-900">{activity.description}</p>
      </td>
      <td className="px-4 py-3">
        {activity.userName ? (
          <div>
            <p className="text-sm text-slate-900">{activity.userName}</p>
            <p className="text-xs text-slate-500">{activity.userRole}</p>
          </div>
        ) : (
          <span className="text-sm text-slate-400">System</span>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-slate-500">{timeAgo}</td>
    </tr>
  );
});

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString("en-GB");
}

export default function AdminActivityPage() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const limit = 20;

  const url = buildUrl("/api/activity", {
    page,
    limit,
    type: typeFilter !== "all" ? typeFilter : undefined,
  });

  const { data, isLoading, mutate } = useSWR<ActivityResponse>(url, fetcher, {
    keepPreviousData: true,
  });

  const handleFilterChange = (type: string) => {
    setTypeFilter(type);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Activity Log</h1>
          <p className="text-slate-500">Monitor system activity and user actions</p>
        </div>
        <Button variant="outline" onClick={() => mutate()}>
          Refresh
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["all", "LOGIN", "USER_CREATED", "SESSION_CREATED", "RECORDING_UPLOADED"].map((type) => (
          <Button
            key={type}
            variant={typeFilter === type ? "primary" : "outline"}
            size="sm"
            onClick={() => handleFilterChange(type)}
          >
            {type === "all" ? "All" : type.replace(/_/g, " ")}
          </Button>
        ))}
      </div>

      {isLoading && !data ? (
        <TableSkeleton rows={10} />
      ) : !data?.data.length ? (
        <Card variant="bordered" className="p-12 text-center">
          <p className="text-slate-500">No activity logged yet</p>
          <p className="text-sm text-slate-400 mt-2">Activity will appear here as users interact with the platform</p>
        </Card>
      ) : (
        <>
          <Card variant="bordered" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Type</th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Description</th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">User</th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.data.map((activity) => (
                    <ActivityRow key={activity.id} activity={activity} />
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

