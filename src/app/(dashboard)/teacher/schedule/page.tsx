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
  isCancelled: boolean;
}

export default function TeacherSchedulePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"upcoming" | "all">("upcoming");

  useEffect(() => {
    const params = view === "upcoming" ? "?upcoming=true" : "";
    fetch(`/api/sessions${params}`)
      .then((res) => res.json())
      .then((data) => {
        // API returns {data: [...], pagination: {...}} or array
        const sessions = Array.isArray(data) ? data : (data.data || []);
        setSessions(sessions);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [view]);

  const groupByDate = (sessions: Session[]) => {
    const groups: Record<string, Session[]> = {};
    sessions.forEach((session) => {
      const date = new Date(session.scheduledAt).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(session);
    });
    return groups;
  };

  const grouped = groupByDate(sessions);

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
          <h1 className="text-2xl font-bold text-slate-900">My Schedule</h1>
          <p className="text-slate-500">Your teaching schedule</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === "upcoming" ? "primary" : "outline"}
            size="sm"
            onClick={() => setView("upcoming")}
          >
            Upcoming
          </Button>
          <Button
            variant={view === "all" ? "primary" : "outline"}
            size="sm"
            onClick={() => setView("all")}
          >
            All Sessions
          </Button>
        </div>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <Card variant="bordered" className="p-12 text-center">
          <p className="text-slate-500">No sessions scheduled</p>
        </Card>
      ) : (
        Object.entries(grouped).map(([date, daySessions]) => (
          <div key={date}>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">{date}</h2>
            <div className="space-y-3">
              {daySessions.map((session) => {
                const time = new Date(session.scheduledAt).toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const isPast = new Date(session.scheduledAt) < new Date();

                return (
                  <Card key={session.id} variant="bordered" className={`p-4 ${session.isCancelled ? "opacity-50" : ""}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-1 h-16 rounded-full ${
                          session.subject === "MATHS" ? "bg-primary-500" : "bg-amber-500"
                        }`} />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900">{session.title}</h3>
                            {session.isCancelled && <Badge variant="error">Cancelled</Badge>}
                            {session.isLive && <Badge variant="success">LIVE</Badge>}
                          </div>
                          <p className="text-sm text-slate-500">
                            {session.yearGroup} • {session.duration} min
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={session.subject === "MATHS" ? "primary" : "warning"}>
                          {session.subject === "MATHS" ? "Maths" : "English"}
                        </Badge>
                        <p className="text-lg font-semibold text-slate-900 mt-1">{time}</p>
                        {session.meetingLink && !isPast && !session.isCancelled && (
                          <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" className="mt-2">Start Class</Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

