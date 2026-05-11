"use client";

import { useState, useMemo, useCallback } from "react";
import useSWR from "swr";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/ui/skeleton";
import { fetcher, buildUrl } from "@/lib/fetcher";

interface TrialBooking {
  id: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string | null;
  childFirstName: string;
  childYearGroup: string;
  subject: string;
  preferredTime: string | null;
  notes: string | null;
  status: string;
  source: string;
  assignedSessionId: string | null;
  createdAt: string;
}

interface TrialsResponse {
  data: TrialBooking[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

const STATUSES = ["PENDING", "CONFIRMED", "ATTENDED", "CONVERTED", "DECLINED", "NO_SHOW"];

function statusBadge(status: string) {
  switch (status) {
    case "PENDING":
      return <Badge variant="warning">Pending</Badge>;
    case "CONFIRMED":
      return <Badge variant="primary">Confirmed</Badge>;
    case "ATTENDED":
      return <Badge variant="success">Attended</Badge>;
    case "CONVERTED":
      return <Badge variant="success">Converted</Badge>;
    case "DECLINED":
      return <Badge variant="error">Declined</Badge>;
    case "NO_SHOW":
      return <Badge variant="default">No-show</Badge>;
    default:
      return <Badge variant="default">{status}</Badge>;
  }
}

export default function AdminTrialsPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<TrialBooking | null>(null);
  const limit = 15;

  const url = useMemo(
    () =>
      buildUrl("/api/trial", {
        page,
        limit,
        status: filter !== "all" ? filter : undefined,
      }),
    [page, filter]
  );

  const { data, error, isLoading, mutate } = useSWR<TrialsResponse>(url, fetcher, {
    keepPreviousData: true,
  });

  const updateStatus = useCallback(
    async (id: string, status: string) => {
      const res = await fetch(`/api/trial/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        mutate();
        if (selected?.id === id) setSelected({ ...selected, status });
      }
    },
    [mutate, selected]
  );

  const remove = useCallback(
    async (id: string) => {
      if (!confirm("Delete this trial booking?")) return;
      const res = await fetch(`/api/trial/${id}`, { method: "DELETE" });
      if (res.ok) {
        mutate();
        if (selected?.id === id) setSelected(null);
      }
    },
    [mutate, selected]
  );

  if (error) {
    return (
      <Card variant="bordered" className="p-12 text-center">
        <p className="text-red-600">Failed to load trial bookings</p>
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
          <h1 className="text-2xl font-bold text-slate-900">Trial bookings</h1>
          <p className="text-slate-500">
            {data?.pagination.total ?? "..."} total enquiries from the landing page
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {["all", ...STATUSES].map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f);
              setPage(1);
            }}
            className={`rounded-lg border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              filter === f
                ? "border-indigo-600 bg-indigo-600 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {f === "all" ? "All" : f.replace("_", " ")}
          </button>
        ))}
      </div>

      {isLoading && !data ? (
        <TableSkeleton rows={10} />
      ) : !data?.data.length ? (
        <Card variant="bordered" className="p-12 text-center">
          <p className="text-slate-500">No trial bookings yet</p>
          <p className="mt-1 text-sm text-slate-400">
            When parents fill out the landing-page trial form, their requests appear here.
          </p>
        </Card>
      ) : (
        <>
          <Card variant="bordered" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                      Parent
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                      Child
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                      Subject
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                      Submitted
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.data.map((t) => (
                    <tr
                      key={t.id}
                      className="cursor-pointer transition-colors hover:bg-slate-50"
                      onClick={() => setSelected(t)}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{t.parentName}</p>
                        <p className="text-sm text-slate-500">{t.parentEmail}</p>
                        {t.parentPhone && (
                          <p className="text-xs text-slate-400">{t.parentPhone}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{t.childFirstName}</p>
                        <p className="text-sm text-slate-500">{t.childYearGroup}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={t.subject === "MATHS" ? "primary" : t.subject === "ENGLISH" ? "warning" : "success"}>
                          {t.subject === "BOTH" ? "Maths + English" : t.subject === "MATHS" ? "Maths" : "English"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {new Date(t.createdAt).toLocaleDateString("en-GB")}
                        <p className="text-xs text-slate-400">
                          {new Date(t.createdAt).toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </td>
                      <td className="px-4 py-3">{statusBadge(t.status)}</td>
                      <td className="px-4 py-3 text-right">
                        <div
                          className="flex items-center justify-end gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button variant="ghost" size="sm" onClick={() => setSelected(t)}>
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(t.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
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

      {/* Detail drawer */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-end bg-black/40 backdrop-blur-sm sm:items-center sm:justify-end"
          onClick={() => setSelected(null)}
        >
          <div
            className="h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Trial booking
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {selected.parentName}
                </h2>
                <p className="text-sm text-slate-500">{selected.parentEmail}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M6 18 18 6" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400">Phone</p>
                <p className="mt-1 font-medium text-slate-900">
                  {selected.parentPhone || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400">Submitted</p>
                <p className="mt-1 font-medium text-slate-900">
                  {new Date(selected.createdAt).toLocaleString("en-GB")}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400">Child</p>
                <p className="mt-1 font-medium text-slate-900">
                  {selected.childFirstName} ({selected.childYearGroup})
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400">Subject</p>
                <p className="mt-1 font-medium text-slate-900">
                  {selected.subject === "BOTH"
                    ? "Maths + English"
                    : selected.subject === "MATHS"
                    ? "Maths"
                    : "English"}
                </p>
              </div>
            </div>

            {selected.preferredTime && (
              <div className="mt-4">
                <p className="text-xs uppercase tracking-wider text-slate-400">Preferred time</p>
                <p className="mt-1 text-sm text-slate-900">{selected.preferredTime}</p>
              </div>
            )}

            {selected.notes && (
              <div className="mt-4">
                <p className="text-xs uppercase tracking-wider text-slate-400">Notes</p>
                <p className="mt-1 text-sm whitespace-pre-line text-slate-900">{selected.notes}</p>
              </div>
            )}

            <div className="mt-6">
              <p className="text-xs uppercase tracking-wider text-slate-400">Status</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(selected.id, s)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      selected.status === s
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {s.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex gap-3 border-t border-slate-200 pt-6">
              <a
                href={`mailto:${selected.parentEmail}?subject=${encodeURIComponent("Your BrainBooster trial")}`}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Email parent
              </a>
              {selected.parentPhone && (
                <a
                  href={`https://wa.me/${selected.parentPhone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-lg bg-[#25D366] px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#1faa55]"
                >
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
