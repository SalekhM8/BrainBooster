"use client";

import { useMemo, memo } from "react";
import useSWR from "swr";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { fetcher } from "@/lib/fetcher";
import { 
  Video, 
  PlayCircle, 
  Clock, 
  Sparkles, 
  Calendar, 
  ArrowRight,
  ChevronRight,
  MonitorPlay
} from "lucide-react";

interface DashboardData {
  upcomingSessions: number;
  totalRecordingsWatched: number;
  totalWatchTime: number;
  subscriptionStatus: string;
  recentSessions: Array<{
    id: string;
    title: string;
    subject: string;
    scheduledAt: string;
    teacher: { firstName: string; lastName: string };
  }>;
  recentRecordings: Array<{
    id: string;
    title: string;
    subject: string;
    duration: number | null;
    createdAt: string;
    videoUrl: string;
  }>;
}

const SessionItem = memo(function SessionItem({
  session,
}: {
  session: DashboardData["recentSessions"][0];
}) {
  const date = new Date(session.scheduledAt);
  const timeStr = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateStr =
    date.toDateString() === new Date().toDateString()
      ? `Today, ${timeStr}`
      : `${date.toLocaleDateString("en-GB", { weekday: "short" })}, ${timeStr}`;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 bg-white/60 border-2 border-pastel-blue/10 rounded-xl sm:rounded-[1.5rem] hover:border-pastel-blue-border/40 hover:bg-white transition-all duration-300 group shadow-sm gap-3 sm:gap-6">
      <div className="flex items-center gap-4 sm:gap-6">
        <div
          className={`w-1 sm:w-1.5 h-10 sm:h-12 rounded-full transition-all duration-500 ${
            session.subject === "MATHS" ? "bg-pastel-blue-border" : "bg-amber-200"
          } group-hover:h-12 sm:group-hover:h-14`}
        />
        <div>
          <h3 className="text-sm sm:text-lg font-bold text-slate-900 tracking-tightest leading-tight">{session.title}</h3>
          <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] sm:tracking-[0.2em] mt-1 sm:mt-2">
            Led by {session.teacher.firstName} {session.teacher.lastName}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between sm:justify-end sm:flex-col sm:items-end gap-2 sm:gap-3 pl-5 sm:pl-0">
        <Badge variant={session.subject === "MATHS" ? "primary" : "warning"} className="bg-pastel-blue/30 border-pastel-blue-border/20 text-[10px] sm:text-xs">
          {session.subject === "MATHS" ? "Maths" : "English"}
        </Badge>
        <p className="text-xs sm:text-sm font-bold text-slate-500 tracking-tightest flex items-center gap-1.5 sm:gap-2">
          <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-pastel-blue-border" />
          {dateStr}
        </p>
      </div>
    </div>
  );
});

const RecordingItem = memo(function RecordingItem({
  recording,
}: {
  recording: DashboardData["recentRecordings"][0];
}) {
  const date = new Date(recording.createdAt);
  const dateStr = date.toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
  });
  const duration = recording.duration
    ? `${Math.floor(recording.duration / 60)} min`
    : "";

  return (
    <a href={recording.videoUrl} target="_blank" rel="noopener noreferrer">
      <div className="flex items-center justify-between p-3 sm:p-5 bg-white/40 border-2 border-transparent hover:border-pastel-blue-border/30 hover:bg-white rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-300 group">
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pastel-blue/30 border-2 border-pastel-blue-border/10 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:bg-pastel-blue transition-all duration-300">
            <PlayCircle className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600 group-hover:text-slate-900" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 tracking-tightest leading-tight group-hover:text-pastel-blue-border transition-colors text-sm sm:text-base">{recording.title}</h3>
            <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 sm:mt-1.5 flex items-center gap-1.5 sm:gap-2">
              <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              {duration && `${duration} • `}
              {dateStr}
            </p>
          </div>
        </div>
        <Badge variant={recording.subject === "MATHS" ? "primary" : "warning"} className="bg-white/50 border-pastel-blue-border/10 text-[10px] sm:text-xs hidden sm:flex">
          {recording.subject === "MATHS" ? "Maths" : "English"}
        </Badge>
      </div>
    </a>
  );
});

