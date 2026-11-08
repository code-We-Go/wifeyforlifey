import { NextResponse } from "next/server";
import { sendMail } from "@/lib/email";
import { verificationEmailTemplate } from "@/utils/verificationEmailTempelate";
import { SubscriprtionMail } from "@/utils/subscriptionMail";
import { resetPasswordEmailTemplate } from "@/utils/resetPasswordEmail";
import { generateEmailBody } from "@/utils/generateOrderEmail";
import { generateWelcomeEmail as genFullWelcome } from "@/utils/FullExperienceEmail";
import { generateMiniExperienceMail } from "@/utils/MiniExperienceEmail";
import { generateWelcomeEmail as genWeddingWelcome } from "@/utils/weddingPlanningExperienceEmail";
import { generateGehazBestieExperienceUpgradeEmail } from "@/utils/gehazBestieExperienceUpgradeEmail";
import { generateWeddingPlanningExperienceUpgradeEmail } from "@/utils/weddingPlanningExperienceUpgradeEmail copy";
import { giftMail } from "@/utils/giftMail";
import { groomEmail } from "@/utils/groomEmail";
import { SessionBookingClientMail } from "@/utils/SessionBookingClientMail";
import { getSexEducationSessionEmailHtml } from "@/utils/SexEducationSessionMail";
import { getAppliancesMasterClassEmailHtml } from "@/utils/AppliancesMasterClassSessionMail";
import { generateSuspiciousLoginEmail } from "@/utils/suspiciousLoginEmail";

export async function GET(request: Request) {
  return handleSend(request);
}

export async function POST(request: Request) {
  return handleSend(request);
}

