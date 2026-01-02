"use client";

import { memo } from "react";
import useSWR from "swr";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { fetcher } from "@/lib/fetcher";
import { 
  Users, 
  CreditCard, 
  Calendar, 
  Activity, 
  TrendingUp, 
  UserPlus,
  MonitorPlay,
  Settings,
  ChevronRight
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  activeSubscribers: number;
  totalSessions: number;
  totalRecordings: number;
  totalViews: number;
  recentUsers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    createdAt: string;
  }>;
}

const ActivityItem = memo(function ActivityItem({
  user,
}: {
  user: AdminStats["recentUsers"][0];
}) {
  const date = new Date(user.createdAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  let timeAgo = "";
  if (diffDays > 0) {
    timeAgo = `${diffDays}d ago`;
  } else if (diffHours > 0) {
    timeAgo = `${diffHours}h ago`;
  } else {
    timeAgo = "Just now";
  }

  return (
    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-5 bg-white/60 border-2 border-pastel-blue/10 rounded-xl sm:rounded-2xl transition-all duration-300 hover:border-pastel-blue-border/40 hover:bg-white group shadow-sm">
      <div
        className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ring-2 sm:ring-4 ${
          user.role === "STUDENT" 
            ? "bg-emerald-400 ring-emerald-50" 
            : "bg-pastel-blue-border ring-pastel-blue/20"
        }`}
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-bold text-slate-900 tracking-tightest group-hover:text-pastel-blue-border transition-colors truncate">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 sm:mt-1">{timeAgo}</p>
      </div>
      <Badge variant={user.role === "STUDENT" ? "success" : "primary"} className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white border-slate-100 text-[10px] sm:text-xs">
        {user.role}
      </Badge>
    </div>
  );
});

export default function AdminDashboard() {
  const { data: session } = useSession();
  const user = session?.user;

  const { data, isLoading } = useSWR<AdminStats>("/api/stats", fetcher, {
    refreshInterval: 30000,
  });

  if (isLoading || !data) {
    return <DashboardSkeleton />;
  }

  const stats = [
    { label: "Total Users", value: data.totalUsers.toLocaleString(), icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Subscribers", value: data.activeSubscribers.toLocaleString(), icon: CreditCard, color: "bg-pastel-blue text-slate-700" },
    { label: "Total Sessions", value: data.totalSessions.toLocaleString(), icon: Calendar, color: "bg-blue-50/50 text-blue-500" },
    { label: "Recordings", value: data.totalRecordings.toLocaleString(), icon: MonitorPlay, color: "bg-emerald-50 text-emerald-600" },
  ];

  return (
    <div className="space-y-6 sm:space-y-10 lg:space-y-12 pb-10 sm:pb-20">
      {/* Admin Header */}
      <div className="relative bg-white border-2 sm:border-4 border-pastel-blue-border/20 rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 lg:p-12 overflow-hidden shadow-[0_32px_64px_-16px_rgba(165,197,255,0.15)]">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[15rem] sm:w-[25rem] lg:w-[30rem] h-[15rem] sm:h-[25rem] lg:h-[30rem] bg-pastel-blue/20 rounded-full blur-[80px] sm:blur-[100px]" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-8 lg:gap-10">
          <div>
            <Badge variant="primary" className="mb-3 sm:mb-4 lg:mb-6 bg-pastel-blue border-pastel-blue-border text-[9px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold">System Administrator</Badge>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-2 sm:mb-3 lg:mb-4 tracking-tightest leading-tight">
              Control <span className="italic-accent text-pastel-blue-border">Center</span>
            </h1>
            <p className="text-sm sm:text-lg lg:text-xl text-slate-500 font-bold tracking-tightest max-w-lg leading-relaxed">
              Hello, {user?.firstName}. The platform is running smoothly with <span className="text-slate-900">{data.activeSubscribers}</span> active learners.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4">
            <Link href="/admin/users">
              <Button size="lg" className="h-11 sm:h-14 lg:h-16 px-5 sm:px-8 lg:px-10 shadow-xl shadow-pastel-blue-border/30 bg-pastel-blue hover:bg-pastel-blue-dark border-2 border-pastel-blue-border text-sm sm:text-base">
                Manage Users <Users className="ml-1.5 sm:ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="secondary" size="lg" className="h-11 sm:h-14 lg:h-16 px-5 sm:px-8 lg:px-10 border-2 border-slate-100 text-sm sm:text-base">
                <Settings className="mr-1.5 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5" /> Settings
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-8">
        {stats.map((stat) => (
          <Card key={stat.label} variant="bordered" className="p-4 sm:p-6 lg:p-10 border-2 border-pastel-blue/10 bg-white/60 hover:border-pastel-blue-border/40 transition-all duration-500 shadow-sm group">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 ${stat.color} rounded-lg sm:rounded-xl lg:rounded-[1.5rem] flex items-center justify-center mb-3 sm:mb-5 lg:mb-8 group-hover:scale-110 transition-transform duration-500 border border-current/10 shadow-sm`}>
              <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
            </div>
            <div className="text-xl sm:text-3xl lg:text-5xl font-bold text-slate-900 tracking-tightest mb-1 sm:mb-2">{stat.value}</div>
            <div className="text-[8px] sm:text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] sm:tracking-[0.2em]">{stat.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5 sm:gap-8 lg:gap-10">
        {/* Performance Insights */}
        <Card variant="bordered" className="lg:col-span-1 p-5 sm:p-8 lg:p-12 border-2 sm:border-4 border-pastel-blue/10 bg-white relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 bg-pastel-blue/20 rounded-full blur-[60px] sm:blur-[80px] -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="p-2.5 sm:p-3 lg:p-4 bg-pastel-blue w-fit rounded-lg sm:rounded-xl lg:rounded-2xl border-2 border-pastel-blue-border/20 mb-5 sm:mb-8 lg:mb-10">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-slate-700" />
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tightest mb-2 sm:mb-3 lg:mb-4 leading-tight">Engagement <span className="italic-accent text-pastel-blue-border">Growth</span></h3>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tighter mb-2 sm:mb-3 lg:mb-4">
              {data.totalViews.toLocaleString()}
            </p>
            <div className="flex items-center gap-1.5 sm:gap-2 text-emerald-600 font-bold text-xs sm:text-sm bg-emerald-50 px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-full w-fit">
              <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
              +12.4% vs last month
            </div>
            <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4 sm:mt-5 lg:mt-6">Total Content Interaction</p>
          </div>
          <div className="mt-6 sm:mt-10 lg:mt-12 pt-5 sm:pt-6 lg:pt-8 border-t-2 border-slate-50">
            <p className="text-xs sm:text-sm font-bold text-slate-500 leading-relaxed tracking-tightest">
              Most active subjects: <span className="text-slate-900">Mathematics GCSE</span> and <span className="text-slate-900">English A-Level</span>.
            </p>
          </div>
        </Card>

        {/* Recent Platform Activity */}
        <Card variant="bordered" className="lg:col-span-2 p-5 sm:p-8 lg:p-12 border-2 sm:border-4 border-pastel-blue/10 bg-white/60">
          <div className="flex items-center justify-between mb-5 sm:mb-8 lg:mb-12">
            <div className="flex items-center gap-2.5 sm:gap-3 lg:gap-4">
              <div className="p-2 sm:p-2.5 lg:p-3 bg-blue-50 rounded-lg sm:rounded-xl border-2 border-blue-100/50">
                <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-blue-600" />
              </div>
              <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tightest">New Registrations</h2>
            </div>
            <Link href="/admin/users" className="group flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-pastel-blue-border tracking-tightest transition-all">
              <span className="hidden sm:inline">Manage all</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          {data.recentUsers.length === 0 ? (
            <div className="text-center py-10 sm:py-16 lg:py-20 bg-white/50 rounded-2xl sm:rounded-3xl border-2 border-dashed border-pastel-blue-border/20">
              <UserPlus className="w-8 h-8 sm:w-10 sm:h-10 text-slate-200 mx-auto mb-2 sm:mb-3" />
              <p className="text-slate-500 font-bold tracking-tightest text-sm sm:text-base">No recent activity</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
              {data.recentUsers.map((recentUser) => (
                <ActivityItem key={recentUser.id} user={recentUser} />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
