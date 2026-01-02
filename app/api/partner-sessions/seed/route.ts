import { NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import PartnerSessionModel from "@/app/modals/partnerSessionModel";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "true";
    if (process.env.NODE_ENV === "production" && !force) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await ConnectDB();

    const existing = await PartnerSessionModel.countDocuments();
    if (existing > 0 && !force) {
      return NextResponse.json({
        message: "Sessions already exist",
        count: existing,
      });
    }

    const partnerEmail = "omarwagih95@gmail.com";
    const docs = [
      {
        title: "All About Appliances Consultation",
        description:
          "Learn everything you need to know about selecting the right appliances for your home.",
        partnerName: "Wifey Team",
        price: 500,
        discountCode: "WIFEY10",
        whatsappNumber: "+201111111111",
        partnerEmail,
        profitPercentage: 20,
        imageUrl: "/fyonkaCreamey.png",
        isActive: true,
      },
      {
        title: "Self-Care Wellness Session",
        description:
          "A heart-to-heart session dedicated to your wellbeing as a bride-to-be.",
        partnerName: "Wifey Wellness",
        price: 400,
        discountCode: "",
        whatsappNumber: "+201222222222",
        partnerEmail,
        profitPercentage: 25,
        imageUrl: "/fyonkaCreamey.png",
        isActive: true,
      },
      {
        title: "Budget Planning for Gehaz",
        description:
          "Plan your gehaz budget smartly with expert guidance on saving and prioritizing.",
        partnerName: "Wifey Finance",
        price: 350,
        discountCode: "WIFEY10",
        whatsappNumber: "+201333333333",
        partnerEmail,
        profitPercentage: 15,
        imageUrl: "/fyonkaCreamey.png",
        isActive: true,
      },
    ];
    for (const doc of docs) {
      await PartnerSessionModel.updateOne(
        { title: doc.title },
        { $set: doc },
        { upsert: true }
      );
    }
    const sessions = await PartnerSessionModel.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ created: sessions.length, sessions });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
