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
  teacher: {
    firstName: string;
    lastName: string;
  };
}

export default function TimetablePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPast, setShowPast] = useState(false);

  useEffect(() => {
    // If showing past, fetch all; otherwise only upcoming
    const params = showPast ? "" : "?upcoming=true";
    fetch(`/api/sessions${params}`)
      .then((res) => res.json())
      .then((data) => {
        // API returns {data: [...], pagination: {...}} or array
        const sessions = Array.isArray(data) ? data : (data.data || []);
        setSessions(sessions);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [showPast]);

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
          <h1 className="text-2xl font-bold text-slate-900">Timetable</h1>
          <p className="text-slate-500">{showPast ? "All your classes" : "Your upcoming classes"}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={!showPast ? "primary" : "outline"}
            size="sm"
            onClick={() => setShowPast(false)}
          >
            Upcoming Only
          </Button>
          <Button
            variant={showPast ? "primary" : "outline"}
            size="sm"
            onClick={() => setShowPast(true)}
          >
            Include Past
          </Button>
        </div>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <Card variant="bordered" className="p-12 text-center">
          <p className="text-slate-500">No upcoming classes scheduled</p>
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
                const isToday = new Date(session.scheduledAt).toDateString() === new Date().toDateString();
                const isPast = new Date(session.scheduledAt) < new Date();

                return (
                  <Card key={session.id} variant="bordered" className={`p-4 ${isPast ? "opacity-60" : ""}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-1 h-16 rounded-full ${
                          session.subject === "MATHS" ? "bg-primary-500" : "bg-amber-500"
                        }`} />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900">{session.title}</h3>
                            {isToday && !isPast && <Badge variant="success">Today</Badge>}
                            {isPast && <Badge variant="default">Completed</Badge>}
                          </div>
                          <p className="text-sm text-slate-500">
                            {session.teacher.firstName} {session.teacher.lastName} • {session.duration} min
                          </p>
                          {session.description && (
                            <p className="text-sm text-slate-400 mt-1">{session.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={session.subject === "MATHS" ? "primary" : "warning"}>
                          {session.subject === "MATHS" ? "Maths" : "English"}
                        </Badge>
                        <p className="text-lg font-semibold text-slate-900 mt-1">{time}</p>
                        {session.meetingLink && !isPast && (
                          <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" className="mt-2">Join Class</Button>
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

