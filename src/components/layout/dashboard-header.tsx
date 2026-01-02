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
    <header className="h-16 sm:h-20 lg:h-24 px-4 sm:px-6 lg:px-10 bg-pastel-blue/60 backdrop-blur-xl border-b-2 border-pastel-blue-border/20 flex items-center justify-between relative z-10">
      {/* Left side - Title (hidden on mobile to make room for burger menu) */}
      <div className="flex flex-col pl-10 lg:pl-0">
        {title && (
          <>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-pastel-blue-border tracking-tightest leading-none mb-0.5 sm:mb-1">{title}</h1>
            <p className="text-[8px] sm:text-[9px] lg:text-[10px] font-bold text-pastel-blue-border/60 uppercase tracking-[0.2em] hidden sm:block">Learning Workspace</p>
          </>
        )}
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2 sm:gap-4 lg:gap-8">
        {/* Search & Notifications - with proper spacing */}
        <div className="flex items-center gap-3 sm:gap-4">
          <SearchDropdown />
          <div className="w-px h-6 bg-pastel-blue-border/20 hidden sm:block" />
          <NotificationsDropdown />
        </div>
        
        {/* Divider - hidden on small mobile */}
        <div className="h-8 sm:h-10 w-[1px] sm:w-[2px] bg-pastel-blue-border/30 rounded-full hidden sm:block" />
        
        {/* User info */}
        <div className="flex items-center gap-2 sm:gap-4 pl-0 sm:pl-2 group cursor-pointer">
          {/* User text - hidden on mobile */}
          <div className="text-right hidden md:block">
            <p className="text-xs sm:text-sm font-bold text-pastel-blue-border tracking-tightest leading-none mb-0.5 sm:mb-1 group-hover:text-pastel-blue-text transition-colors">
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
