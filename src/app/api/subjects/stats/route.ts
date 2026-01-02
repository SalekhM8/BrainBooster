import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [mathsSessions, mathsRecordings, englishSessions, englishRecordings] = await Promise.all([
      db.session.count({ where: { subject: "MATHS" } }),
      db.recording.count({ where: { subject: "MATHS" } }),
      db.session.count({ where: { subject: "ENGLISH" } }),
      db.recording.count({ where: { subject: "ENGLISH" } }),
    ]);

    return NextResponse.json({
      mathsSessions,
      mathsRecordings,
      englishSessions,
      englishRecordings,
    });
  } catch (error) {
    console.error("Error fetching subject stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}

