import { ConnectDB } from "@/app/config/db";
import { NextResponse } from "next/server";
import statesModel from "@/app/modals/states";

const loadDB = async () => {
  console.log("hna");
  await ConnectDB();
};

loadDB();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const countryID = searchParams.get("countryID");

    const states = await statesModel
      .find({ country_id: Number(countryID) })
      .sort({ name: 1 })
      .lean();

    if (!states) {
      return NextResponse.json(
        { message: "States not found" },
        { status: 404 }
      );
    }

    // console.log("States found:", states);
    return NextResponse.json(states);
  } catch (err) {
    console.error("Error fetching states:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
