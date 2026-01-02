"use client";

import { useState, memo } from "react";
import useSWR from "swr";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableSkeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/fetcher";

interface YearGroup {
  id: string;
  name: string;
  code: string;
  description: string;
  studentsCount: number;
  isActive: boolean;
}

// Static year groups
const YEAR_GROUPS: YearGroup[] = [
  { id: "1", name: "Key Stage 3", code: "KS3", description: "Years 7-9 (Ages 11-14)", studentsCount: 0, isActive: true },
  { id: "2", name: "Key Stage 4", code: "KS4", description: "Years 10-11 (Ages 14-16)", studentsCount: 0, isActive: true },
  { id: "3", name: "GCSE", code: "GCSE", description: "General Certificate of Secondary Education", studentsCount: 0, isActive: true },
  { id: "4", name: "A-Level", code: "A_LEVEL", description: "Advanced Level (Ages 16-18)", studentsCount: 0, isActive: true },
];

const YearGroupRow = memo(function YearGroupRow({
  group,
  studentsCount,
}: {
  group: YearGroup;
  studentsCount: number;
}) {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-4">
        <div>
          <p className="font-medium text-slate-900">{group.name}</p>
          <p className="text-sm text-slate-500">{group.code}</p>
        </div>
      </td>
      <td className="px-4 py-4 text-sm text-slate-600">{group.description}</td>
      <td className="px-4 py-4 text-sm text-slate-600">{studentsCount}</td>
      <td className="px-4 py-4">
        <Badge variant={group.isActive ? "success" : "default"}>
          {group.isActive ? "Active" : "Inactive"}
        </Badge>
      </td>
      <td className="px-4 py-4 text-right">
        <Button variant="ghost" size="sm" disabled>
          Edit
        </Button>
      </td>
    </tr>
  );
});

export default function AdminYearGroupsPage() {
  const [search, setSearch] = useState("");

  // Fetch stats
  const { data: stats, isLoading } = useSWR<Record<string, number>>("/api/year-groups/stats", fetcher);

  const filteredGroups = YEAR_GROUPS.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Year Groups</h1>
          <p className="text-slate-500">Manage student year groups and levels</p>
        </div>
        <Button disabled>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Year Group
        </Button>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search year groups..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {isLoading ? (
        <TableSkeleton rows={4} />
      ) : (
        <Card variant="bordered" className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Year Group</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Description</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Students</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Status</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGroups.map((group) => (
                <YearGroupRow
                  key={group.id}
                  group={group}
                  studentsCount={stats?.[group.code] || 0}
                />
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Card variant="bordered" className="p-4 bg-amber-50 border-amber-200">
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> Year groups are fixed to the UK education system. Contact support to customize.
        </p>
      </Card>
    </div>
  );
}

