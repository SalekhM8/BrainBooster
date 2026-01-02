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
  Calendar, 
  Video, 
  Eye, 
  GraduationCap, 
  BookOpen, 
  PlayCircle,
  ArrowRight,
  ChevronRight,
  Clock
} from "lucide-react";

interface TeacherDashboardData {
  totalSessions: number;
  totalRecordings: number;
  totalViews: number;
  studentsCount: number;
  todaySessions: Array<{
    id: string;
    title: string;
    subject: string;
    yearGroup: string;
    scheduledAt: string;
    meetingLink: string | null;
  }>;
  recentRecordings: Array<{
    id: string;
    title: string;
    viewCount: number;
    createdAt: string;
  }>;
}

// Memoized session item
const TodaySession = memo(function TodaySession({
  session,
}: {
  session: TeacherDashboardData["todaySessions"][0];
}) {
  const time = new Date(session.scheduledAt).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex items-center justify-between p-4 sm:p-6 bg-white/60 border-2 border-pastel-blue/10 rounded-2xl hover:border-pastel-blue-border/40 hover:bg-white transition-all duration-300 group shadow-sm">
      <div className="flex items-center gap-3 sm:gap-5">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pastel-blue/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
          <Video className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 tracking-tightest text-sm sm:text-base">{session.title}</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2">
            <Clock className="w-3 h-3" />
            {time} • {session.yearGroup}
          </p>
        </div>
      </div>
      {session.meetingLink ? (
        <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">
          <Button size="sm" className="bg-pastel-blue border-pastel-blue-border hidden sm:flex">Start Class</Button>
          <Button size="sm" className="bg-pastel-blue border-pastel-blue-border sm:hidden p-2">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </a>
      ) : (
        <Badge variant="default" className="bg-slate-100">No Link</Badge>
      )}
    </div>
  );
});

// Memoized recording row
const RecordingRow = memo(function RecordingRow({
  recording,
  index,
}: {
  recording: TeacherDashboardData["recentRecordings"][0];
  index: number;
}) {
  const date = new Date(recording.createdAt).toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/40 border-2 border-transparent hover:border-pastel-blue-border/30 hover:bg-white rounded-2xl transition-all duration-300 group">
      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-pastel-blue/20 rounded-xl flex items-center justify-center text-sm font-bold text-slate-500 group-hover:bg-pastel-blue transition-colors">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-slate-900 truncate tracking-tightest text-sm sm:text-base">{recording.title}</h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{date}</p>
      </div>
      <Badge variant="primary" className="bg-pastel-blue/30 border-pastel-blue-border/20 text-xs">
        <Eye className="w-3 h-3 mr-1" />
        {recording.viewCount}
      </Badge>
    </div>
  );
});

