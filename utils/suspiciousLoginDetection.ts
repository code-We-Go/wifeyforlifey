import LoginModel from "@/app/modals/loginsModel";
import { generateSuspiciousLoginEmail } from "./suspiciousLoginEmail";
import nodemailer from "nodemailer";

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  host: "mail.smtp2go.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Checks if a user has logged in from more than 3 different devices (fingerprints)
 * in the last 10 days and sends a notification email if suspicious activity is detected
 *
 * @param userId - The user ID to check
 * @param email - The user's email address
 * @param currentFingerprint - The current login fingerprint
 * @param first_name - The user's first name
 * @returns Promise<boolean> - Returns true if suspicious activity was detected
 */
export async function checkSuspiciousLoginActivity(
  userId: string,
  email: string,
  currentFingerprint: string,
  first_name: string
): Promise<boolean> {
  try {
    // Calculate the date 10 days ago
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    // Find all successful logins for this user in the last 10 days
    const recentLogins = await LoginModel.find({
      userId,
      success: true,
      timestamp: { $gte: tenDaysAgo },
    }).exec();

    // Extract unique fingerprints
    const uniqueFingerprints = new Set<string>();
    recentLogins.forEach((login) => {
      if (login.fingerprint) {
        uniqueFingerprints.add(login.fingerprint);
      }
    });

    // Check if there are more than 3 unique fingerprints
    if (uniqueFingerprints.size > 3) {
      console.log("haramyyyyyyy");
      // Generate suspicious login email content
      const emailContent = generateSuspiciousLoginEmail(first_name, {
        fingerprintCount: uniqueFingerprints.size,
        currentFingerprint,
      });

      // Send email notification
      console.log("firstName" + first_name);
      await sendSuspiciousLoginEmail(email, first_name, emailContent);

      return true; // Suspicious activity detected
    }

    return false; // No suspicious activity
  } catch (error) {
    console.error("Error checking suspicious login activity:", error);
    return false; // Return false on error to avoid blocking login
  }
}

/**
 * Sends a suspicious login notification email
 *
 * @param email - The recipient's email address
 * @param first_name - The user's first name
 * @param emailContent - The HTML content of the email
 * @returns Promise<void>
 */
async function sendSuspiciousLoginEmail(
  email: string,
  first_name: string,
  emailContent: string
): Promise<void> {
  try {
    await transporter.sendMail({
      from: `"Wifey For Lifey Security Team" <authentication@shopwifeyforlifey.com>`,
      to: email,
      subject: "🚨 Security Alert: Suspicious Login Activity Detected",
      html: emailContent,
    });

    console.log(`Suspicious login email sent to ${email}`);
  } catch (error) {
    console.error("Error sending suspicious login email:", error);
    // Don't throw the error to avoid blocking the login process
  }
}
