import { NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import ShoppingCategoryModel from "@/app/modals/shoppingCategoriesModel";
import ShoppingSubcategoryModel from "@/app/modals/shoppingSubcategoriesModel";

export async function GET() {
  try {
    await ConnectDB();

    const categories = await ShoppingCategoryModel.find({ isActive: true }).sort({ name: 1 });
    const subcategories = await ShoppingSubcategoryModel.find({ isActive: true }).sort({ name: 1 });

    const data = categories.map((cat) => ({
      _id: cat._id,
      name: cat.name,
      subcategories: subcategories
        .filter((sub) => sub.categoryId.toString() === cat._id.toString())
        .map((sub) => ({
          _id: sub._id,
          name: sub.name,
        })),
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching shopping bestie categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
