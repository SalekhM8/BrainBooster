import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency for display (GBP)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount / 100);
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
  }).format(new Date(date));
}

/**
 * Format time for display
 */
export function formatTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeStyle: "short",
  }).format(new Date(date));
}

/**
 * Format date and time for display
 */
export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Format duration from seconds to human readable
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return formatDate(date);
}

/**
 * Subject display names
 */
export const SUBJECT_LABELS: Record<string, string> = {
  MATHS: "Mathematics",
  ENGLISH: "English",
};

/**
 * Year group display names
 */
export const YEAR_GROUP_LABELS: Record<string, string> = {
  KS3: "Key Stage 3",
  KS4: "Key Stage 4",
  GCSE: "GCSE",
  A_LEVEL: "A-Level",
};

/**
 * Subscription status display
 */
export const SUBSCRIPTION_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Active", color: "text-success-500" },
  CANCELLED: { label: "Cancelled", color: "text-warning-500" },
  EXPIRED: { label: "Expired", color: "text-error-500" },
  PAST_DUE: { label: "Past Due", color: "text-warning-500" },
};

