import { db } from "@/lib/db";

type NotificationType = "SESSION_REMINDER" | "NEW_RECORDING" | "SUBSCRIPTION" | "SYSTEM";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  return db.notification.create({
    data: params,
  });
}

export async function notifyAllStudents(
  type: NotificationType,
  title: string,
  message: string,
  link?: string,
  filters?: { subjects?: string[]; yearGroup?: string }
) {
  // Get all active students
  const students = await db.user.findMany({
    where: {
      role: "STUDENT",
      isActive: true,
      ...(filters?.yearGroup ? { yearGroup: filters.yearGroup } : {}),
    },
    select: { id: true, subjects: true },
  });

  // Filter by subjects if needed
  const filteredStudents = filters?.subjects
    ? students.filter((s) => {
        if (!s.subjects) return false;
        const userSubjects = JSON.parse(s.subjects);
        return filters.subjects!.some((sub) => userSubjects.includes(sub));
      })
    : students;

  // Create notifications for all matching students
  const notifications = filteredStudents.map((student) => ({
    userId: student.id,
    type,
    title,
    message,
    link,
  }));

  if (notifications.length > 0) {
    await db.notification.createMany({ data: notifications });
  }

  return notifications.length;
}

export async function notifyNewSession(session: {
  id: string;
  title: string;
  subject: string;
  yearGroup: string;
  scheduledAt: Date;
}) {
  const date = new Date(session.scheduledAt).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  return notifyAllStudents(
    "SESSION_REMINDER",
    `New Class: ${session.title}`,
    `A new ${session.subject} class has been scheduled for ${date}`,
    `/dashboard/live-classes`,
    { subjects: [session.subject], yearGroup: session.yearGroup }
  );
}

export async function notifyNewRecording(recording: {
  id: string;
  title: string;
  subject: string;
  yearGroup: string;
}) {
  return notifyAllStudents(
    "NEW_RECORDING",
    `New Recording: ${recording.title}`,
    `A new ${recording.subject} recording is now available`,
    `/dashboard/recordings`,
    { subjects: [recording.subject], yearGroup: recording.yearGroup }
  );
}

