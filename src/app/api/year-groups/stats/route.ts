import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [ks3, ks4, gcse, aLevel] = await Promise.all([
      db.user.count({ where: { yearGroup: "KS3", role: "STUDENT" } }),
      db.user.count({ where: { yearGroup: "KS4", role: "STUDENT" } }),
      db.user.count({ where: { yearGroup: "GCSE", role: "STUDENT" } }),
      db.user.count({ where: { yearGroup: "A_LEVEL", role: "STUDENT" } }),
    ]);

    return NextResponse.json({
      KS3: ks3,
      KS4: ks4,
      GCSE: gcse,
      A_LEVEL: aLevel,
    });
  } catch (error) {
    console.error("Error fetching year group stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}

