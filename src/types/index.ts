// Enums (using string literals since SQLite doesn't support enums)
export type Role = "STUDENT" | "TEACHER" | "ADMIN";
export type Subject = "MATHS" | "ENGLISH";
export type YearGroup = "KS3" | "KS4" | "GCSE" | "A_LEVEL";
export type SubscriptionStatus = "ACTIVE" | "CANCELLED" | "EXPIRED" | "PAST_DUE";
export type SubscriptionTier = "BASIC" | "PREMIUM";

// Extend next-auth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: Role;
      avatar?: string | null;
      isActive: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    avatar?: string | null;
    isActive: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    avatar?: string | null;
    isActive: boolean;
  }
}

// Navigation types
export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavItem[];
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Session/Class types for the app
export interface SessionWithDetails {
  id: string;
  title: string;
  description: string | null;
  subject: Subject;
  yearGroup: YearGroup;
  scheduledAt: Date;
  duration: number;
  meetingLink: string | null;
  isLive: boolean;
  isCancelled: boolean;
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
  recording?: {
    id: string;
    title: string;
    videoUrl: string;
  } | null;
}

export interface RecordingWithDetails {
  id: string;
  title: string;
  description: string | null;
  subject: Subject;
  yearGroup: YearGroup;
  videoUrl: string;
  thumbnailUrl: string | null;
  duration: number | null;
  viewCount: number;
  isPublished: boolean;
  createdAt: Date;
  uploader: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
}

// Dashboard stats
export interface AdminStats {
  totalUsers: number;
  activeSubscribers: number;
  totalSessions: number;
  totalRecordings: number;
  recentActivity: {
    newUsersThisWeek: number;
    sessionsThisWeek: number;
    recordingViewsThisWeek: number;
  };
}

export interface TeacherStats {
  upcomingSessions: number;
  totalRecordings: number;
  totalViews: number;
}

export interface StudentStats {
  subscriptionStatus: SubscriptionStatus | null;
  upcomingSessions: number;
  watchedRecordings: number;
}
