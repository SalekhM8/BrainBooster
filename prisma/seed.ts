import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await prisma.notification.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.recordingView.deleteMany();
  await prisma.recording.deleteMany();
  await prisma.session.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.pricingPlan.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅ Database cleared\n");

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
    { firstName: "Zainab", lastName: "Ali", email: "zainab.ali@student.com", yearGroup: "A_LEVEL", subjects: ["MATHS", "ENGLISH"], tier: "PREMIUM" },
    { firstName: "Ahmed", lastName: "Hassan", email: "ahmed.hassan@student.com", yearGroup: "KS4", subjects: ["ENGLISH"], tier: "BASIC" },
    { firstName: "Layla", lastName: "Mohamed", email: "layla.mohamed@student.com", yearGroup: "GCSE", subjects: ["MATHS", "ENGLISH"], tier: "PREMIUM" },
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
    { title: "Algebra Fundamentals", subject: "MATHS", yearGroup: "GCSE", teacher: teachers[0], daysFromNow: 1, hour: 16 },
    { title: "Quadratic Equations", subject: "MATHS", yearGroup: "GCSE", teacher: teachers[0], daysFromNow: 2, hour: 17 },
    { title: "Essay Writing Techniques", subject: "ENGLISH", yearGroup: "GCSE", teacher: teachers[1], daysFromNow: 1, hour: 14 },
    { title: "Shakespeare: Macbeth Analysis", subject: "ENGLISH", yearGroup: "GCSE", teacher: teachers[1], daysFromNow: 2, hour: 15 },
    { title: "Calculus Introduction", subject: "MATHS", yearGroup: "A_LEVEL", teacher: teachers[2], daysFromNow: 2, hour: 18 },
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
    { title: "Shakespeare Analysis - Macbeth", subject: "ENGLISH", yearGroup: "GCSE", teacher: teachers[1], duration: 3120 },
    { title: "An Inspector Calls - Themes", subject: "ENGLISH", yearGroup: "GCSE", teacher: teachers[1], duration: 2700 },
    { title: "Differentiation Basics", subject: "MATHS", yearGroup: "A_LEVEL", teacher: teachers[2], duration: 3000 },
    { title: "Integration Methods", subject: "MATHS", yearGroup: "A_LEVEL", teacher: teachers[2], duration: 3300 },
  ];

  const recordings = await Promise.all(
    recordingData.map((r, index) =>
      prisma.recording.create({
        data: {
          title: r.title,
          description: `Complete guide to ${r.title.toLowerCase()}.`,
          subject: r.subject,
          yearGroup: r.yearGroup,
          videoUrl: `https://zoom.us/rec/share/recording-${index + 1}-${r.subject.toLowerCase()}`,
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

  // ==================== PRICING PLANS ====================
  // NOTE: Update stripePriceIdMonthly/Yearly with real Stripe Price IDs after creating them
  await prisma.pricingPlan.createMany({
    data: [
      {
        name: "Basic",
        description: "Perfect for getting started with online tuition",
        tier: "BASIC",
        priceMonthly: 4900, // £49/month
        priceYearly: 49000, // £490/year
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
        stripePriceIdMonthly: null, // Set after creating Stripe products
        stripePriceIdYearly: null,
      },
      {
        name: "Premium",
        description: "Everything you need for exam success",
        tier: "PREMIUM",
        priceMonthly: 7900, // £79/month
        priceYearly: 79000, // £790/year
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
        stripePriceIdMonthly: null,
        stripePriceIdYearly: null,
      },
    ],
  });
  console.log("✅ Pricing plans created");

  // ==================== NOTIFICATIONS ====================
  await prisma.notification.createMany({
    data: [
      {
        userId: students[0].id,
        title: "Welcome to BrainBooster!",
        message: "Your account has been set up. Start exploring live classes and recordings.",
        type: "SUCCESS",
        isRead: false,
      },
      {
        userId: students[0].id,
        title: "New session scheduled",
        message: "Algebra Fundamentals is scheduled for tomorrow at 4:00 PM.",
        type: "INFO",
        isRead: false,
      },
    ],
  });
  console.log("✅ Notifications created");

  // ==================== SUMMARY ====================
  console.log("\n========================================");
  console.log("🎉 Database seeded successfully!");
  console.log("========================================\n");
  console.log("Login Credentials:");
  console.log("------------------");
  console.log("Admin:   admin@brainbooster.com / admin123");
  console.log("Teacher: yusuf.hussain@brainbooster.com / teacher123");
  console.log("Student: suhayb.mahmood@student.com / student123");
  console.log("\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
