import { ConnectDB } from "@/app/config/db";
import verificationsModel from "@/app/modals/sessionModel";
import sessionsModel from "@/app/modals/sessionModel";
import UserModel from "@/app/modals/userModel";
import subscriptionsModel from "@/app/modals/subscriptionsModel";
import SubSubscriptionModel from "@/app/modals/subSubscriptionModel";
import { sendMail } from "@/lib/email";
import { User } from "@/models/User";
import { SubscriprtionMail } from "@/utils/subscriptionMail";
import { verificationEmailTemplate } from "@/utils/verificationEmailTempelate";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  try {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      whatsAppNumber,
      preferredLanguage,
      weddingDay,
      weddingDate,
    } = await req.json();
    // Normalize email to avoid case-sensitivity issues
    const normalizedEmail = email?.trim().toLowerCase();
    const cleanWhatsApp = (whatsAppNumber || "").trim();
    const chosenLang: "en" | "ar" = preferredLanguage === "ar" ? "ar" : "en";
    const resolvedWeddingDate = weddingDay || weddingDate;

    // Validate required fields
    if (!username || !normalizedEmail || !password) {
      return new Response(
        JSON.stringify({ error: "Username, email, and password are required" }),
        { status: 400 }
      );
    }

    if (!cleanWhatsApp) {
      return new Response(
        JSON.stringify({ error: "WhatsApp number is required" }),
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
      });
    }

    // Validate password length
    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 6 characters" }),
        { status: 400 }
      );
    }

    await ConnectDB();

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email: normalizedEmail });

    if (existingUser) {
      return new Response(JSON.stringify({ error: "Email already used" }), {
        status: 400,
      });
    }

    const hashedPassword = await hash(password, 10);
    console.log(username, normalizedEmail, hashedPassword);

    const subscriptions = await subscriptionsModel.find({
      $or: [
        { email: normalizedEmail },
        { giftRecipientEmail: normalizedEmail }
      ],
      subscribed: true,
    });

    const subscriptionIds = subscriptions.map(sub => sub._id);

    let parsedWeddingDate: Date | undefined;
    if (resolvedWeddingDate) {
      const d = new Date(resolvedWeddingDate);
      if (!isNaN(d.getTime())) {
        parsedWeddingDate = d;
      }
    }

    const user = await UserModel.create({
      username: username,
      firstName: (firstName || "").trim(),
      lastName: (lastName || "").trim(),
      email: normalizedEmail,
      password: hashedPassword,
      whatsAppNumber: cleanWhatsApp,
      preferredLanguage: chosenLang,
      weddingDate: parsedWeddingDate,
      onboardingCompleted: true,
      shippingData: {
        firstName: (firstName || "").trim(),
        lastName: (lastName || "").trim(),
        email: normalizedEmail,
        whatsAppNumber: cleanWhatsApp,
        phone: cleanWhatsApp,
      },
      subscriptions: subscriptionIds,
    });

    // Accept any pending sub-subscriptions for this user
    await SubSubscriptionModel.updateMany(
      { inviteeEmail: normalizedEmail, status: "pending" },
      { $set: { status: "accepted", inviteeUser: user._id } }
    );

    // Remove password from response
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    };
    await verificationsModel.create({ userID: userResponse.id });
    console.log("here" + userResponse.id);
    //    const token = await bcrypt.hash(savedUser._id.toString(), saltRounds);
    const verificationLink = `${process.env.baseUrl}api/auth/verification/${userResponse.id}`;
    const emailSubject =
      chosenLang === "ar"
        ? "تأكيد حسابك في Wifey for Lifey 💕"
        : "Please click on link to verify your account";

    await sendMail({
      to: normalizedEmail,
      name: user.firstName || user.username || "Wifey",
      subject: emailSubject,
      body: `${SubscriprtionMail(verificationLink, chosenLang)}`,
      from: "authentication@shopwifeyforlifey.com",
    });

    return new Response(
      JSON.stringify({
        message: "User created successfully",
        user: userResponse,
      }),
      { status: 201 }
    );
  } catch (err) {
    console.error("Registration error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
