// Email service - currently logs to console
// Replace with actual email provider (SendGrid, Resend, etc.) in production

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  // In production, replace this with actual email sending
  // For now, log to console for testing
  console.log("\n========== EMAIL ===========");
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${html}`);
  console.log("============================\n");
  
  // Simulate success
  return true;
}

export function generatePasswordResetEmail(resetUrl: string, firstName: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4F46E5;">Reset Your Password</h1>
      <p>Hi ${firstName},</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <a href="${resetUrl}" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Reset Password</a>
      <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
      <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #999; font-size: 12px;">BrainBooster - Online Tutoring</p>
    </div>
  `;
}

export function generateWelcomeEmail(firstName: string, loginUrl: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4F46E5;">Welcome to BrainBooster! 🎉</h1>
      <p>Hi ${firstName},</p>
      <p>Your account has been created successfully. You can now access all your classes, recordings, and learning materials.</p>
      <a href="${loginUrl}" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Login to Dashboard</a>
      <h3 style="color: #333; margin-top: 24px;">What's next?</h3>
      <ul style="color: #666;">
        <li>Check your timetable for upcoming classes</li>
        <li>Browse our recording library</li>
        <li>Join live sessions with expert tutors</li>
      </ul>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #999; font-size: 12px;">BrainBooster - Online Tutoring</p>
    </div>
  `;
}

export function generateSessionReminderEmail(
  firstName: string,
  sessionTitle: string,
  sessionDate: string,
  meetingLink: string
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4F46E5;">Class Reminder 📚</h1>
      <p>Hi ${firstName},</p>
      <p>You have an upcoming class:</p>
      <div style="background: #F8FAFC; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <h2 style="margin: 0; color: #333;">${sessionTitle}</h2>
        <p style="color: #666; margin: 8px 0 0;">${sessionDate}</p>
      </div>
      <a href="${meetingLink}" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Join Class</a>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #999; font-size: 12px;">BrainBooster - Online Tutoring</p>
    </div>
  `;
}

