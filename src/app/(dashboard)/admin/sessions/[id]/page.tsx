"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import useSWR, { useSWRConfig } from "swr";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetcher } from "@/lib/fetcher";

interface Session {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  yearGroup: string;
  scheduledAt: string;
  duration: number;
  meetingLink: string | null;
  meetingPassword: string | null;
  teacherId: string;
  isLive: boolean;
  isCancelled: boolean;
}

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
}

export default function EditSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { mutate: globalMutate } = useSWRConfig();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const { data: session, isLoading: sessionLoading } = useSWR<Session>(
    `/api/sessions/${resolvedParams.id}`,
    fetcher
  );

  const { data: teachers } = useSWR<{ data: Teacher[] }>("/api/users?role=TEACHER&limit=100", fetcher);

  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: "MATHS",
    yearGroup: "GCSE",
    scheduledAt: "",
    duration: "60",
    meetingLink: "",
    meetingPassword: "",
    teacherId: "",
    isLive: false,
    isCancelled: false,
  });

  useEffect(() => {
    if (session) {
      const date = new Date(session.scheduledAt);
      setForm({
        title: session.title,
        description: session.description || "",
        subject: session.subject,
        yearGroup: session.yearGroup,
        scheduledAt: date.toISOString().slice(0, 16),
        duration: session.duration.toString(),
        meetingLink: session.meetingLink || "",
        meetingPassword: session.meetingPassword || "",
        teacherId: session.teacherId,
        isLive: session.isLive,
        isCancelled: session.isCancelled,
      });
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch(`/api/sessions/${resolvedParams.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || null,
          subject: form.subject,
          yearGroup: form.yearGroup,
          scheduledAt: new Date(form.scheduledAt).toISOString(),
          duration: parseInt(form.duration),
          meetingLink: form.meetingLink || null,
          meetingPassword: form.meetingPassword || null,
          teacherId: form.teacherId,
          isLive: form.isLive,
          isCancelled: form.isCancelled,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update session");
      }

      // Invalidate all session caches to force refresh on sessions list
      await globalMutate(
        (key) => typeof key === "string" && key.startsWith("/api/sessions"),
        undefined,
        { revalidate: true }
      );

      router.push("/admin/sessions");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pastel-blue-border" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Session</h1>
        <p className="text-slate-500">Update session details</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <Card variant="bordered" className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
              <select
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="MATHS">Maths</option>
                <option value="ENGLISH">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Year Group</label>
              <select
                value={form.yearGroup}
                onChange={(e) => setForm({ ...form, yearGroup: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="KS3">KS3</option>
                <option value="KS4">KS4</option>
                <option value="GCSE">GCSE</option>
                <option value="A_LEVEL">A-Level</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date & Time"
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
              required
            />
            <Input
              label="Duration (minutes)"
              type="number"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Teacher</label>
            <select
              value={form.teacherId}
              onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Select a teacher</option>
              {teachers?.data.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.firstName} {teacher.lastName}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Meeting Link (Zoom/Teams)"
            value={form.meetingLink}
            onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
            placeholder="https://zoom.us/j/..."
          />

          <Input
            label="Meeting Password (optional)"
            value={form.meetingPassword}
            onChange={(e) => setForm({ ...form, meetingPassword: e.target.value })}
          />

          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isLive}
                onChange={(e) => setForm({ ...form, isLive: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-slate-700">Session is Live</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isCancelled}
                onChange={(e) => setForm({ ...form, isCancelled: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-slate-700">Cancelled</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" isLoading={saving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

