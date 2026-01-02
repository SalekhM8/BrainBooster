"use client";

import { useSession } from "next-auth/react";
import { Avatar } from "@/components/ui/avatar";
import { NotificationsDropdown } from "./notifications-dropdown";
import { SearchDropdown } from "./search-dropdown";

interface DashboardHeaderProps {
  title?: string;
}

export function DashboardHeader({ title }: DashboardHeaderProps) {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="h-14 sm:h-16 lg:h-20 px-4 pl-14 sm:pl-6 lg:pl-10 sm:px-6 lg:px-10 bg-pastel-blue/60 backdrop-blur-xl border-b-2 border-pastel-blue-border/20 flex items-center justify-between relative z-10">
      {/* Left side - Title */}
      <div className="flex flex-col">
        {title && (
          <>
            <h1 className="text-base sm:text-lg lg:text-2xl font-bold text-pastel-blue-border tracking-tightest leading-none mb-0.5">{title}</h1>
            <p className="text-[8px] sm:text-[9px] lg:text-[10px] font-bold text-pastel-blue-border/60 uppercase tracking-[0.2em] hidden sm:block">Learning Workspace</p>
          </>
        )}
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
        {/* Search & Notifications */}
        <div className="flex items-center gap-2 sm:gap-3">
          <SearchDropdown />
          <NotificationsDropdown />
        </div>
        
        {/* User info - hidden on mobile, shown on tablet+ */}
        <div className="hidden sm:flex items-center gap-3 pl-2 group cursor-pointer">
          <div className="h-8 w-[1px] bg-pastel-blue-border/30 rounded-full" />
          <div className="text-right hidden md:block">
            <p className="text-xs sm:text-sm font-bold text-pastel-blue-border tracking-tightest leading-none mb-0.5 group-hover:text-pastel-blue-text transition-colors">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[8px] sm:text-[10px] font-bold text-pastel-blue-border/60 uppercase tracking-widest">{user?.role}</p>
          </div>
          <Avatar
            name={user ? `${user.firstName} ${user.lastName}` : "User"}
            size="sm"
            className="ring-2 sm:ring-4 ring-pastel-blue-border/30 border-2 border-pastel-cream group-hover:scale-105 transition-transform duration-300 w-8 h-8 sm:w-10 sm:h-10"
          />
        </div>
      </div>
    </header>
  );
}
