
import productModel from "@/app/modals/productsModel";
import { ConnectDB } from "@/app/config/db";
import { NextResponse } from "next/server";
import collectionsModel from "@/app/modals/categoriesModel";
import categoriesModel from "@/app/modals/categoriesModel";

const loadDB = async () => {
    await ConnectDB();
};

loadDB();

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const categoryID = searchParams.get("categoryID")!;
    console.log('categoryID'+categoryID)


    try {
        if (categoryID === "all") {
            const categories = await categoriesModel.find().sort({ createdAt: -1 });
            return NextResponse.json({
                data: categories,
            }, { status: 200 });
        }
        else{
            const categories = await categoriesModel.findById(categoryID)
            return NextResponse.json({
                data: categories,
            }, { status: 200 });
        }
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }
}