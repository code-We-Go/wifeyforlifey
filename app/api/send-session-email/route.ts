import { NextResponse } from "next/server";
import { sendMail } from "@/lib/email";
import { sexEducationSessionEmailHtml } from "@/utils/SexEducationSessionMail";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const recipientEmail =
      searchParams.get("email") || "omarwagih95@gmail.com";
    const name = searchParams.get("name") || "Omar";

    await sendMail({
      to: recipientEmail,
      name,
      subject: "Your Sex Education FAQs Session Booking Confirmation 💕",
      body: sexEducationSessionEmailHtml,
      from: "orders@shopwifeyforlifey.com",
    });

    return NextResponse.json({
      success: true,
      message: `Session email sent successfully to ${recipientEmail}`,
      recipient: recipientEmail,
    });
  } catch (error: any) {
    console.error("Error sending session email:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to send email",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const recipientEmail = body.to || body.email || "omarwagih95@gmail.com";
    const name = body.name || "Omar";

    await sendMail({
      to: recipientEmail,
      name,
      subject: "Your Sex Education FAQs Session Booking Confirmation 💕",
      body: sexEducationSessionEmailHtml,
      from: "orders@shopwifeyforlifey.com",
    });

    return NextResponse.json({
      success: true,
      message: `Session email sent successfully to ${recipientEmail}`,
      recipient: recipientEmail,
    });
  } catch (error: any) {
    console.error("Error sending session email:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to send email",
      },
      { status: 500 }
    );
  }
}
