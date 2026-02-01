import { NextResponse } from "next/server";
import productsModel from "@/app/modals/productsModel";
import { ConnectDB } from "@/app/config/db";
import mongoose from "mongoose";
import subCategoryModel from "@/app/modals/subCategoryModel";
import categoriesModel from "@/app/modals/categoriesModel";

const loadDB = async () => {
  await ConnectDB();
};

loadDB();
console.log("registering" + subCategoryModel + categoriesModel);
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const productID = searchParams.get("productID");
    const featured = searchParams.get("featured");
    const subcategory = searchParams.get("subcategory");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sortBy = searchParams.get("sortBy");
    const search = searchParams.get("search");

    let query: any = {};

    // Apply category filter (through subcategory)
    if (category) {
      // First find all subcategories that belong to this category
      const subcategories = await mongoose.model("subCategories").find({
        categoryID: category,
      });

      // Then find products that have any of these subcategories
      query.subCategoryID = {
        $in: subcategories.map((sub) => sub._id),
      };
    }
    if (featured) {
      const featuredProducts = await productsModel
        .find({ featured: "true" })
        .sort({ order: -1, createdAt: -1 });
      return NextResponse.json({ data: featuredProducts }, { status: 200 });
    }
    // Apply subcategory filter
    if (subcategory) {
      query.subCategoryID = new mongoose.Types.ObjectId(subcategory);
    }
    if (productID) {
      const res = await productsModel.findById(productID);
      console.log("product" + res.subCategoryID._id);

      return NextResponse.json({ data: res }, { status: 200 });
    }
    // Apply price range filter
    if (minPrice || maxPrice) {
      query["price.local"] = {};
      if (minPrice) query["price.local"].$gte = parseFloat(minPrice);
      if (maxPrice) query["price.local"].$lte = parseFloat(maxPrice);
    }

    // Apply search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object
    let sort: any = {};
    switch (sortBy) {
      case "price_asc":
        sort = { "price.local": 1 };
        break;
      case "price_desc":
        sort = { "price.local": -1 };
        break;
      case "popular":
        sort = { ratings: -1 };
        break;
      default:
        sort = { order: -1, createdAt: -1 }; // Default to newest
    }

    const products = await productsModel
      .find(query)
      .populate({
        path: "subCategoryID",
        options: { strictPopulate: false },

        populate: {
          path: "categoryID",
          model: "categories",
          options: { strictPopulate: false },
        },
      })
      .sort(sort);
    const validProducts = products.filter(
      (product) =>
        product.subCategoryID &&
        product.subCategoryID._id &&
        product.subCategoryID.categoryID
    );
    return NextResponse.json(validProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
