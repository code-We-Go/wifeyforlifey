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
                "nails-cute-1", "nails-cute-2", "nails-cute-3", "nails-cute-4", 
                "nails-cute-5", "nails-cute-6", "nails-cute-7"
              ]
            },
            {
              title: "Feet",
              images: ["nails-feet-1", "nails-feet-2", "nails-feet-3"]
            },
            {
              title: "French & gradients",
              images: ["nails-french-1", "nails-french-2"]
            }
          ]
        },
        {
          title: "Wedding Dress Ideas",
          sections: [
             {
                title: "Ballgowns",
                images: ["dress-1", "dress-2", "dress-3"]
             }
          ]
        }
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
