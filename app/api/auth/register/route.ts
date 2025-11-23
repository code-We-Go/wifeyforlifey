import { ConnectDB } from "@/app/config/db";
import verificationsModel from "@/app/modals/sessionModel";
import sessionsModel from "@/app/modals/sessionModel";
import UserModel from "@/app/modals/userModel";
import { sendMail } from "@/lib/email";
import { User } from "@/models/User";
import { SubscriprtionMail } from "@/utils/subscriptionMail";
import { verificationEmailTemplate } from "@/utils/verificationEmailTempelate";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();
    console.log("here" + username, email, password);

    // Validate required fields
    if (!username || !email || !password) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
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
    const existingUser = await UserModel.findOne({ email: email });

    if (existingUser) {
      return new Response(JSON.stringify({ error: "Email already used" }), {
        status: 400,
      });
    }

    const hashedPassword = await hash(password, 10);
    console.log(username, email, hashedPassword);

    const user = await UserModel.create({
      username: username,
      email: email,
      password: hashedPassword,
    });

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
    await sendMail({
      to: email,
      name: "wiiga",
      subject: "Please click on link to verify your account",
      body: `${SubscriprtionMail(verificationLink)}`,
      from: "authentication@shopwifeyforlifey.com",
      // body: `<a href=${verificationLink}> click here to verify your account</a>`,
      //   body: compileWelcomeTemplate("Vahid", "youtube.com/@sakuradev"),
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
