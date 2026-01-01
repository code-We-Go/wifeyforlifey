import { NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import InspoModel from "@/app/modals/insposModel";

export async function GET() {
  try {
    await ConnectDB();

    let inspos = await InspoModel.find({}).sort({ createdAt: -1 });

    // Seeding if empty (Optional, but helpful for development)
    if (inspos.length === 0 && process.env.NODE_ENV !== "production") {
      const seedData = [
        {
          title: "Bridal Nails Inspos",
          sections: [
            {
              title: "Cute wifey designs",
              images: [
                { public_id: "nails-cute-1" },
                { public_id: "nails-cute-2" },
                { public_id: "nails-cute-3" },
                { public_id: "nails-cute-4" },
                { public_id: "nails-cute-5" },
                { public_id: "nails-cute-6" },
                { public_id: "nails-cute-7" },
              ],
            },
            {
              title: "Feet",
              images: [
                { public_id: "nails-feet-1" },
                { public_id: "nails-feet-2" },
                { public_id: "nails-feet-3" },
              ],
            },
            {
              title: "French & gradients",
              images: [
                { public_id: "nails-french-1" },
                { public_id: "nails-french-2" },
              ],
            },
          ],
        },
        {
          title: "Wedding Dress Ideas",
          sections: [
            {
              title: "Ballgowns",
              images: [
                { public_id: "dress-1" },
                { public_id: "dress-2" },
                { public_id: "dress-3" },
              ],
            },
          ],
        },
      ];
      
      // Uncomment to seed automatically
      // await InspoModel.insertMany(seedData);
      // inspos = await InspoModel.find({}).sort({ createdAt: -1 });
    }

    return NextResponse.json({ inspos });
  } catch (error) {
    console.error("Error fetching inspos:", error);
    return NextResponse.json(
      { error: "Failed to fetch inspiration boards" },
      { status: 500 }
    );
  }
}
