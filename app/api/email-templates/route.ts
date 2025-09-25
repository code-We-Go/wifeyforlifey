import { NextResponse } from "next/server";
import { sendMail } from "@/lib/email";
import { generateWelcomeEmail } from "@/utils/FullExperienceEmail";
import { generateMiniExperienceMail } from "@/utils/MiniExperienceEmail";
import { ISubscription } from "@/app/interfaces/interfaces";

export async function GET(request: Request) {
  try {
    // Get recipient email from URL query parameters
    const { searchParams } = new URL(request.url);
    const recipientEmail = searchParams.get("email") || "omarwagih95@gmail.com";
    const firstName = searchParams.get("firstName") || "Omar";
    const lastName = searchParams.get("lastName") || "Wagih";

    // Create mock subscription data for email templates
    const mockSubscription: ISubscription = {
      _id: "687396821b4da119eb1c13fe",
      paymentID: "123",
      email: "omarwagih95@gmail.com",
      firstName: "Omar",
      lastName: "wagih",
      packageID: "test-package-id",
      status: "pending",
      updatedAt: new Date(),
    };

    // Generate email content
    const fullExperienceEmailContent = generateWelcomeEmail(
      firstName,
      mockSubscription
    );
    const miniExperienceEmailContent = generateMiniExperienceMail(
      firstName,
      mockSubscription
    );

    // Send the full experience email
    await sendMail({
      to: recipientEmail,
      name: `${firstName} `,
      subject: "Welcome to the Full Wifey Experience! 💕",
      body: fullExperienceEmailContent,
      from: "noreply@shopwifeyforlifey.com",
    });

    // Send the mini experience email
    await sendMail({
      to: "omarwagih95@gmail.com",
      name: `${firstName}`,
      subject: "Welcome to the Mini Wifey Experience! 💕",
      body: miniExperienceEmailContent,
      from: "noreply@shopwifeyforlifey.com",
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Emails sent successfully",
      data: {
        recipient: recipientEmail,
        name: `${firstName} ${lastName}`,
        emailsSent: [
          {
            type: "fullExperience",
            subject: "Welcome to the Full Wifey Experience! 💕",
          },
          {
            type: "miniExperience",
            subject: "Welcome to the Mini Wifey Experience! 💕",
          },
        ],
      },
    });
  } catch (error) {
    console.error("Error sending email templates:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send email templates" },
      { status: 500 }
    );
  }
}
