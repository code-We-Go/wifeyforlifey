
import { ConnectDB } from "@/app/config/db";
import SubCategorysModel from "@/app/modals/subCollectionsModal";
import { NextResponse } from "next/server";
const loadDB = async () => {
    await ConnectDB();
};

loadDB();

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const collectionID = searchParams.get("collectionID")!;
    console.log('collectionID'+collectionID)
    // const page = parseInt(searchParams.get("page") || "1", 10);
    // const limit = 10;
    // const skip = (page - 1) * limit;

    try {
        const SubCategorys = await SubCategorysModel.find({"collectionID":collectionID}).sort({ createdAt: -1 });
        // const totalProducts = await productModel.countDocuments();

        return NextResponse.json(SubCategorys, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}
export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const SubCategoryID = searchParams.get("SubCategoryID")!;
    console.log('SubCategoryID'+SubCategoryID)
    // const page = parseInt(searchParams.get("page") || "1", 10);
    // const limit = 10;
    // const skip = (page - 1) * limit;

    try {
        const res = await SubCategorysModel.findByIdAndDelete({"_id":SubCategoryID});
        // const totalProducts = await productModel.countDocuments();

        return NextResponse.json(res, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete SubCategory" }, { status: 500 });
    }
}

export async function PUT(request:Request){
    const { searchParams } = new URL(request.url);
    const SubCategoryID = searchParams.get("SubCategoryID") 
    console.log('SubCategoryID');
    const req=await request.json()
    console.log(req)
    
    console.log('working');
    try {
        const res = await SubCategorysModel.findByIdAndUpdate(SubCategoryID, req, { new: true, runValidators: true });
        return NextResponse.json({data:res},{status:200})
    }
    catch(error:any){
        return Response.json({ error: error.message }, { status: 500 });
     
    }
}

export async function POST(request:Request){
    const req=await request.json()
    console.log(req)
    try {
        const res = await SubCategorysModel.create(req);
        return NextResponse.json({data:res},{status:200})
    }
    catch(error:any){
        return Response.json({ error: error.message }, { status: 500 });
     
    }
}