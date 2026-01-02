import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";

function generateId(): string {
  return 'c' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

async function main() {
  console.log("🌱 Seeding Turso database...");
  
  const url = process.env.DATABASE_URL;
  const authToken = process.env.DATABASE_AUTH_TOKEN;
  
  if (!url || !authToken) {
    throw new Error("DATABASE_URL and DATABASE_AUTH_TOKEN are required");
  }
  
  console.log("📡 Connecting to Turso:", url);
  
  const client = createClient({ url, authToken });
  const now = new Date().toISOString();

  console.log("🗑️  Clearing existing data...");
  await client.execute("DELETE FROM Notification");
  await client.execute("DELETE FROM PasswordResetToken");
  await client.execute("DELETE FROM RecordingView");
  await client.execute("DELETE FROM Recording");
  await client.execute("DELETE FROM Session");
  await client.execute("DELETE FROM Subscription");
  await client.execute("DELETE FROM PricingPlan");
  await client.execute("DELETE FROM User");
  console.log("✅ Database cleared");

  // Hash passwords
  const adminPassword = await bcrypt.hash("admin123", 12);
  const teacherPassword = await bcrypt.hash("teacher123", 12);
  const studentPassword = await bcrypt.hash("student123", 12);

  // ==================== ADMIN ====================
  const adminId = generateId();
  await client.execute({
    sql: `INSERT INTO User (id, email, password, firstName, lastName, role, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`,
    args: [adminId, "admin@brainbooster.com", adminPassword, "Salekh", "Mahmood", "ADMIN", now, now]
  });
  console.log("✅ Admin created: admin@brainbooster.com");

  // ==================== TEACHERS ====================
  const teacher1Id = generateId();
  const teacher2Id = generateId();
  const teacher3Id = generateId();
  
  await client.execute({
    sql: `INSERT INTO User (id, email, password, firstName, lastName, role, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`,
    args: [teacher1Id, "yusuf.hussain@brainbooster.com", teacherPassword, "Yusuf", "Hussain", "TEACHER", now, now]
  });
  await client.execute({
    sql: `INSERT INTO User (id, email, password, firstName, lastName, role, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`,
    args: [teacher2Id, "fatima.khan@brainbooster.com", teacherPassword, "Fatima", "Khan", "TEACHER", now, now]
  });
  await client.execute({
    sql: `INSERT INTO User (id, email, password, firstName, lastName, role, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`,
    args: [teacher3Id, "omar.ahmed@brainbooster.com", teacherPassword, "Omar", "Ahmed", "TEACHER", now, now]
  });
  console.log("✅ 3 Teachers created");

  // ==================== STUDENTS ====================
  const students = [
    { firstName: "Suhayb", lastName: "Mahmood", email: "suhayb.mahmood@student.com", yearGroup: "GCSE", subjects: '["MATHS","ENGLISH"]', tier: "PREMIUM" },
    { firstName: "Aisha", lastName: "Rahman", email: "aisha.rahman@student.com", yearGroup: "GCSE", subjects: '["MATHS"]', tier: "BASIC" },
    { firstName: "Ibrahim", lastName: "Ali", email: "ibrahim.ali@student.com", yearGroup: "A_LEVEL", subjects: '["MATHS","ENGLISH"]', tier: "PREMIUM" },
    { firstName: "Maryam", lastName: "Hassan", email: "maryam.hassan@student.com", yearGroup: "KS4", subjects: '["ENGLISH"]', tier: "BASIC" },
    { firstName: "Zakariya", lastName: "Patel", email: "zakariya.patel@student.com", yearGroup: "GCSE", subjects: '["MATHS","ENGLISH"]', tier: "PREMIUM" },
  ];

  for (const s of students) {
    const studentId = generateId();
    const subId = generateId();
    const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    await client.execute({
      sql: `INSERT INTO User (id, email, password, firstName, lastName, role, subjects, yearGroup, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, 'STUDENT', ?, ?, 1, ?, ?)`,
      args: [studentId, s.email, studentPassword, s.firstName, s.lastName, s.subjects, s.yearGroup, now, now]
    });
    
    await client.execute({
      sql: `INSERT INTO Subscription (id, userId, tier, status, homeworkSiteAccess, currentPeriodStart, currentPeriodEnd, createdAt, updatedAt) VALUES (?, ?, ?, 'ACTIVE', ?, ?, ?, ?, ?)`,
      args: [subId, studentId, s.tier, s.tier === "PREMIUM" ? 1 : 0, now, periodEnd, now, now]
    });
  }
  console.log(`✅ ${students.length} Students created`);

  // ==================== SESSIONS ====================
  const sessionData = [
    { title: "Algebra Fundamentals", subject: "MATHS", yearGroup: "GCSE", teacherId: teacher1Id, daysFromNow: 1 },
    { title: "Quadratic Equations", subject: "MATHS", yearGroup: "GCSE", teacherId: teacher1Id, daysFromNow: 2 },
    { title: "Essay Writing Techniques", subject: "ENGLISH", yearGroup: "GCSE", teacherId: teacher2Id, daysFromNow: 1 },
    { title: "Shakespeare: Macbeth", subject: "ENGLISH", yearGroup: "GCSE", teacherId: teacher2Id, daysFromNow: 3 },
    { title: "Calculus Introduction", subject: "MATHS", yearGroup: "A_LEVEL", teacherId: teacher3Id, daysFromNow: 2 },
  ];

  for (const s of sessionData) {
    const sessionId = generateId();
    const scheduledAt = new Date(Date.now() + s.daysFromNow * 24 * 60 * 60 * 1000);
    scheduledAt.setHours(16, 0, 0, 0);
    
    await client.execute({
      sql: `INSERT INTO Session (id, title, description, subject, yearGroup, scheduledAt, duration, meetingLink, isLive, isCancelled, teacherId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, 60, ?, 0, 0, ?, ?, ?)`,
      args: [sessionId, s.title, `Learn ${s.title.toLowerCase()} with expert guidance.`, s.subject, s.yearGroup, scheduledAt.toISOString(), `https://zoom.us/j/${Math.random().toString(36).substring(7)}`, s.teacherId, now, now]
    });
  }
  console.log(`✅ ${sessionData.length} Sessions created`);

  // ==================== RECORDINGS ====================
  const recordingData = [
    { title: "Quadratic Equations Guide", subject: "MATHS", yearGroup: "GCSE", teacherId: teacher1Id, duration: 2700 },
    { title: "Pythagoras Theorem", subject: "MATHS", yearGroup: "KS4", teacherId: teacher1Id, duration: 1800 },
    { title: "Circle Theorems", subject: "MATHS", yearGroup: "GCSE", teacherId: teacher1Id, duration: 2400 },
    { title: "Shakespeare Analysis", subject: "ENGLISH", yearGroup: "GCSE", teacherId: teacher2Id, duration: 3120 },
    { title: "Essay Structure", subject: "ENGLISH", yearGroup: "GCSE", teacherId: teacher2Id, duration: 2400 },
    { title: "Differentiation Basics", subject: "MATHS", yearGroup: "A_LEVEL", teacherId: teacher3Id, duration: 3000 },
  ];

  for (const r of recordingData) {
    const recordingId = generateId();
    await client.execute({
      sql: `INSERT INTO Recording (id, title, description, subject, yearGroup, videoUrl, duration, teacherId, viewCount, isPublished, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 1, ?, ?)`,
      args: [recordingId, r.title, `Complete guide to ${r.title.toLowerCase()}.`, r.subject, r.yearGroup, "https://www.youtube.com/watch?v=dQw4w9WgXcQ", r.duration, r.teacherId, now, now]
    });
  }
  console.log(`✅ ${recordingData.length} Recordings created`);

  // ==================== PRICING PLANS ====================
  await client.execute({
    sql: `INSERT INTO PricingPlan (id, name, description, tier, priceMonthly, priceYearly, features, subjects, isPopular, isActive, sortOrder, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 1, 1, ?, ?)`,
    args: [generateId(), "Basic", "Perfect for getting started", "BASIC", 4900, 49000, '["Access to live classes","Full recording library","Timetable & scheduling","Email support"]', '["MATHS","ENGLISH"]', now, now]
  });
  await client.execute({
    sql: `INSERT INTO PricingPlan (id, name, description, tier, priceMonthly, priceYearly, features, subjects, isPopular, isActive, sortOrder, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 2, ?, ?)`,
    args: [generateId(), "Premium", "Everything for exam success", "PREMIUM", 7900, 79000, '["Everything in Basic","Homework portal access","Priority support","Study materials"]', '["MATHS","ENGLISH"]', now, now]
  });
  console.log("✅ Pricing plans created");

  // ==================== SUMMARY ====================
  console.log("\n🎉 Turso database seeded successfully!\n");
  console.log("═══════════════════════════════════════════════════");
  console.log("                    TEST ACCOUNTS                   ");
  console.log("═══════════════════════════════════════════════════");
  console.log("\n👨‍💼 ADMIN:");
  console.log("   Email:    admin@brainbooster.com");
  console.log("   Password: admin123");
  console.log("   Name:     Salekh Mahmood");
  console.log("\n👩‍🏫 TEACHERS:");
  console.log("   Email:    yusuf.hussain@brainbooster.com");
  console.log("   Password: teacher123");
  console.log("");
  console.log("   Email:    fatima.khan@brainbooster.com");
  console.log("   Password: teacher123");
  console.log("");
  console.log("   Email:    omar.ahmed@brainbooster.com");
  console.log("   Password: teacher123");
  console.log("\n👨‍🎓 STUDENTS:");
  console.log("   Email:    suhayb.mahmood@student.com (Premium)");
  console.log("   Password: student123");
  console.log("");
  console.log("   Email:    aisha.rahman@student.com (Basic)");
  console.log("   Password: student123");
  console.log("\n═══════════════════════════════════════════════════");

  client.close();
}

main().catch((e) => {
  console.error("❌ Seed error:", e);
  process.exit(1);
});
