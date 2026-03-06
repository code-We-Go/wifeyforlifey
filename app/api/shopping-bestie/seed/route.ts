import { NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import ShoppingBrandModel from "@/app/modals/shoppingBestieModel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

const SEED_BRANDS = [
  {
    name: "ZARA",
    logo: "https://logo.clearbit.com/zara.com",
    category: "Fashion",
    subCategory: "Clothing",
    description: "Trendy fashion pieces perfect for bridal parties, engagement outfits, and honeymoon looks.",
    link: "https://www.zara.com",
    tags: ["Bridal", "Elegant", "Honeymoon"],
    isFeatured: true,
  },
  {
    name: "H&M",
    logo: "https://logo.clearbit.com/hm.com",
    category: "Fashion",
    subCategory: "Clothing",
    description: "Affordable fashion and home decor. Great for wedding decorations and bridesmaid gifts.",
    link: "https://www.hm.com",
    tags: ["Budget-Friendly", "Gifts", "Home Decor"],
    isFeatured: false,
  },
  {
    name: "Sephora",
    logo: "https://logo.clearbit.com/sephora.com",
    category: "Beauty",
    subCategory: "Makeup & Skincare",
    description: "Everything for the glowing bride — skincare prep, bridal makeup, and luxurious fragrances.",
    link: "https://www.sephora.com",
    tags: ["Bridal Glow", "Skincare", "Fragrance"],
    isFeatured: true,
  },
  {
    name: "IKEA",
    logo: "https://logo.clearbit.com/ikea.com",
    category: "Home & Living",
    subCategory: "Furniture",
    description: "Stylish and affordable furniture for setting up your first home together as newlyweds.",
    link: "https://www.ikea.com",
    tags: ["Newlywed", "Home Setup", "Budget-Friendly"],
    isFeatured: false,
  },
  {
    name: "Amazon",
    logo: "https://logo.clearbit.com/amazon.com",
    category: "Shopping",
    subCategory: "Multi-Category",
    description: "One-stop shop for wedding gifts, honeymoon essentials, and home setup items.",
    link: "https://www.amazon.com",
    tags: ["Wedding Gifts", "Honeymoon", "Kitchen"],
    isFeatured: false,
  },
  {
    name: "Swarovski",
    logo: "https://logo.clearbit.com/swarovski.com",
    category: "Accessories",
    subCategory: "Jewelry",
    description: "Iconic crystal jewelry and accessories for brides and bridal parties.",
    link: "https://www.swarovski.com",
    tags: ["Bridal", "Luxury", "Jewelry"],
    isFeatured: true,
  },
  {
    name: "Bath & Body Works",
    logo: "https://logo.clearbit.com/bathandbodyworks.com",
    category: "Beauty",
    subCategory: "Wellness",
    description: "Indulgent bath products and candles — perfect for wedding favors and self-care before the big day.",
    link: "https://www.bathandbodyworks.com",
    tags: ["Gifts", "Self-Care", "Candles"],
    isFeatured: false,
  },
  {
    name: "Booking.com",
    logo: "https://logo.clearbit.com/booking.com",
    category: "Travel",
    subCategory: "Hotels & Honeymoon",
    description: "Find the perfect honeymoon hotel, romantic getaways, and travel experiences.",
    link: "https://www.booking.com",
    tags: ["Honeymoon", "Travel", "Romantic"],
    isFeatured: false,
  },
];

// ─── POST /api/shopping-bestie/seed ──────────────────────────────────────────
// Admin-only: seeds the DB with initial brands if none exist yet.
// Call once then disable or delete this route.
export async function POST() {
  try {
    await ConnectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await ShoppingBrandModel.countDocuments();
    if (existing > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Seed skipped — ${existing} brand(s) already exist in the database.`,
        },
        { status: 409 }
      );
    }

    const inserted = await ShoppingBrandModel.insertMany(SEED_BRANDS);

    return NextResponse.json(
      {
        success: true,
        message: `Successfully seeded ${inserted.length} brands.`,
        brands: inserted.map((b) => ({ _id: b._id, name: b.name })),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error seeding shopping brands:", error);
    return NextResponse.json(
      { success: false, error: "Failed to seed brands" },
      { status: 500 }
    );
  }
}
