"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Recording {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  yearGroup: string;
  videoUrl: string;
  duration: number | null;
  viewCount: number;
  isPublished: boolean;
  createdAt: string;
}

export default function TeacherRecordingsPage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/recordings")
      .then((res) => res.json())
      .then((data) => {
        // API returns {data: [...], pagination: {...}} or array
        const recordings = Array.isArray(data) ? data : (data.data || []);
        setRecordings(recordings);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "—";
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pastel-blue-border" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Recordings</h1>
          <p className="text-slate-500">Manage your uploaded recordings</p>
        </div>
        <Link href="/teacher/upload">
          <Button>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Upload New
          </Button>
        </Link>
      </div>

      {recordings.length === 0 ? (
        <Card variant="bordered" className="p-12 text-center">
          <p className="text-slate-500 mb-4">You haven't uploaded any recordings yet</p>
          <Link href="/teacher/upload">
            <Button>Upload Your First Recording</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {recordings.map((recording) => (
            <Card key={recording.id} variant="bordered" className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900">{recording.title}</h3>
                      {!recording.isPublished && <Badge variant="warning">Draft</Badge>}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <Badge variant={recording.subject === "MATHS" ? "primary" : "warning"} className="text-xs">
                        {recording.subject === "MATHS" ? "Maths" : "English"}
                      </Badge>
                      <span>{recording.yearGroup}</span>
                      <span>•</span>
                      <span>{formatDuration(recording.duration)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-lg font-semibold text-slate-900">{recording.viewCount}</p>
                    <p className="text-xs text-slate-500">views</p>
                  </div>
                  <div className="flex gap-2">
                    <a href={recording.videoUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">View</Button>
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

