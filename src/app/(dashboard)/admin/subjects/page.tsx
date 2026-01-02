"use client";

import { useState, useCallback, memo } from "react";
import useSWR from "swr";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableSkeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/fetcher";

interface Subject {
  id: string;
  name: string;
  code: string;
  color: string;
  sessionsCount: number;
  recordingsCount: number;
  isActive: boolean;
}

// Static subjects for now (can be made dynamic later with database table)
const SUBJECTS: Subject[] = [
  { id: "1", name: "Mathematics", code: "MATHS", color: "bg-indigo-500", sessionsCount: 0, recordingsCount: 0, isActive: true },
  { id: "2", name: "English", code: "ENGLISH", color: "bg-amber-500", sessionsCount: 0, recordingsCount: 0, isActive: true },
];

const SubjectRow = memo(function SubjectRow({
  subject,
  stats,
}: {
  subject: Subject;
  stats: { sessions: number; recordings: number };
}) {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${subject.color}`} />
          <div>
            <p className="font-medium text-slate-900">{subject.name}</p>
            <p className="text-sm text-slate-500">{subject.code}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 text-sm text-slate-600">{stats.sessions}</td>
      <td className="px-4 py-4 text-sm text-slate-600">{stats.recordings}</td>
      <td className="px-4 py-4">
        <Badge variant={subject.isActive ? "success" : "default"}>
          {subject.isActive ? "Active" : "Inactive"}
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

export default function AdminSubjectsPage() {
  const [search, setSearch] = useState("");

  // Fetch stats
  const { data: stats, isLoading } = useSWR<{
    mathsSessions: number;
    mathsRecordings: number;
    englishSessions: number;
    englishRecordings: number;
  }>("/api/subjects/stats", fetcher);

  const filteredSubjects = SUBJECTS.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Subjects</h1>
          <p className="text-slate-500">Manage available subjects</p>
        </div>
        <Button disabled>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Subject
        </Button>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search subjects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {isLoading ? (
        <TableSkeleton rows={2} />
      ) : (
        <Card variant="bordered" className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Subject</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Sessions</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Recordings</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Status</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubjects.map((subject) => (
                <SubjectRow
                  key={subject.id}
                  subject={subject}
                  stats={{
                    sessions: subject.code === "MATHS" ? (stats?.mathsSessions || 0) : (stats?.englishSessions || 0),
                    recordings: subject.code === "MATHS" ? (stats?.mathsRecordings || 0) : (stats?.englishRecordings || 0),
                  }}
                />
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Card variant="bordered" className="p-4 bg-amber-50 border-amber-200">
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> Subjects are currently fixed to Maths and English. Contact support to add more subjects.
        </p>
      </Card>
    </div>
  );
}

