"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Video } from "lucide-react";
import Link from "next/link";

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
}

export default function AdminAddRecordingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  
  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: "MATHS",
    yearGroup: "GCSE",
    videoUrl: "",
    thumbnailUrl: "",
    duration: "",
    teacherId: "",
  });

  // Fetch teachers for assignment
  useEffect(() => {
    fetch("/api/users?role=TEACHER&limit=100")
      .then((res) => res.json())
      .then((data) => {
        const teacherList = Array.isArray(data) ? data : (data.data || []);
        setTeachers(teacherList);
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!form.videoUrl) {
      setError("Video URL is required");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/recordings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || null,
          subject: form.subject,
          yearGroup: form.yearGroup,
          videoUrl: form.videoUrl,
          thumbnailUrl: form.thumbnailUrl || null,
          duration: form.duration ? parseInt(form.duration) * 60 : null,
          // Note: teacherId would need API modification to support admin assigning to specific teacher
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create recording");
      }
      
      router.push("/admin/recordings");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add recording. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/recordings">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add Recording</h1>
          <p className="text-slate-500">Add a Zoom recording link for students</p>
        </div>
      </div>

      {/* Info Banner */}
      <Card className="p-4 bg-pastel-blue/30 border-2 border-pastel-blue-border/20">
        <div className="flex items-start gap-3">
          <Video className="w-5 h-5 text-pastel-blue-border mt-0.5" />
          <div>
            <p className="text-sm font-bold text-pastel-blue-border">How to add a Zoom recording</p>
            <p className="text-xs text-pastel-blue-border/70 mt-1">
              1. Go to your Zoom account → Recordings<br />
              2. Find the class recording and click "Share"<br />
              3. Copy the share link and paste it below
            </p>
          </div>
        </div>
      </Card>

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
            placeholder="e.g. GCSE Maths - Quadratic Equations (Jan 15)"
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description (optional)
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description of what's covered in this recording..."
              rows={3}
              className="w-full px-4 py-2 rounded-xl border-2 border-pastel-blue-border/30 text-sm focus:outline-none focus:ring-2 focus:ring-pastel-blue-border/50 focus:border-pastel-blue-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Subject
              </label>
              <select
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full h-12 px-4 rounded-xl border-2 border-pastel-blue-border/30 text-sm focus:outline-none focus:ring-2 focus:ring-pastel-blue-border/50 focus:border-pastel-blue-border"
              >
                <option value="MATHS">Mathematics</option>
                <option value="ENGLISH">English</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Year Group
              </label>
              <select
                value={form.yearGroup}
                onChange={(e) => setForm({ ...form, yearGroup: e.target.value })}
                className="w-full h-12 px-4 rounded-xl border-2 border-pastel-blue-border/30 text-sm focus:outline-none focus:ring-2 focus:ring-pastel-blue-border/50 focus:border-pastel-blue-border"
              >
                <option value="KS3">KS3</option>
                <option value="KS4">KS4</option>
                <option value="GCSE">GCSE</option>
                <option value="A_LEVEL">A-Level</option>
              </select>
            </div>
          </div>

          {teachers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Teacher (optional)
              </label>
              <select
                value={form.teacherId}
                onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
                className="w-full h-12 px-4 rounded-xl border-2 border-pastel-blue-border/30 text-sm focus:outline-none focus:ring-2 focus:ring-pastel-blue-border/50 focus:border-pastel-blue-border"
              >
                <option value="">— Select teacher —</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.firstName} {t.lastName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Video URL <Badge variant="primary" className="ml-2 text-[10px]">Required</Badge>
            </label>
            <Input
              value={form.videoUrl}
              onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
              placeholder="https://zoom.us/rec/share/... or YouTube/Vimeo link"
              required
            />
            <p className="text-xs text-slate-400 mt-1.5">
              Paste the Zoom cloud recording share link, YouTube URL, or any video URL
            </p>
          </div>

          <Input
            label="Thumbnail URL (optional)"
            value={form.thumbnailUrl}
            onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
            placeholder="https://... (leave empty for default)"
          />

          <Input
            label="Duration (minutes)"
            type="number"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            placeholder="e.g. 60"
          />

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <Button type="submit" isLoading={loading} className="flex-1">
              Add Recording
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

