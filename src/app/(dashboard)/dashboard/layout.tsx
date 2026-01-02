"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { studentNavigation } from "@/config/navigation";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-pastel-blue" suppressHydrationWarning>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pastel-blue-border"></div>
      </div>
    );
  }

  if (!session) {
    redirect("/auth/login");
  }

  // Redirect if not a student
  if (session.user.role !== "STUDENT") {
    if (session.user.role === "TEACHER") {
      redirect("/teacher");
    } else if (session.user.role === "ADMIN") {
      redirect("/admin");
    }
  }

  return (
    <div className="flex h-screen bg-pastel-blue" suppressHydrationWarning>
      <Sidebar sections={studentNavigation} />
      {/* Main content - full width on mobile, beside sidebar on desktop */}
      <div className="flex-1 flex flex-col overflow-hidden w-full lg:w-auto">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 pt-16 sm:p-6 sm:pt-6 lg:p-10 bg-pastel-blue/50">
          {children}
        </main>
      </div>
    </div>
  );
}
