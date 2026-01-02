"use client";

import useSWR from "swr";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetcher } from "@/lib/fetcher";
import { 
  Users, 
  CreditCard, 
  Calendar, 
  PlayCircle, 
  TrendingUp,
  BarChart3,
  Activity
} from "lucide-react";

interface Stats {
  totalUsers: number;
  activeSubscribers: number;
  totalSessions: number;
  totalRecordings: number;
  newUsersThisWeek: number;
  upcomingSessions: number;
}

export default function AdminAnalyticsPage() {
  const { data: stats, isLoading } = useSWR<Stats>("/api/stats", fetcher);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pastel-blue-border" />
      </div>
    );
  }

  const metrics = [
    { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "bg-blue-50 text-blue-600", change: `+${stats?.newUsersThisWeek || 0} this week` },
    { label: "Active Subscribers", value: stats?.activeSubscribers || 0, icon: CreditCard, color: "bg-pastel-blue text-slate-700", change: "paying customers" },
    { label: "Total Sessions", value: stats?.totalSessions || 0, icon: Calendar, color: "bg-emerald-50 text-emerald-600", change: `${stats?.upcomingSessions || 0} upcoming` },
    { label: "Total Recordings", value: stats?.totalRecordings || 0, icon: PlayCircle, color: "bg-amber-50 text-amber-600", change: "in library" },
  ];

  const conversionRate = stats?.totalUsers
    ? Math.round((stats.activeSubscribers / stats.totalUsers) * 100)
    : 0;

  return (
    <div className="space-y-6 sm:space-y-10 pb-10">
      <div>
        <Badge variant="primary" className="mb-4 bg-pastel-blue border-pastel-blue-border text-[10px] uppercase tracking-[0.2em] font-bold">Business Intelligence</Badge>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tightest">Analytics</h1>
        <p className="text-slate-500 font-bold tracking-tightest mt-2">Platform metrics and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {metrics.map((metric) => (
          <Card key={metric.label} variant="bordered" className="p-4 sm:p-8 border-2 border-pastel-blue/10 bg-white/60 hover:border-pastel-blue-border/40 transition-all duration-500 shadow-sm group">
            <div className={`w-10 h-10 sm:w-14 sm:h-14 ${metric.color} rounded-xl sm:rounded-[1.25rem] flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-500 border border-current/10`}>
              <metric.icon className="w-5 h-5 sm:w-7 sm:h-7" />
            </div>
            <div className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tightest mb-1">{metric.value}</div>
            <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">{metric.label}</div>
            <div className="text-[10px] sm:text-xs text-pastel-blue-border font-bold mt-2">{metric.change}</div>
          </Card>
        ))}
      </div>

      {/* Conversion */}
      <Card variant="bordered" className="p-6 sm:p-10 border-4 border-pastel-blue/10 bg-white/60">
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="p-2 sm:p-3 bg-pastel-blue rounded-xl border-2 border-pastel-blue-border/20">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tightest">Conversion Rate</h2>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex-1 h-4 sm:h-6 bg-pastel-blue/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-pastel-blue-border rounded-full transition-all duration-1000"
              style={{ width: `${conversionRate}%` }}
            />
          </div>
          <span className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tightest">{conversionRate}%</span>
        </div>
        <p className="text-sm text-slate-500 mt-4 font-bold tracking-tightest">
          {stats?.activeSubscribers || 0} of {stats?.totalUsers || 0} users have active subscriptions
        </p>
      </Card>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-2 gap-6 sm:gap-10">
        <Card variant="bordered" className="p-6 sm:p-10 border-4 border-pastel-blue/10 bg-white/60">
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="p-2 sm:p-3 bg-blue-50 rounded-xl border-2 border-blue-100">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tightest">Content Overview</h2>
          </div>
          <div className="space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between p-3 sm:p-4 bg-white/60 rounded-xl border border-pastel-blue/10">
              <span className="text-slate-600 font-bold tracking-tightest text-sm sm:text-base">Total Sessions</span>
              <span className="font-bold text-slate-900 text-lg sm:text-xl">{stats?.totalSessions || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 sm:p-4 bg-white/60 rounded-xl border border-pastel-blue/10">
              <span className="text-slate-600 font-bold tracking-tightest text-sm sm:text-base">Total Recordings</span>
              <span className="font-bold text-slate-900 text-lg sm:text-xl">{stats?.totalRecordings || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 sm:p-4 bg-white/60 rounded-xl border border-pastel-blue/10">
              <span className="text-slate-600 font-bold tracking-tightest text-sm sm:text-base">Upcoming Sessions</span>
              <span className="font-bold text-pastel-blue-border text-lg sm:text-xl">{stats?.upcomingSessions || 0}</span>
            </div>
          </div>
        </Card>

        <Card variant="bordered" className="p-6 sm:p-10 border-4 border-pastel-blue/10 bg-white/60">
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="p-2 sm:p-3 bg-emerald-50 rounded-xl border-2 border-emerald-100">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tightest">User Growth</h2>
          </div>
          <div className="space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between p-3 sm:p-4 bg-white/60 rounded-xl border border-pastel-blue/10">
              <span className="text-slate-600 font-bold tracking-tightest text-sm sm:text-base">Total Users</span>
              <span className="font-bold text-slate-900 text-lg sm:text-xl">{stats?.totalUsers || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 sm:p-4 bg-white/60 rounded-xl border border-pastel-blue/10">
              <span className="text-slate-600 font-bold tracking-tightest text-sm sm:text-base">New This Week</span>
              <span className="font-bold text-emerald-600 text-lg sm:text-xl">+{stats?.newUsersThisWeek || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 sm:p-4 bg-white/60 rounded-xl border border-pastel-blue/10">
              <span className="text-slate-600 font-bold tracking-tightest text-sm sm:text-base">Active Subscribers</span>
              <span className="font-bold text-slate-900 text-lg sm:text-xl">{stats?.activeSubscribers || 0}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
