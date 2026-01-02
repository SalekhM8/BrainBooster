"use client";

import { useState, useCallback, useMemo, memo } from "react";
import useSWR from "swr";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { fetcher, buildUrl } from "@/lib/fetcher";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  yearGroup: string | null;
  createdAt: string;
  subscription?: {
    tier: string;
    status: string;
    homeworkSiteAccess: boolean;
    homeworkUsername: string | null;
    homeworkPassword: string | null;
  } | null;
}

interface UsersResponse {
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Memoized user row for optimal re-renders
const UserRow = memo(function UserRow({
  user,
  onToggleActive,
}: {
  user: User;
  onToggleActive: (id: string, isActive: boolean) => void;
}) {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3">
        <div>
          <p className="font-medium text-slate-900">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge
          variant={
            user.role === "ADMIN"
              ? "error"
              : user.role === "TEACHER"
              ? "warning"
              : "primary"
          }
        >
          {user.role}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <Badge variant={user.isActive ? "success" : "default"}>
          {user.isActive ? "Active" : "Inactive"}
        </Badge>
      </td>
      <td className="px-4 py-3">
        {user.subscription ? (
          <span className="text-sm text-slate-600">
            {user.subscription.tier} - {user.subscription.status}
          </span>
        ) : (
          <span className="text-sm text-slate-400">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        {user.role === "STUDENT" && user.subscription?.tier === "PREMIUM" ? (
          user.subscription.homeworkUsername && user.subscription.homeworkPassword ? (
            <Badge variant="success">Set</Badge>
          ) : (
            <Badge variant="warning">Not Set</Badge>
          )
        ) : user.role === "STUDENT" ? (
          <span className="text-sm text-slate-400">Basic</span>
        ) : (
          <span className="text-sm text-slate-400">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <Link href={`/admin/users/${user.id}`}>
            <Button variant="ghost" size="sm">
              Edit
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleActive(user.id, user.isActive)}
          >
            {user.isActive ? "Deactivate" : "Activate"}
          </Button>
        </div>
      </td>
    </tr>
  );
});

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "STUDENT" | "TEACHER" | "ADMIN">("all");
  const limit = 15;

  // Debounce search input
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    // Debounce the actual search
    const timeout = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, []);

  // Build URL with filters
  const url = useMemo(
    () =>
      buildUrl("/api/users", {
        page,
        limit,
        role: roleFilter !== "all" ? roleFilter : undefined,
        search: debouncedSearch || undefined,
      }),
    [page, roleFilter, debouncedSearch]
  );

  // SWR for data fetching with auto-revalidation on focus
  const { data, error, isLoading, mutate } = useSWR<UsersResponse>(url, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: true,
    revalidateOnMount: true,
  });

  // Optimistic toggle with rollback
  const handleToggleActive = useCallback(
    async (userId: string, isActive: boolean) => {
      const previousData = data;

      // Optimistic update
      mutate(
        (current) =>
          current
            ? {
                ...current,
                data: current.data.map((u) =>
                  u.id === userId ? { ...u, isActive: !isActive } : u
                ),
              }
            : current,
        false
      );

      try {
        const res = await fetch(`/api/users/${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !isActive }),
        });
        if (!res.ok) throw new Error("Failed to update");
        mutate();
      } catch {
        // Rollback on error
        mutate(previousData);
        alert("Failed to update user");
      }
    },
    [data, mutate]
  );

  // Handle filter change
  const handleRoleChange = useCallback((role: "all" | "STUDENT" | "TEACHER" | "ADMIN") => {
    setRoleFilter(role);
    setPage(1);
  }, []);

  if (error) {
    return (
      <Card variant="bordered" className="p-12 text-center">
        <p className="text-red-600">Failed to load users</p>
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
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="text-slate-500">{data?.pagination.total ?? "..."} total users</p>
        </div>
        <Link href="/admin/users/new">
          <Button>
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
            Add User
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="sm:w-64"
        />
        <div className="flex gap-2 flex-wrap">
          {(["all", "STUDENT", "TEACHER", "ADMIN"] as const).map((role) => (
            <Button
              key={role}
              variant={roleFilter === role ? "primary" : "outline"}
              size="sm"
              onClick={() => handleRoleChange(role)}
            >
              {role === "all" ? "All" : role.charAt(0) + role.slice(1).toLowerCase()}s
            </Button>
          ))}
        </div>
      </div>

      {isLoading && !data ? (
        <TableSkeleton rows={10} />
      ) : !data?.data.length ? (
        <Card variant="bordered" className="p-12 text-center">
          <p className="text-slate-500">No users found</p>
        </Card>
      ) : (
        <>
          <Card variant="bordered" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">
                      User
                    </th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">
                      Role
                    </th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">
                      Status
                    </th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">
                      Subscription
                    </th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">
                      HW Login
                    </th>
                    <th className="text-right text-xs font-medium text-slate-500 uppercase px-4 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.data.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      onToggleActive={handleToggleActive}
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
