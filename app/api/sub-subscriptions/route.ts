import { NextRequest, NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import SubSubscriptionModel from "@/app/modals/subSubscriptionModel";
import subscriptionsModel from "@/app/modals/subscriptionsModel";
import UserModel from "@/app/modals/userModel";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/authOptions";
import packageModel from "@/app/modals/packageModel";
import { sendMail } from "@/lib/email";
import { groomEmail } from "@/utils/groomEmail";
import { getUserPreferredLanguage } from "@/utils/getUserPreferredLanguage";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ConnectDB();

    const parentEmail = session.user.email;
    const parentSubscriptions = await subscriptionsModel.find({ email: parentEmail, subscribed: true });

    if (!parentSubscriptions.length) {
      return NextResponse.json({ data: [] });
    }

    const parentIds = parentSubscriptions.map(s => s._id);

    const subSubscriptions = await SubSubscriptionModel.find({
      parentSubscription: { $in: parentIds }
    }).populate("inviteeUser", "firstName lastName imageURL");

    return NextResponse.json({ data: subSubscriptions });
  } catch (error: any) {
    console.error("Error fetching sub-subscriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sub-subscriptions", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role, inviteeName, inviteeEmail, inviteMessage, parentSubscriptionId } = await request.json();

    if (!role || !inviteeEmail || !parentSubscriptionId || !inviteeName) {
      return NextResponse.json(
        { error: "Role, inviteeName, inviteeEmail, and parentSubscriptionId are required." },
        { status: 400 }
      );
    }

    await ConnectDB();

    // Verify parent subscription belongs to user
    const parentSubscription = await subscriptionsModel.findOne({
      _id: parentSubscriptionId,
      email: session.user.email,
      subscribed: true
    }).populate("packageID");

    if (!parentSubscription) {
      return NextResponse.json({ error: "Parent subscription not found or not active." }, { status: 404 });
    }

    // Check package limits
    const pkg = parentSubscription.packageID as any;
    if (!pkg?.subSubscriptionSlots) {
      return NextResponse.json({ error: "Package does not support sub-subscriptions." }, { status: 400 });
    }

    const slotConfig = pkg.subSubscriptionSlots.find((s: any) => s.role === role);
    if (!slotConfig) {
      return NextResponse.json({ error: `Package does not allow ${role} roles.` }, { status: 400 });
    }

    const currentCount = await SubSubscriptionModel.countDocuments({
      parentSubscription: parentSubscriptionId,
      role,
      status: { $in: ["pending", "accepted"] }
    });

    if (currentCount >= slotConfig.maxCount) {
      return NextResponse.json({ error: `Maximum number of ${role} invitations reached.` }, { status: 400 });
    }

    // Check if invitee already has an account
    const existingUser = await UserModel.findOne({ email: inviteeEmail.toLowerCase().trim() });

    const newSub = await SubSubscriptionModel.create({
      parentSubscription: parentSubscriptionId,
      role,
      inviteeEmail: inviteeEmail.toLowerCase().trim(),
      inviteeUser: existingUser ? existingUser._id : undefined,
      inviteMessage,
      status: existingUser ? "accepted" : "pending",
    });

    const brideUser = await UserModel.findOne({ email: session.user.email });
    const brideName = brideUser?.firstName || session.user?.name || session.user.email.split("@")[0];
    const emailTo = inviteeEmail.toLowerCase().trim();
    const inviteeLang = await getUserPreferredLanguage({
      email: emailTo,
      fallbackLang: (brideUser?.preferredLanguage as "en" | "ar") || "ar",
    });

    if (role === "groom") {
      const emailBody = groomEmail(
        inviteeName,
        brideName,
        !!existingUser,
        inviteMessage || "",
        inviteeLang
      );

      await sendMail({
        to: emailTo,
        name: inviteeName,
        subject:
          inviteeLang === "ar"
            ? `دعوة خاصة من عروستك ${brideName} 🤵💍`
            : `You’ve Been Invited by ${brideName} 🤵`,
        body: emailBody,
        from: "wifeyforlifey@shopwifeyforlifey.com",
      });
    } else if (role === "bridesmaids") {
      const isAr = inviteeLang === "ar";
      const subject = isAr
        ? `دعوة للانضمام إلى وصيفات العروسة مع ${brideName}! 👯‍♀️💕`
        : `You've been invited to join the Bridal Party!`;

      if (!existingUser) {
        const body = isAr
          ? `
            <div dir="rtl" style="font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif; padding: 25px; background-color: #faf5f3; color: #333; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #f3dcd3;">
              <h2 style="color: #d63384; font-size: 22px;">أهلاً يا قمر! وصلتكِ دعوة مميزة 💖</h2>
              <p style="font-size: 15px; line-height: 1.6;">تمت دعوتكِ من قِبل عروستنا الجميلة <strong>${brideName}</strong> لتكوني من وصيفات العروسة وتشاركيها أحلى تفاصيل تحضيرات الفرح.</p>
              ${inviteMessage ? `<div style="background-color: #fff; padding: 12px 16px; border-right: 4px solid #d63384; border-radius: 6px; margin: 15px 0; font-style: italic;"><p style="margin: 0;"><strong>رسالة من العروسة:</strong> "${inviteMessage}"</p></div>` : ''}
              <p style="font-size: 14px; line-height: 1.6;">لقبول الدعوة والاستمتاع بالمحتوى المخصص، اعملي حسابكِ الجديد بنفس هذا الإيميل:</p>
              <div style="text-align: center; margin: 25px 0;">
                <a href="${process.env.NEXTAUTH_URL}/register" style="display: inline-block; padding: 12px 28px; background-color: #d63384; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px;">إنشاء حساب جديد 💍</a>
              </div>
            </div>
          `
          : `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>You've been invited!</h2>
              <p>You have been invited as a bridesmaid to join the bridal party and access exclusive content by <strong>${brideName}</strong>.</p>
              ${inviteMessage ? `<p><strong>Message from the bride:</strong> ${inviteMessage}</p>` : ''}
              <p>To accept the invitation, please sign up for an account using this email address.</p>
              <p><a href="${process.env.NEXTAUTH_URL}/register" style="display: inline-block; padding: 10px 20px; background-color: #d1bfae; color: white; text-decoration: none; border-radius: 5px;">Sign Up Now</a></p>
            </div>
          `;

        await sendMail({
          to: emailTo,
          name: inviteeName,
          subject,
          body,
          from: "noreply@shopwifeyforlifey.com",
        });
      } else {
        const body = isAr
          ? `
            <div dir="rtl" style="font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif; padding: 25px; background-color: #faf5f3; color: #333; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #f3dcd3;">
              <h2 style="color: #d63384; font-size: 22px;">خبر جميل جداً! 👯‍♀️✨</h2>
              <p style="font-size: 15px; line-height: 1.6;">تمت دعوتكِ من قِبل عروستنا الجميلة <strong>${brideName}</strong> لتكوني وصيفة العروسة!</p>
              ${inviteMessage ? `<div style="background-color: #fff; padding: 12px 16px; border-right: 4px solid #d63384; border-radius: 6px; margin: 15px 0; font-style: italic;"><p style="margin: 0;"><strong>رسالة من العروسة:</strong> "${inviteMessage}"</p></div>` : ''}
              <p style="font-size: 14px; line-height: 1.6;">بما أنكِ تمتلكين حساباً بالفعل معنا، تقدري تدخلي مباشرة على حسابكِ لمتابعة وتجهيز الفرح سوا.</p>
              <div style="text-align: center; margin: 25px 0;">
                <a href="${process.env.NEXTAUTH_URL}/login" style="display: inline-block; padding: 12px 28px; background-color: #d63384; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px;">تسجيل الدخول لحسابكِ 🌸</a>
              </div>
            </div>
          `
          : `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Great News!</h2>
              <p>You have been invited as a bridesmaid to join the bridal party by <strong>${brideName}</strong>!</p>
              ${inviteMessage ? `<p><strong>Message from the bride:</strong> ${inviteMessage}</p>` : ''}
              <p>Since you already have an account, you now have access to some of the package benefits directly in your dashboard.</p>
              <p><a href="${process.env.NEXTAUTH_URL}/login" style="display: inline-block; padding: 10px 20px; background-color: #d1bfae; color: white; text-decoration: none; border-radius: 5px;">Login to Your Account</a></p>
            </div>
          `;

        await sendMail({
          to: emailTo,
          name: inviteeName,
          subject,
          body,
          from: "noreply@shopwifeyforlifey.com",
        });
      }
    }

    return NextResponse.json({ data: newSub }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating sub-subscription:", error);
    return NextResponse.json(
      { error: "Failed to create sub-subscription", details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, action } = await request.json(); // action = "accept" | "revoke"

    if (!id || !action) {
      return NextResponse.json({ error: "ID and action are required." }, { status: 400 });
    }

    await ConnectDB();

    const sub = await SubSubscriptionModel.findById(id).populate("parentSubscription");
    if (!sub) {
      return NextResponse.json({ error: "Sub-subscription not found." }, { status: 404 });
    }

    if (action === "accept") {
      // User must match invitee email
      if (sub.inviteeEmail !== session.user.email) {
        return NextResponse.json({ error: "Unauthorized to accept this invitation." }, { status: 403 });
      }

      // Link user account
      const user = await UserModel.findOne({ email: session.user.email });
      sub.status = "accepted";
      if (user) {
        sub.inviteeUser = user._id;
      }
      await sub.save();
      return NextResponse.json({ message: "Invitation accepted", data: sub });
    } else if (action === "revoke") {
      // Bride is revoking
      const parentSub = sub.parentSubscription as any;
      if (parentSub.email !== session.user.email) {
        return NextResponse.json({ error: "Unauthorized to revoke this invitation." }, { status: 403 });
      }

      sub.status = "revoked";
      await sub.save();
      return NextResponse.json({ message: "Invitation revoked", data: sub });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    console.error("Error updating sub-subscription:", error);
    return NextResponse.json(
      { error: "Failed to update sub-subscription", details: error.message },
      { status: 500 }
    );
  }
}