export default function StudentDashboard() {
  const { data: session } = useSession();
  const user = session?.user;

  const { data, isLoading } = useSWR<DashboardData>("/api/dashboard", fetcher);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  }, []);

  if (isLoading || !data) {
    return <DashboardSkeleton />;
  }

  const stats = [
    { label: "Live Classes", value: data.upcomingSessions.toString(), icon: Video, color: "bg-blue-50 text-blue-600" },
    { label: "Lessons Watched", value: data.totalRecordingsWatched.toString(), icon: MonitorPlay, color: "bg-pastel-blue text-slate-700" },
    {
      label: "Hours Learned",
      value: Math.floor(data.totalWatchTime / 3600).toString(),
      icon: Clock,
      color: "bg-blue-50/50 text-blue-500"
    },
    { label: "Account Status", value: data.subscriptionStatus === "ACTIVE" ? "Premium" : "Basic", icon: Sparkles, color: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div className="space-y-6 sm:space-y-10 lg:space-y-12 pb-10 sm:pb-20">
      {/* Welcome Section */}
      <div className="relative bg-white border-2 sm:border-4 border-pastel-blue-border/20 rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 lg:p-12 overflow-hidden shadow-[0_32px_64px_-16px_rgba(165,197,255,0.15)]">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[15rem] sm:w-[25rem] lg:w-[30rem] h-[15rem] sm:h-[25rem] lg:h-[30rem] bg-pastel-blue/20 rounded-full blur-[80px] sm:blur-[100px]" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[10rem] sm:w-[15rem] lg:w-[20rem] h-[10rem] sm:h-[15rem] lg:h-[20rem] bg-blue-50/30 rounded-full blur-[60px] sm:blur-[80px]" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-8 lg:gap-10">
          <div>
            <Badge variant="primary" className="mb-3 sm:mb-4 lg:mb-6 bg-pastel-blue border-pastel-blue-border text-[9px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold">Student Center</Badge>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-2 sm:mb-3 lg:mb-4 tracking-tightest leading-tight">
              {greeting}, <span className="italic-accent text-pastel-blue-border">{user?.firstName}</span>!
            </h1>
            <p className="text-sm sm:text-lg lg:text-xl text-slate-500 font-bold tracking-tightest max-w-xl leading-relaxed">
              You have <span className="text-slate-900">{data.upcomingSessions} sessions</span> this week. Your learning journey is looking great!
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4">
            <Link href="/dashboard/live-classes">
              <Button size="lg" className="h-11 sm:h-14 lg:h-16 px-5 sm:px-8 lg:px-10 shadow-xl shadow-pastel-blue-border/30 bg-pastel-blue hover:bg-pastel-blue-dark border-2 border-pastel-blue-border text-sm sm:text-base">
                Join Live <ArrowRight className="ml-1.5 sm:ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </Link>
            <Link href="/dashboard/recordings">
              <Button variant="secondary" size="lg" className="h-11 sm:h-14 lg:h-16 px-5 sm:px-8 lg:px-10 border-2 border-slate-100 text-sm sm:text-base">
                Recordings
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-8">
        {stats.map((stat) => (
          <Card key={stat.label} variant="bordered" className="p-4 sm:p-6 lg:p-8 border-2 border-pastel-blue/10 bg-white/60 hover:border-pastel-blue-border/40 transition-all duration-500 shadow-sm group">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 ${stat.color} rounded-lg sm:rounded-xl lg:rounded-[1.25rem] flex items-center justify-center mb-3 sm:mb-4 lg:mb-6 group-hover:scale-110 transition-transform duration-500 border border-current/10`}>
              <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
            </div>
            <div className="text-xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tightest mb-1 sm:mb-2">{stat.value}</div>
            <div className="text-[8px] sm:text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] sm:tracking-[0.2em]">{stat.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-5 sm:gap-8 lg:gap-10">
        {/* Upcoming Sessions */}
        <Card variant="bordered" className="lg:col-span-3 p-4 sm:p-6 lg:p-10 border-2 sm:border-4 border-pastel-blue/10 bg-white/40 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 bg-pastel-blue/10 rounded-full blur-[60px] sm:blur-[80px] -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5 sm:mb-8 lg:mb-10">
              <div className="flex items-center gap-2.5 sm:gap-3 lg:gap-4">
                <div className="p-2 sm:p-2.5 lg:p-3 bg-pastel-blue rounded-lg sm:rounded-xl border-2 border-pastel-blue-border/20">
                  <Video className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-slate-700" />
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 tracking-tightest">Your Schedule</h2>
              </div>
              <Link
                href="/dashboard/timetable"
                className="group flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-pastel-blue-border tracking-tightest transition-all"
              >
                <span className="hidden sm:inline">See all</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            {data.recentSessions.length > 0 ? (
              <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                {data.recentSessions.map((s) => (
                  <SessionItem key={s.id} session={s} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 sm:py-16 lg:py-20 bg-white/50 rounded-2xl sm:rounded-3xl border-2 border-dashed border-pastel-blue-border/20">
                <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-slate-200 mx-auto mb-2 sm:mb-3" />
                <p className="text-slate-500 font-bold tracking-tightest text-sm sm:text-base">No sessions scheduled</p>
                <Button variant="ghost" size="sm" className="mt-3 sm:mt-4 text-xs sm:text-sm">Browse curriculum</Button>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Library */}
        <Card variant="bordered" className="lg:col-span-2 p-4 sm:p-6 lg:p-10 border-2 sm:border-4 border-pastel-blue/10 bg-white/40">
          <div className="flex items-center justify-between mb-5 sm:mb-8 lg:mb-10">
            <div className="flex items-center gap-2.5 sm:gap-3 lg:gap-4">
              <div className="p-2 sm:p-2.5 lg:p-3 bg-blue-50 rounded-lg sm:rounded-xl border-2 border-blue-100">
                <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
              </div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 tracking-tightest">Recent Lessons</h2>
            </div>
          </div>
          {data.recentRecordings.length > 0 ? (
            <div className="space-y-1.5 sm:space-y-2">
              {data.recentRecordings.map((rec) => (
                <RecordingItem key={rec.id} recording={rec} />
              ))}
              <Link href="/dashboard/recordings">
                <Button variant="secondary" className="w-full mt-4 sm:mt-6 border-2 border-slate-100 hover:bg-pastel-blue group h-10 sm:h-12 text-sm">
                  View library <ArrowRight className="ml-1.5 sm:ml-2 w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="text-center py-10 sm:py-16 lg:py-20 bg-white/50 rounded-2xl sm:rounded-3xl border-2 border-dashed border-pastel-blue-border/20">
              <PlayCircle className="w-8 h-8 sm:w-10 sm:h-10 text-slate-200 mx-auto mb-2 sm:mb-3" />
              <p className="text-slate-500 font-bold tracking-tightest text-sm sm:text-base">No recordings watched</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
