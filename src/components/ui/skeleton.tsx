"use client";

import { memo } from "react";

interface SkeletonProps {
  className?: string;
}

export const Skeleton = memo(function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-slate-200 rounded ${className}`}
      aria-hidden="true"
    />
  );
});

// Table skeleton for list pages
export const TableSkeleton = memo(function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex gap-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-16 ml-auto" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="px-4 py-4 flex gap-4 items-center border-b border-slate-100 last:border-0"
        >
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-14 rounded" />
            <Skeleton className="h-8 w-14 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
});

// Card grid skeleton
export const CardGridSkeleton = memo(function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border border-slate-200 overflow-hidden">
          <Skeleton className="aspect-video w-full" />
          <div className="p-4 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-9 w-full rounded" />
          </div>
        </div>
      ))}
    </div>
  );
});

// Stats skeleton
export const StatsSkeleton = memo(function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border border-slate-200 p-4">
          <Skeleton className="h-8 w-8 mb-2 rounded" />
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
});

// Dashboard skeleton
export const DashboardSkeleton = memo(function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-xl p-6">
        <Skeleton className="h-5 w-32 bg-slate-700 mb-3" />
        <Skeleton className="h-8 w-64 bg-slate-700 mb-2" />
        <Skeleton className="h-4 w-48 bg-slate-700" />
      </div>
      <StatsSkeleton />
      <div className="rounded-lg border border-slate-200 p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
});

