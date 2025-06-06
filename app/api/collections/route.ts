
import productModel from "@/app/modals/productsModel";
import { ConnectDB } from "@/app/config/db";
import { NextResponse } from "next/server";
import collectionsModel from "@/app/modals/collectionsModel";

const loadDB = async () => {
    await ConnectDB();
};

loadDB();

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const collectionID = searchParams.get("collectionID")!;
    const collectionName = searchParams.get("collectionName")!;
    console.log('collectionID'+collectionID)
    // console.log('collectionsSection'+collectionsSection)

    try {
        if (collectionID) {
            const collection = await collectionsModel.findById(collectionID);
          
            if (!collection) {
              return NextResponse.json({ error: "Collection not found" }, { status: 404 });
            }
          
            const productIDs = collection.products || [];
          
            // Fetch all products with those IDs
            const products = await productModel.find({ _id: { $in: productIDs } });
          
            return NextResponse.json({
              data: {
                collection:collection,
                products:products, // replace the string IDs with actual product data
              },
            }, { status: 200 });
          }
          
       else if (collectionName) {
        if (collectionName === "section"){
        console.log("section")
            const excludedNames = ["Best Sellers", "More To Shop"];
        
            const collections = await collectionsModel
              .find({ collectionName: { $nin: excludedNames } })
              .sort({ createdAt: -1 });
        
            return NextResponse.json(collections, { status: 200 });
        }
        else{
            
            const collections = await collectionsModel.find({ collectionName:"More To Shop" }).sort({ createdAt: -1 });
            console.log("collections", collections)
            return NextResponse.json(collections, { status: 200 });
        }
    }
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}