"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Session {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  yearGroup: string;
  scheduledAt: string;
  duration: number;
  meetingLink: string | null;
  isLive: boolean;
  teacher: {
    firstName: string;
    lastName: string;
  };
}

export default function LiveClassesPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "MATHS" | "ENGLISH">("all");

  useEffect(() => {
    fetch("/api/sessions?upcoming=true")
      .then((res) => res.json())
      .then((data) => {
        // API returns {data: [...], pagination: {...}} or array
        const sessions = Array.isArray(data) ? data : (data.data || []);
        setSessions(sessions);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === "all" 
    ? sessions 
    : sessions.filter((s) => s.subject === filter);

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
          <h1 className="text-2xl font-bold text-slate-900">Live Classes</h1>
          <p className="text-slate-500">Join your scheduled classes</p>
        </div>
        <div className="flex gap-2">
          {(["all", "MATHS", "ENGLISH"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "primary" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : f === "MATHS" ? "Maths" : "English"}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card variant="bordered" className="p-12 text-center">
          <p className="text-slate-500">No upcoming live classes</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((session) => {
            const date = new Date(session.scheduledAt);
            const isToday = date.toDateString() === new Date().toDateString();
            const isPast = date < new Date();
            const isNow = isToday && !isPast && date.getTime() - Date.now() < 30 * 60 * 1000;

            return (
              <Card key={session.id} variant="bordered" className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant={session.subject === "MATHS" ? "primary" : "warning"}>
                    {session.subject === "MATHS" ? "Maths" : "English"}
                  </Badge>
                  {isNow && <Badge variant="success">Starting Soon</Badge>}
                  {session.isLive && <Badge variant="error">LIVE</Badge>}
                </div>

                <h3 className="font-semibold text-slate-900 mb-1">{session.title}</h3>
                <p className="text-sm text-slate-500 mb-3">
                  {session.teacher.firstName} {session.teacher.lastName}
                </p>

                {session.description && (
                  <p className="text-sm text-slate-400 mb-4">{session.description}</p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {date.toLocaleDateString("en-GB", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                    <p className="text-sm text-slate-500">
                      {date.toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })} • {session.duration} min
                    </p>
                  </div>
                  {session.meetingLink && !isPast && (
                    <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">
                      <Button size="sm">
                        {session.isLive ? "Join Now" : "Join Class"}
                      </Button>
                    </a>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

