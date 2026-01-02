"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "@/components/ui/video-player";

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

export default function RecordingWatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [recording, setRecording] = useState<Recording | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/recordings/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Recording not found");
        return res.json();
      })
      .then((data) => {
        setRecording(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pastel-blue-border" />
      </div>
    );
  }

  if (error || !recording) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card variant="bordered" className="p-12 text-center">
          <p className="text-slate-500 mb-4">{error || "Recording not found"}</p>
          <Link href="/dashboard/recordings">
            <Button variant="outline">Back to Recordings</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back link */}
      <Link href="/dashboard/recordings" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Recordings
      </Link>

      {/* Video Player */}
      <VideoPlayer
        src={recording.videoUrl}
        title={recording.title}
        thumbnail={recording.thumbnailUrl || undefined}
      />

      {/* Video Info */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{recording.title}</h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
              <span>{recording.teacher?.firstName} {recording.teacher?.lastName}</span>
              <span>•</span>
              <span>{recording.viewCount} views</span>
              <span>•</span>
              <span>{new Date(recording.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={recording.subject === "MATHS" ? "primary" : "warning"}>
              {recording.subject === "MATHS" ? "Mathematics" : "English"}
            </Badge>
            <Badge variant="default">{recording.yearGroup}</Badge>
            {recording.duration && (
              <Badge variant="default">{formatDuration(recording.duration)}</Badge>
            )}
          </div>
        </div>

        {recording.description && (
          <Card variant="bordered" className="p-4">
            <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
            <p className="text-slate-600 whitespace-pre-wrap">{recording.description}</p>
          </Card>
        )}
      </div>
    </div>
  );
}