export default function TeacherDashboard() {
  const { data: session } = useSession();
  const user = session?.user;

  // Fetch dashboard data
  const { data, isLoading } = useSWR<TeacherDashboardData>(
    "/api/dashboard/teacher",
    fetcher
  );

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  }, []);

  if (isLoading || !data) {
    return <DashboardSkeleton />;
  }

  const stats = [
    { label: "Sessions This Week", value: data.totalSessions.toString(), icon: Calendar, color: "bg-pastel-blue text-slate-700" },
    { label: "Total Recordings", value: data.totalRecordings.toString(), icon: PlayCircle, color: "bg-blue-50 text-blue-600" },
    {
      label: "Total Views",
      value: data.totalViews >= 1000 ? `${(data.totalViews / 1000).toFixed(1)}K` : data.totalViews.toString(),
      icon: Eye,
      color: "bg-emerald-50 text-emerald-600"
    },
    { label: "Active Students", value: data.studentsCount.toString(), icon: GraduationCap, color: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div className="space-y-6 sm:space-y-10 pb-10 sm:pb-20">
      {/* Welcome */}
      <div className="relative bg-white border-4 border-pastel-blue-border/20 rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-12 overflow-hidden shadow-[0_32px_64px_-16px_rgba(165,197,255,0.15)]">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[20rem] sm:w-[30rem] h-[20rem] sm:h-[30rem] bg-pastel-blue/20 rounded-full blur-[100px]" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-10">
          <div>
            <Badge variant="primary" className="mb-4 sm:mb-6 bg-pastel-blue border-pastel-blue-border text-[10px] uppercase tracking-[0.2em] font-bold">Teacher Portal</Badge>
            <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 mb-3 sm:mb-4 tracking-tightest leading-tight">
              {greeting}, <span className="italic-accent text-pastel-blue-border">{user?.firstName}</span>!
            </h1>
            <p className="text-base sm:text-xl text-slate-500 font-bold tracking-tightest max-w-xl leading-relaxed">
              You have <span className="text-slate-900">{data.todaySessions.length} class{data.todaySessions.length !== 1 ? "es" : ""}</span> scheduled for today.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 sm:gap-4">
            <Link href="/teacher/sessions">
              <Button size="lg" className="h-12 sm:h-16 px-6 sm:px-10 shadow-xl shadow-pastel-blue-border/30 bg-pastel-blue hover:bg-pastel-blue-dark border-2 border-pastel-blue-border text-sm sm:text-base">
                View Sessions <Calendar className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </Link>
            <Link href="/teacher/recordings">
              <Button variant="secondary" size="lg" className="h-12 sm:h-16 px-6 sm:px-10 border-2 border-slate-100 text-sm sm:text-base">
                <BookOpen className="mr-2 w-4 h-4 sm:w-5 sm:h-5" /> Recordings
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} variant="bordered" className="p-4 sm:p-8 border-2 border-pastel-blue/10 bg-white/60 hover:border-pastel-blue-border/40 transition-all duration-500 shadow-sm group">
            <div className={`w-10 h-10 sm:w-14 sm:h-14 ${stat.color} rounded-xl sm:rounded-[1.25rem] flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-500 border border-current/10`}>
              <stat.icon className="w-5 h-5 sm:w-7 sm:h-7" />
            </div>
            <div className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tightest mb-1 sm:mb-2">{stat.value}</div>
            <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] sm:tracking-[0.2em]">{stat.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 sm:gap-10">
        {/* Today's Sessions */}
        <Card variant="bordered" className="p-5 sm:p-10 border-4 border-pastel-blue/10 bg-white/40">
          <div className="flex items-center justify-between mb-6 sm:mb-10">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-pastel-blue rounded-xl border-2 border-pastel-blue-border/20">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tightest">Today&apos;s Classes</h2>
            </div>
            <Link
              href="/teacher/sessions"
              className="group flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-pastel-blue-border tracking-tightest transition-all"
            >
              <span className="hidden sm:inline">Full Schedule</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          {data.todaySessions.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {data.todaySessions.map((s) => (
                <TodaySession key={s.id} session={s} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 sm:py-20 bg-white/50 rounded-2xl sm:rounded-3xl border-2 border-dashed border-pastel-blue-border/20">
              <Calendar className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-bold tracking-tightest">No sessions today</p>
            </div>
          )}
        </Card>

        {/* Recent Recordings */}
        <Card variant="bordered" className="p-5 sm:p-10 border-4 border-pastel-blue/10 bg-white/40">
          <div className="flex items-center justify-between mb-6 sm:mb-10">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-blue-50 rounded-xl border-2 border-blue-100">
                <PlayCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tightest">Recording Stats</h2>
            </div>
            <Link
              href="/teacher/recordings"
              className="group flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-pastel-blue-border tracking-tightest transition-all"
            >
              <span className="hidden sm:inline">View All</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          {data.recentRecordings.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {data.recentRecordings.map((recording, index) => (
                <RecordingRow key={recording.id} recording={recording} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 sm:py-20 bg-white/50 rounded-2xl sm:rounded-3xl border-2 border-dashed border-pastel-blue-border/20">
              <PlayCircle className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-bold tracking-tightest">No recordings yet</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
