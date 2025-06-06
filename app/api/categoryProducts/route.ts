
import productModel from "@/app/modals/productsModel";
import { ConnectDB } from "@/app/config/db";
import { NextResponse } from "next/server";

const loadDB = async () => {
    await ConnectDB();
};

loadDB();

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const categoryID = searchParams.get("categoryID")!;
    console.log('categoryID'+categoryID)
    // const page = parseInt(searchParams.get("page") || "1", 10);
    // const limit = 10;
    // const skip = (page - 1) * limit;

    try {
        const products = await productModel.find({"SubCategoryID":categoryID}).sort({ createdAt: -1 });
        // const totalProducts = await productModel.countDocuments();

        return NextResponse.json({
            data: products,
            // total: totalProducts,
            // currentPage: page,
            // totalPages: Math.ceil(totalProducts / limit),
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}