async function handleSend(request: Request) {
  try {
    const recipients = ["nareimanahmed97@gmail.com", "omarwagih95@gmail.com"];

  const sampleItems = [
    {
      productName: "The Ultimate Bride Planner 2026 - النسخة الذهبية",
      price: 650,
      quantity: 1,
      imageUrl: "https://www.shopwifeyforlifey.com/logo/WifeyforLifeyPrimaryLogoRed.png",
    },
    {
      productName: "Bride Robe - Satin Silk (Dusty Rose)",
      price: 450,
      quantity: 1,
      imageUrl: "https://www.shopwifeyforlifey.com/logo/WifeyforLifeyPrimaryLogoRed.png",
    },
  ];

  const results: any[] = [];

  for (const recipient of recipients) {
    const isNareiman = recipient.includes("nareiman");
    const recipientName = isNareiman ? "نريمان" : "عمر";

    const emailsToSend = [
      {
        id: "1-verification",
        title: "1. إيميل تأكيد الحساب (Verification Email)",
        subject: "تأكيد حسابكِ في Wifey for Lifey 💕",
        from: "Wifey For Lifey <noreply@shopwifeyforlifey.com>",
        body: verificationEmailTemplate("https://www.shopwifeyforlifey.com/verification?token=demo-test-token", "ar"),
      },
      {
        id: "2-subscription-welcome",
        title: "2. إيميل تفعيل الاشتراك (Subscription Welcome Email)",
        subject: "أهلاً بيكي في عائلة وايفي! 💕",
        from: "Wifey For Lifey <orders@shopwifeyforlifey.com>",
        body: SubscriprtionMail("https://www.shopwifeyforlifey.com/account", "ar"),
      },
      {
        id: "3-reset-password",
        title: "3. إيميل استرجاع كلمة السر (Password Reset Email)",
        subject: "إعادة تعيين كلمة السر - Wifey for Lifey 🌸",
        from: "Wifey For Lifey <noreply@shopwifeyforlifey.com>",
        body: resetPasswordEmailTemplate("https://www.shopwifeyforlifey.com/reset-password?token=demo-token", "ar"),
      },
      {
        id: "4-order-confirmation",
        title: "4. إيميل تأكيد الطلب للمتجر (Store Order Confirmation)",
        subject: "تأكيد طلبكِ من Wifey for Lifey 💕",
        from: "Wifey For Lifey <orders@shopwifeyforlifey.com>",
        body: generateEmailBody(
          sampleItems,
          recipientName,
          "أحمد",
          "01012345678",
          recipient,
          1150,
          1100,
          50,
          "EGP",
          "شارع التسعين الجنوبي، التجمع الخامس",
          "WFL-2026-9876",
          "بطاقة بنكية (Credit Card)",
          "مصر",
          "القاهرة",
          "القاهرة الجديدة",
          "11835",
          "عمارة 12، شقة 4",
          "ar"
        ),
      },
      {
        id: "5-full-experience-welcome",
        title: "5. إيميل رحلة جهازك الكاملة (Full Wifey Experience Welcome)",
        subject: "نورتي مجتمع وايفي يا أحلى عروسة! 💗",
        from: "Wifey For Lifey <orders@shopwifeyforlifey.com>",
        body: genFullWelcome(recipientName, { editionName: "النسخة العربية (Arabic Edition)" }, "ar"),
      },
      {
        id: "6-mini-experience-welcome",
        title: "6. إيميل رحلة جهازك المصغرة (Mini Wifey Experience Welcome)",
        subject: "أهلاً بيكي في رحلة جهازكِ المصغّرة مع وايفي! 💕",
        from: "Wifey For Lifey <orders@shopwifeyforlifey.com>",
        body: generateMiniExperienceMail(recipientName, {}, "ar"),
      },
      {
        id: "7-wedding-planning-welcome",
        title: "7. إيميل فرحك مع وايفي (Wedding Planning Bestie Welcome)",
        subject: "أهلاً بيكي في رحلة تنظيم فرحكِ مع وايفي! 💕",
        from: "Wifey For Lifey <orders@shopwifeyforlifey.com>",
        body: genWeddingWelcome(recipientName, {}, "ar"),
      },
      {
        id: "8-gehaz-upgrade",
        title: "8. إيميل ترقية باقة جهازك (Gehaz Bestie Upgrade Email)",
        subject: "تم ترقية باقتكِ بنجاح! 💖",
        from: "Wifey For Lifey <orders@shopwifeyforlifey.com>",
        body: generateGehazBestieExperienceUpgradeEmail(recipientName, "ar"),
      },
      {
        id: "9-wedding-planning-upgrade",
        title: "9. إيميل ترقية باقة تنظيم الفرح (Wedding Planning Upgrade Email)",
        subject: "تم ترقية باقتكِ بنجاح! 💖",
        from: "Wifey For Lifey <orders@shopwifeyforlifey.com>",
        body: generateWeddingPlanningExperienceUpgradeEmail(recipientName, "ar"),
      },
      {
        id: "10-gift-purchase",
        title: "10. إيميل تأكيد شراء هدية (Gift Purchase Confirmation)",
        subject: "شكراً لشرائكِ هدية مميزة! 🎁💖",
        from: "Wifey For Lifey <orders@shopwifeyforlifey.com>",
        body: giftMail("ORD-GIFT-5544", sampleItems, "ar"),
      },
      {
        id: "11-groom-invite",
        title: "11. إيميل دعوة العريس (Groom Invitation Email)",
        subject: `دعوة خاصة من عروستك ${recipientName === "عمر" ? "نريمان" : "عروستك"} 🤵💍`,
        from: "Wifey For Lifey <wifeyforlifey@shopwifeyforlifey.com>",
        body: groomEmail(
          recipientName === "نريمان" ? "أحمد" : "عمر",
          recipientName === "عمر" ? "نريمان" : "عروستك",
          false,
          "يا حبيبي نورت رحلة فرحنا، البلانر وكل تفاصيل اليوم سوا خطوة بخطوة 💕",
          "ar"
        ),
      },
      {
        id: "12-session-booking",
        title: "12. إيميل تأكيد حجز استشارة (Session Booking Confirmation)",
        subject: "تم تأكيد حجزكِ: استشارة تنظيم ديكور الفرح 💕",
        from: "Wifey For Lifey <orders@shopwifeyforlifey.com>",
        body: SessionBookingClientMail({
          clientFirstName: recipientName,
          clientLastName: "أحمد",
          sessionTitle: "استشارة تنظيم وديكور الفرح",
          partnerName: "فريق خبراء وايفي",
          sessionType: "one-to-one",
          partnerWhatsApp: "01012345678",
          meetingLink: "https://meet.google.com/wifey-consultation-demo",
          finalPrice: 800,
          orderId: "SESS-67890",
          lang: "ar",
        }),
      },
      {
        id: "13-sex-education-session",
        title: "13. إيميل جلسة الثقافة الجنسية (Sex Education Session)",
        subject: "تأكيد حجز جلسة الثقافة الجنسية 💕",
        from: "Wifey For Lifey <orders@shopwifeyforlifey.com>",
        body: getSexEducationSessionEmailHtml("ar"),
      },
      {
        id: "14-appliances-masterclass",
        title: "14. إيميل ورشة أجهزة بيتك (Appliances Master Class)",
        subject: "تأكيد حجز ورشة أجهزة بيتك - Appliances Master Class 💕",
        from: "Wifey For Lifey <orders@shopwifeyforlifey.com>",
        body: getAppliancesMasterClassEmailHtml({
          clientName: `${recipientName} أحمد`,
          orderId: "APP-4567",
        }),
      },
      {
        id: "15-suspicious-login",
        title: "15. إيميل تنبيه الأمان (Suspicious Login Alert)",
        subject: "تنبيه أمني: تم تسجيل دخول جديد إلى حسابكِ في Wifey ⚠️",
        from: "Wifey For Lifey <noreply@shopwifeyforlifey.com>",
        body: generateSuspiciousLoginEmail(
          recipientName,
          "القاهرة، مصر (Cairo, Egypt)",
          "Google Chrome on Windows",
          "ar"
        ),
      },
    ];

    for (const email of emailsToSend) {
      try {
        await sendMail({
          to: recipient,
          name: recipientName,
          subject: email.subject,
          body: email.body,
          from: email.from,
        });

        results.push({
          recipient,
          id: email.id,
          title: email.title,
          status: "sent",
        });
        console.log(`[SUCCESS] Sent ${email.id} to ${recipient}`);
      } catch (err: any) {
        results.push({
          recipient,
          id: email.id,
          title: email.title,
          status: "failed",
          error: err?.message || String(err),
        });
        console.error(`[ERROR] Failed to send ${email.id} to ${recipient}:`, err);
      }
    }
  }

  return NextResponse.json({
    success: true,
    total: results.length,
    successful: results.filter((r) => r.status === "sent").length,
    failed: results.filter((r) => r.status === "failed").length,
    details: results,
  });
  } catch (outerErr: any) {
    return NextResponse.json(
      {
        success: false,
        error: outerErr?.message || String(outerErr),
        stack: outerErr?.stack,
      },
      { status: 500 }
    );
  }
}
