import { NextResponse } from "next/server";
import { sendMail } from "@/lib/email";
import { getSexEducationSessionEmailHtml } from "@/utils/SexEducationSessionMail";
import { getAppliancesMasterClassEmailHtml } from "@/utils/AppliancesMasterClassSessionMail";
import { ConnectDB } from "@/app/config/db";
import PartnerSessionModel from "@/app/modals/partnerSessionModel";
import { getUserPreferredLanguage } from "@/utils/getUserPreferredLanguage";

const APPLIANCES_SESSION_ID = "6acfa82b936fe79b1c127ed6";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const session = searchParams.get("session") || searchParams.get("sessionId") || "appliances";
    const sendToAll = searchParams.get("sendToAll") === "true";
    const recipientEmail = searchParams.get("email") || "omarwagih95@gmail.com";
    const name = searchParams.get("name") || "Omar";

    const isAppliances =
      session === "appliances" ||
      session === APPLIANCES_SESSION_ID ||
      session === "webinar";

    if (sendToAll) {
      await ConnectDB();
      const targetSessionId = isAppliances ? APPLIANCES_SESSION_ID : session;
      const sessionDoc = await PartnerSessionModel.findById(targetSessionId);
      if (!sessionDoc || !sessionDoc.bookings || sessionDoc.bookings.length === 0) {
        return NextResponse.json({
          success: false,
          message: "No bookings found for this session to send emails to.",
        });
      }

      // Deduplicate by email
      const sentEmails: string[] = [];
      const seen = new Set<string>();

      for (const b of sessionDoc.bookings) {
        const clientEmail = (b.clientEmail || "").trim().toLowerCase();
        if (!clientEmail || seen.has(clientEmail)) continue;
        seen.add(clientEmail);

        const clientFullName = `${b.clientFirstName || ""} ${b.clientLastName || ""}`.trim() || "Wifey";
        const clientLang = await getUserPreferredLanguage({
          email: clientEmail,
          fallbackLang: "ar",
        });

        const subject = isAppliances
          ? "تأكيد حجز ورشة أجهزة بيتك - Appliances Master Class 💕"
          : clientLang === "ar"
          ? "تأكيد حجز جلسة الثقافة الجنسية 💕"
          : "Your Sex Education FAQs Session Booking Confirmation 💕";

        const emailHtml = isAppliances
          ? getAppliancesMasterClassEmailHtml({
              clientName: clientFullName,
              orderId: b.orderId?.toString() || b._id?.toString(),
            })
          : getSexEducationSessionEmailHtml(clientLang);

        try {
          await sendMail({
            to: clientEmail,
            name: clientFullName,
            subject,
            body: emailHtml,
            from: "orders@shopwifeyforlifey.com",
          });
          sentEmails.push(clientEmail);
        } catch (mailErr) {
          console.error(`Failed to send session email to ${clientEmail}:`, mailErr);
        }
      }

      return NextResponse.json({
        success: true,
        message: `Webinar email sent successfully to ${sentEmails.length} attendees.`,
        sentCount: sentEmails.length,
        recipients: sentEmails,
      });
    }

    const clientLang = await getUserPreferredLanguage({
      email: recipientEmail,
      fallbackLang: "ar",
    });

    const subject = isAppliances
      ? "تأكيد حجز ورشة أجهزة بيتك - Appliances Master Class 💕"
      : clientLang === "ar"
      ? "تأكيد حجز جلسة الثقافة الجنسية 💕"
      : "Your Sex Education FAQs Session Booking Confirmation 💕";

    const emailHtml = isAppliances
      ? getAppliancesMasterClassEmailHtml({ clientName: name })
      : getSexEducationSessionEmailHtml(clientLang);

    await sendMail({
      to: recipientEmail,
      name,
      subject,
      body: emailHtml,
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
    const session = body.session || body.sessionId || "appliances";
    const sendToAll = body.sendToAll === true;
    const recipientEmail = body.to || body.email || "omarwagih95@gmail.com";
    const name = body.name || "Omar";

    const isAppliances =
      session === "appliances" ||
      session === APPLIANCES_SESSION_ID ||
      session === "webinar";

    if (sendToAll) {
      await ConnectDB();
      const targetSessionId = isAppliances ? APPLIANCES_SESSION_ID : session;
      const sessionDoc = await PartnerSessionModel.findById(targetSessionId);
      if (!sessionDoc || !sessionDoc.bookings || sessionDoc.bookings.length === 0) {
        return NextResponse.json({
          success: false,
          message: "No bookings found for this session to send emails to.",
        });
      }

      const sentEmails: string[] = [];
      const seen = new Set<string>();

      for (const b of sessionDoc.bookings) {
        const clientEmail = (b.clientEmail || "").trim().toLowerCase();
        if (!clientEmail || seen.has(clientEmail)) continue;
        seen.add(clientEmail);

        const clientFullName = `${b.clientFirstName || ""} ${b.clientLastName || ""}`.trim() || "Wifey";
        const clientLang = await getUserPreferredLanguage({
          email: clientEmail,
          fallbackLang: "ar",
        });

        const subject = isAppliances
          ? "تأكيد حجز ورشة أجهزة بيتك - Appliances Master Class 💕"
          : clientLang === "ar"
          ? "تأكيد حجز جلسة الثقافة الجنسية 💕"
          : "Your Sex Education FAQs Session Booking Confirmation 💕";

        const emailHtml = isAppliances
          ? getAppliancesMasterClassEmailHtml({
              clientName: clientFullName,
              orderId: b.orderId?.toString() || b._id?.toString(),
            })
          : getSexEducationSessionEmailHtml(clientLang);

        try {
          await sendMail({
            to: clientEmail,
            name: clientFullName,
            subject,
            body: emailHtml,
            from: "orders@shopwifeyforlifey.com",
          });
          sentEmails.push(clientEmail);
        } catch (mailErr) {
          console.error(`Failed to send session email to ${clientEmail}:`, mailErr);
        }
      }

      return NextResponse.json({
        success: true,
        message: `Webinar email sent successfully to ${sentEmails.length} attendees.`,
        sentCount: sentEmails.length,
        recipients: sentEmails,
      });
    }

    const clientLang = await getUserPreferredLanguage({
      email: recipientEmail,
      fallbackLang: "ar",
    });

    const subject = isAppliances
      ? "تأكيد حجز ورشة أجهزة بيتك - Appliances Master Class 💕"
      : clientLang === "ar"
      ? "تأكيد حجز جلسة الثقافة الجنسية 💕"
      : "Your Sex Education FAQs Session Booking Confirmation 💕";

    const emailHtml = isAppliances
      ? getAppliancesMasterClassEmailHtml({ clientName: name })
      : getSexEducationSessionEmailHtml(clientLang);

    await sendMail({
      to: recipientEmail,
      name,
      subject,
      body: emailHtml,
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
