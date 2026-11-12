import { NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import ShoppingCategoryModel from "@/app/modals/shoppingCategoriesModel";
import ShoppingSubcategoryModel from "@/app/modals/shoppingSubcategoriesModel";

export async function GET(request: Request) {
  try {
    await ConnectDB();

    const { searchParams } = new URL(request.url);
    const locale = searchParams.get("locale") || searchParams.get("lang") || "en";

    const categories = await ShoppingCategoryModel.find({ isActive: true }).sort({ name: 1 });
    const subcategories = await ShoppingSubcategoryModel.find({ isActive: true }).sort({ name: 1 });

    const data = categories.map((cat) => {
      const catName = locale === "ar" && cat.translations?.ar?.name ? cat.translations.ar.name : cat.name;
      return {
        _id: cat._id,
        name: catName,
        originalName: cat.name,
        translations: cat.translations,
        subcategories: subcategories
          .filter((sub) => sub.categoryId.toString() === cat._id.toString())
          .map((sub) => {
            const subName = locale === "ar" && sub.translations?.ar?.name ? sub.translations.ar.name : sub.name;
            return {
              _id: sub._id,
              name: subName,
              originalName: sub.name,
              translations: sub.translations,
            };
          }),
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching shopping bestie categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
