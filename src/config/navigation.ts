import { NavSection } from "@/types";
import {
  LayoutDashboard,
  Calendar,
  Video,
  PlayCircle,
  Users,
  Settings,
  BarChart3,
  BookOpen,
  CreditCard,
  UserCircle,
  Upload,
  FileVideo,
  GraduationCap,
  ClipboardList,
} from "lucide-react";

// Student navigation
export const studentNavigation: NavSection[] = [
  {
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Learning",
    items: [
      {
        title: "Timetable",
        href: "/dashboard/timetable",
        icon: Calendar,
      },
      {
        title: "Live Classes",
        href: "/dashboard/live-classes",
        icon: Video,
      },
      {
        title: "Recordings",
        href: "/dashboard/recordings",
        icon: PlayCircle,
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        title: "Subscription",
        href: "/dashboard/subscription",
        icon: CreditCard,
      },
      {
        title: "Profile",
        href: "/dashboard/profile",
        icon: UserCircle,
      },
    ],
  },
];

// Teacher navigation
export const teacherNavigation: NavSection[] = [
  {
    items: [
      {
        title: "Dashboard",
        href: "/teacher",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Classes",
    items: [
      {
        title: "My Schedule",
        href: "/teacher/schedule",
        icon: Calendar,
      },
      {
        title: "Upcoming Sessions",
        href: "/teacher/sessions",
        icon: Video,
      },
    ],
  },
  {
    title: "Content",
    items: [
      {
        title: "My Recordings",
        href: "/teacher/recordings",
        icon: FileVideo,
      },
      {
        title: "Upload Recording",
        href: "/teacher/upload",
        icon: Upload,
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        title: "Profile",
        href: "/teacher/profile",
        icon: UserCircle,
      },
    ],
  },
];

// Admin navigation
export const adminNavigation: NavSection[] = [
  {
    items: [
      {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        title: "Users",
        href: "/admin/users",
        icon: Users,
      },
      {
        title: "Sessions",
        href: "/admin/sessions",
        icon: Calendar,
      },
      {
        title: "Recordings",
        href: "/admin/recordings",
        icon: PlayCircle,
      },
      {
        title: "Add Recording",
        href: "/admin/recordings/new",
        icon: Upload,
      },
    ],
  },
  {
    title: "Content",
    items: [
      {
        title: "Subjects",
        href: "/admin/subjects",
        icon: BookOpen,
      },
      {
        title: "Year Groups",
        href: "/admin/year-groups",
        icon: GraduationCap,
      },
      {
        title: "Pricing Plans",
        href: "/admin/pricing",
        icon: CreditCard,
      },
    ],
  },
  {
    title: "Insights",
    items: [
      {
        title: "Analytics",
        href: "/admin/analytics",
        icon: BarChart3,
      },
      {
        title: "Activity Log",
        href: "/admin/activity",
        icon: ClipboardList,
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings,
      },
      {
        title: "Profile",
        href: "/admin/profile",
        icon: UserCircle,
      },
    ],
  },
];

