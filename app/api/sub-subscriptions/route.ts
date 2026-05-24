import { NextRequest, NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import SubSubscriptionModel from "@/app/modals/subSubscriptionModel";
import subscriptionsModel from "@/app/modals/subscriptionsModel";
import UserModel from "@/app/modals/userModel";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/authOptions";
import packageModel from "@/app/modals/packageModel";
import { sendMail } from "@/lib/email";

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

    const { role, inviteeEmail, inviteMessage, parentSubscriptionId } = await request.json();

    if (!role || !inviteeEmail || !parentSubscriptionId) {
      return NextResponse.json(
        { error: "Role, inviteeEmail, and parentSubscriptionId are required." },
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

    if (!existingUser) {
      // Send Invitation Email here
      await sendMail({
        to: inviteeEmail.toLowerCase().trim(),
        name: inviteeEmail.split("@")[0],
        subject: `You've been invited to join the Bridal Party!`,
        body: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>You've been invited!</h2>
            <p>You have been invited as a ${role} to join the bridal party and access exclusive content.</p>
            ${inviteMessage ? `<p><strong>Message from the bride:</strong> ${inviteMessage}</p>` : ''}
            <p>To accept the invitation, please sign up for an account using this email address.</p>
            <p><a href="${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || "https://wifeybolt.com"}/register" style="display: inline-block; padding: 10px 20px; background-color: #d1bfae; color: white; text-decoration: none; border-radius: 5px;">Sign Up Now</a></p>
          </div>
        `,
        from: process.env.SMTP_EMAIL || "noreply@wifeybolt.com",
      });
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
