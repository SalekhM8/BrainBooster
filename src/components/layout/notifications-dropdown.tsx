"use client";

import { useState, useRef, useCallback, memo } from "react";
import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Bell, Calendar, Film, CreditCard } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsData {
  notifications: Notification[];
  unreadCount: number;
}

// Memoized notification content
const NotificationContent = memo(function NotificationContent({ 
  notification, 
}: { 
  notification: Notification; 
}) {
  const getIcon = (type: string) => {
    switch (type) {
      case "SESSION_REMINDER":
        return <Calendar className="w-5 h-5 text-pastel-blue-border" />;
      case "NEW_RECORDING":
        return <Film className="w-5 h-5 text-emerald-500" />;
      case "SUBSCRIPTION":
        return <CreditCard className="w-5 h-5 text-amber-500" />;
      default:
        return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="flex gap-3">
      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
        {getIcon(notification.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-900 truncate tracking-tightest">{notification.title}</p>
        <p className="text-xs text-slate-500 line-clamp-2 tracking-tightest">{notification.message}</p>
        <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-widest">{getTimeAgo(notification.createdAt)}</p>
      </div>
      {!notification.isRead && (
        <span className="w-2.5 h-2.5 bg-pastel-blue-border rounded-full mt-1.5 ring-4 ring-pastel-blue/20" />
      )}
    </div>
  );
});

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Use SWR for automatic caching and deduplication
  const { data, mutate } = useSWR<NotificationsData>(
    "/api/notifications?limit=10",
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute when visible
      revalidateOnFocus: true, // Revalidate when user returns
    }
  );

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  // Handle click outside
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  // Set up click outside listener
  useState(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  });

  const markAllRead = async () => {
    setIsMarking(true);
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      // Optimistically update cache
      mutate({
        notifications: notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0,
      }, false);
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    }
    setIsMarking(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-pastel-blue/30 transition-all duration-200"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-pastel-blue-border rounded-full text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border-2 border-pastel-blue-border/20 z-50 overflow-hidden">
          <div className="p-4 border-b-2 border-pastel-blue/10 flex items-center justify-between bg-pastel-blue/5">
            <h3 className="font-bold text-slate-900 tracking-tightest">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                disabled={isMarking}
                className="text-xs font-bold text-pastel-blue-border hover:text-slate-900 transition-colors disabled:opacity-50"
              >
                Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-bold tracking-tightest">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-pastel-blue/5 last:border-0 hover:bg-pastel-blue/10 transition-colors ${
                    !notification.isRead ? "bg-pastel-blue/5" : ""
                  }`}
                >
                  {notification.link ? (
                    <Link href={notification.link} onClick={() => setIsOpen(false)}>
                      <NotificationContent notification={notification} />
                    </Link>
                  ) : (
                    <NotificationContent notification={notification} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
