"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { adminNavigation } from "@/config/navigation";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function AdminDashboardLayout({
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

  // Redirect if not an admin
  if (session.user.role !== "ADMIN") {
    if (session.user.role === "STUDENT") {
      redirect("/dashboard");
    } else if (session.user.role === "TEACHER") {
      redirect("/teacher");
    }
  }

  return (
    <div className="flex h-screen bg-pastel-blue" suppressHydrationWarning>
      <Sidebar sections={adminNavigation} />
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 bg-pastel-blue/50">
          {children}
        </main>
      </div>
    </div>
  );
}
