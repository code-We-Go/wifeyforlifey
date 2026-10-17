import { NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import PartnerSessionModel from "@/app/modals/partnerSessionModel";

export async function GET(request: Request) {
  try {
    await ConnectDB();

    const { searchParams } = new URL(request.url);
    const sort = searchParams.get("sort");

    let sortOptions: any = { order: 1, createdAt: -1 };
    if (sort === "latest" || sort === "date") {
      sortOptions = { createdAt: -1 };
    }

    const sessions = await PartnerSessionModel.find({ isActive: true })
      .sort(sortOptions)
      .lean();

    const enrichedSessions = sessions.map((s: any) => {
      const bookingsCount = Array.isArray(s.bookings) ? s.bookings.length : 0;
      const isWebinar = s.sessionType === "webinar";
      const hasCap = typeof s.maxCapacity === "number" && s.maxCapacity > 0;
      const isFullyBooked = isWebinar && hasCap && bookingsCount >= s.maxCapacity;

      return {
        ...s,
        isFullyBooked: Boolean(isFullyBooked),
      };
    });

    return NextResponse.json({ success: true, data: enrichedSessions });
  } catch (error) {
    console.error("Error fetching partner sessions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}
