import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");
  console.log("🗑️  Clearing existing data...");

  // Clear existing data in correct order (respecting foreign keys)
  await prisma.notification.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.recordingView.deleteMany();
  await prisma.recording.deleteMany();
  await prisma.session.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.pricingPlan.deleteMany();
  await prisma.user.deleteMany();

  console.log("✅ Database cleared");

  // Hash passwords
  const adminPassword = await bcrypt.hash("admin123", 12);
  const teacherPassword = await bcrypt.hash("teacher123", 12);
  const studentPassword = await bcrypt.hash("student123", 12);

  // ==================== ADMIN ====================
  const admin = await prisma.user.create({
    data: {
      email: "admin@brainbooster.com",
      password: adminPassword,
      firstName: "Salekh",
      lastName: "Mahmood",
      role: "ADMIN",
      isActive: true,
    },
  });
  console.log("✅ Admin created:", admin.email);

  // ==================== TEACHERS ====================
  const teachers = await Promise.all([
    prisma.user.create({
      data: {
        email: "yusuf.hussain@brainbooster.com",
        password: teacherPassword,
        firstName: "Yusuf",
        lastName: "Hussain",
        role: "TEACHER",
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "fatima.khan@brainbooster.com",
        password: teacherPassword,
        firstName: "Fatima",
        lastName: "Khan",
        role: "TEACHER",
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "omar.ahmed@brainbooster.com",
        password: teacherPassword,
        firstName: "Omar",
        lastName: "Ahmed",
        role: "TEACHER",
        isActive: true,
      },
    }),
  ]);
  console.log(`✅ ${teachers.length} Teachers created`);

  // ==================== STUDENTS ====================
  const studentData = [
    { firstName: "Suhayb", lastName: "Mahmood", email: "suhayb.mahmood@student.com", yearGroup: "GCSE", subjects: ["MATHS", "ENGLISH"], tier: "PREMIUM" },
    { firstName: "Aisha", lastName: "Rahman", email: "aisha.rahman@student.com", yearGroup: "GCSE", subjects: ["MATHS"], tier: "BASIC" },
    { firstName: "Ibrahim", lastName: "Ali", email: "ibrahim.ali@student.com", yearGroup: "A_LEVEL", subjects: ["MATHS", "ENGLISH"], tier: "PREMIUM" },
    { firstName: "Maryam", lastName: "Hassan", email: "maryam.hassan@student.com", yearGroup: "KS4", subjects: ["ENGLISH"], tier: "BASIC" },
    { firstName: "Zakariya", lastName: "Patel", email: "zakariya.patel@student.com", yearGroup: "GCSE", subjects: ["MATHS", "ENGLISH"], tier: "PREMIUM" },
    { firstName: "Khadija", lastName: "Mohammed", email: "khadija.mohammed@student.com", yearGroup: "KS3", subjects: ["MATHS"], tier: "BASIC" },
    { firstName: "Hamza", lastName: "Qureshi", email: "hamza.qureshi@student.com", yearGroup: "GCSE", subjects: ["ENGLISH"], tier: "BASIC" },
    { firstName: "Zainab", lastName: "Chaudhry", email: "zainab.chaudhry@student.com", yearGroup: "A_LEVEL", subjects: ["MATHS"], tier: "PREMIUM" },
    { firstName: "Bilal", lastName: "Siddiqui", email: "bilal.siddiqui@student.com", yearGroup: "GCSE", subjects: ["MATHS", "ENGLISH"], tier: "PREMIUM" },
    { firstName: "Amina", lastName: "Malik", email: "amina.malik@student.com", yearGroup: "KS4", subjects: ["MATHS"], tier: "BASIC" },
  ];

  const students = await Promise.all(
    studentData.map((s) =>
      prisma.user.create({
        data: {
          email: s.email,
          password: studentPassword,
          firstName: s.firstName,
          lastName: s.lastName,
          role: "STUDENT",
          subjects: JSON.stringify(s.subjects),
          yearGroup: s.yearGroup,
          isActive: true,
          subscription: {
            create: {
              tier: s.tier,
              status: "ACTIVE",
              homeworkSiteAccess: s.tier === "PREMIUM",
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          },
        },
      })
    )
  );
  console.log(`✅ ${students.length} Students created`);

  // ==================== SESSIONS ====================
  const now = new Date();
  const sessionData = [
    // Upcoming sessions
    { title: "Algebra Fundamentals", subject: "MATHS", yearGroup: "GCSE", teacher: teachers[0], daysFromNow: 1, hour: 16 },
    { title: "Quadratic Equations", subject: "MATHS", yearGroup: "GCSE", teacher: teachers[0], daysFromNow: 2, hour: 17 },
    { title: "Trigonometry Basics", subject: "MATHS", yearGroup: "A_LEVEL", teacher: teachers[0], daysFromNow: 3, hour: 15 },
    { title: "Essay Writing Techniques", subject: "ENGLISH", yearGroup: "GCSE", teacher: teachers[1], daysFromNow: 1, hour: 14 },
    { title: "Shakespeare: Macbeth Analysis", subject: "ENGLISH", yearGroup: "GCSE", teacher: teachers[1], daysFromNow: 2, hour: 15 },
    { title: "Poetry Analysis", subject: "ENGLISH", yearGroup: "A_LEVEL", teacher: teachers[1], daysFromNow: 4, hour: 16 },
    { title: "Calculus Introduction", subject: "MATHS", yearGroup: "A_LEVEL", teacher: teachers[2], daysFromNow: 2, hour: 18 },
    { title: "Statistics & Probability", subject: "MATHS", yearGroup: "GCSE", teacher: teachers[2], daysFromNow: 3, hour: 16 },
    // Past sessions
    { title: "Basic Arithmetic Review", subject: "MATHS", yearGroup: "KS3", teacher: teachers[0], daysFromNow: -7, hour: 15 },
    { title: "Grammar Essentials", subject: "ENGLISH", yearGroup: "KS3", teacher: teachers[1], daysFromNow: -5, hour: 14 },
    { title: "Fractions & Decimals", subject: "MATHS", yearGroup: "KS4", teacher: teachers[0], daysFromNow: -3, hour: 16 },
    { title: "Creative Writing Workshop", subject: "ENGLISH", yearGroup: "GCSE", teacher: teachers[1], daysFromNow: -2, hour: 15 },
  ];

  const sessions = await Promise.all(
    sessionData.map((s) => {
      const scheduledAt = new Date(now);
      scheduledAt.setDate(scheduledAt.getDate() + s.daysFromNow);
      scheduledAt.setHours(s.hour, 0, 0, 0);

      return prisma.session.create({
        data: {
          title: s.title,
          description: `Learn ${s.title.toLowerCase()} with expert guidance.`,
          subject: s.subject,
          yearGroup: s.yearGroup,
          scheduledAt,
          duration: 60,
          meetingLink: `https://zoom.us/j/${Math.random().toString(36).substring(7)}`,
          teacherId: s.teacher.id,
          isLive: false,
          isCancelled: false,
        },
      });
    })
  );
  console.log(`✅ ${sessions.length} Sessions created`);

  // ==================== RECORDINGS ====================
  const recordingData = [
    { title: "Quadratic Equations - Complete Guide", subject: "MATHS", yearGroup: "GCSE", teacher: teachers[0], duration: 2700 },
    { title: "Solving Linear Equations", subject: "MATHS", yearGroup: "GCSE", teacher: teachers[0], duration: 2100 },
    { title: "Pythagoras Theorem Explained", subject: "MATHS", yearGroup: "KS4", teacher: teachers[0], duration: 1800 },
    { title: "Circle Theorems", subject: "MATHS", yearGroup: "GCSE", teacher: teachers[0], duration: 2400 },
    { title: "Differentiation Basics", subject: "MATHS", yearGroup: "A_LEVEL", teacher: teachers[2], duration: 3000 },
    { title: "Integration Methods", subject: "MATHS", yearGroup: "A_LEVEL", teacher: teachers[2], duration: 3300 },
    { title: "Shakespeare Analysis - Macbeth", subject: "ENGLISH", yearGroup: "GCSE", teacher: teachers[1], duration: 3120 },
    { title: "An Inspector Calls - Themes", subject: "ENGLISH", yearGroup: "GCSE", teacher: teachers[1], duration: 2700 },
    { title: "Essay Structure Masterclass", subject: "ENGLISH", yearGroup: "GCSE", teacher: teachers[1], duration: 2400 },
    { title: "Poetry Comparison Techniques", subject: "ENGLISH", yearGroup: "A_LEVEL", teacher: teachers[1], duration: 2100 },
    { title: "GCSE Maths Exam Tips", subject: "MATHS", yearGroup: "GCSE", teacher: teachers[0], duration: 1800 },
    { title: "English Language Paper 1 Guide", subject: "ENGLISH", yearGroup: "GCSE", teacher: teachers[1], duration: 2700 },
  ];

  const recordings = await Promise.all(
    recordingData.map((r) =>
      prisma.recording.create({
        data: {
          title: r.title,
          description: `Complete guide to ${r.title.toLowerCase()}.`,
          subject: r.subject,
          yearGroup: r.yearGroup,
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          thumbnailUrl: null,
          duration: r.duration,
          teacherId: r.teacher.id,
          viewCount: 0,
          isPublished: true,
        },
      })
    )
  );
  console.log(`✅ ${recordings.length} Recordings created`);

  // ==================== NOTIFICATIONS ====================
  await Promise.all(
    students.map((student) =>
      prisma.notification.create({
        data: {
          userId: student.id,
          type: "SYSTEM",
          title: "Welcome to BrainBooster! 🎉",
          message: "Your account is ready. Check out your timetable and start learning!",
          link: "/dashboard",
          isRead: false,
        },
      })
    )
  );
  console.log("✅ Notifications created");

  // ==================== PRICING PLANS ====================
  await prisma.pricingPlan.createMany({
    data: [
      {
        name: "Basic",
        description: "Perfect for getting started with online tuition",
        tier: "BASIC",
        priceMonthly: 4900,
        priceYearly: 49000,
        features: JSON.stringify([
          "Access to live classes",
          "Full recording library",
          "Timetable & scheduling",
          "Email support",
          "Progress tracking",
        ]),
        subjects: JSON.stringify(["MATHS", "ENGLISH"]),
        isPopular: false,
        isActive: true,
        sortOrder: 1,
      },
      {
        name: "Premium",
        description: "Everything you need for exam success",
        tier: "PREMIUM",
        priceMonthly: 7900,
        priceYearly: 79000,
        features: JSON.stringify([
          "Everything in Basic",
          "Homework portal access",
          "Priority support",
          "Study materials & worksheets",
          "Parent progress reports",
          "Early access to new content",
        ]),
        subjects: JSON.stringify(["MATHS", "ENGLISH"]),
        isPopular: true,
        isActive: true,
        sortOrder: 2,
      },
    ],
  });
  console.log("✅ Pricing plans created");

  // ==================== SUMMARY ====================
  console.log("\n🎉 Database seeded successfully!\n");
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
  console.log("");
  console.log("   ... and 8 more students");
  console.log("\n═══════════════════════════════════════════════════");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
