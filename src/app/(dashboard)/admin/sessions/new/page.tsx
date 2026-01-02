"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
}

export default function NewSessionPage() {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  
  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: "MATHS",
    yearGroup: "GCSE",
    scheduledAt: "",
    duration: "60",
    meetingLink: "",
    teacherId: "",
  });

  useEffect(() => {
    fetch("/api/users?role=TEACHER")
      .then((res) => res.json())
      .then((data) => {
        // API returns {data: [...]} or array
        const teachers = Array.isArray(data) ? data : (data.data || []);
        setTeachers(teachers);
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          duration: parseInt(form.duration),
        }),
      });

      if (!res.ok) throw new Error("Failed to create session");
      
      // Invalidate all session caches to force refresh on sessions list
      await mutate(
        (key) => typeof key === "string" && key.startsWith("/api/sessions"),
        undefined,
        { revalidate: true }
      );
      
      router.push("/admin/sessions");
    } catch {
      setError("Failed to create session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Create Session</h1>
        <p className="text-slate-500">Schedule a new live class</p>
      </div>

      <Card variant="bordered" className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Algebra Fundamentals"
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Session description..."
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject</label>
              <select
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full h-11 px-4 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="MATHS">Mathematics</option>
                <option value="ENGLISH">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Year Group</label>
              <select
                value={form.yearGroup}
                onChange={(e) => setForm({ ...form, yearGroup: e.target.value })}
                className="w-full h-11 px-4 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="KS3">KS3</option>
                <option value="KS4">KS4</option>
                <option value="GCSE">GCSE</option>
                <option value="A_LEVEL">A-Level</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Teacher</label>
            <select
              value={form.teacherId}
              onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
              className="w-full h-11 px-4 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Select teacher...</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.firstName} {t.lastName}
                </option>
              ))}
            </select>
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

          <Input
            label="Meeting Link"
            value={form.meetingLink}
            onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
            placeholder="https://zoom.us/j/..."
          />

          <div className="flex gap-3 pt-4">
            <Button type="submit" isLoading={loading}>
              Create Session
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

