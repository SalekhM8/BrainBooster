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
    <div className="space-y-4 sm:space-y-6">
      {/* Header - stacks on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-pastel-blue-border">Timetable</h1>
          <p className="text-pastel-blue-text/70 text-sm">{showPast ? "All your classes" : "Your upcoming classes"}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={!showPast ? "primary" : "outline"}
            size="sm"
            onClick={() => setShowPast(false)}
          >
            Upcoming
          </Button>
          <Button
            variant={showPast ? "primary" : "outline"}
            size="sm"
            onClick={() => setShowPast(true)}
          >
            All
          </Button>
        </div>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <Card variant="bordered" className="p-8 sm:p-12 text-center">
          <p className="text-pastel-blue-text/70">No upcoming classes scheduled</p>
        </Card>
      ) : (
        Object.entries(grouped).map(([date, daySessions]) => (
          <div key={date}>
            <h2 className="text-base sm:text-lg font-semibold text-pastel-blue-border mb-2 sm:mb-3">{date}</h2>
            <div className="space-y-3">
              {daySessions.map((session) => {
                const time = new Date(session.scheduledAt).toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const isToday = new Date(session.scheduledAt).toDateString() === new Date().toDateString();
                const isPast = new Date(session.scheduledAt) < new Date();

                return (
                  <Card key={session.id} variant="bordered" className={`p-3 sm:p-4 ${isPast ? "opacity-60" : ""}`}>
                    {/* Mobile: Stacked layout */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`w-1 h-full min-h-[60px] rounded-full shrink-0 ${
                          session.subject === "MATHS" ? "bg-pastel-blue-border" : "bg-amber-500"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                            <h3 className="font-semibold text-pastel-blue-border text-sm sm:text-base">{session.title}</h3>
                            {isToday && !isPast && <Badge variant="success" className="text-[10px] sm:text-xs">Today</Badge>}
                            {isPast && <Badge variant="default" className="text-[10px] sm:text-xs">Done</Badge>}
                          </div>
                          <p className="text-xs sm:text-sm text-pastel-blue-text/70">
                            {session.teacher.firstName} {session.teacher.lastName} • {session.duration} min
                          </p>
                          {session.description && (
                            <p className="text-xs text-pastel-blue-text/50 mt-1 line-clamp-2">{session.description}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Time and actions */}
                      <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 pl-4 sm:pl-0">
                        <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                          <Badge variant={session.subject === "MATHS" ? "primary" : "warning"} className="text-[10px] sm:text-xs">
                            {session.subject === "MATHS" ? "Maths" : "English"}
                          </Badge>
                          <p className="text-base sm:text-lg font-semibold text-pastel-blue-border">{time}</p>
                        </div>
                        {session.meetingLink && !isPast && (
                          <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" className="text-xs sm:text-sm">Join</Button>
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

