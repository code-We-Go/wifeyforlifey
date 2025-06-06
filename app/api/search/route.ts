import { ConnectDB } from "@/app/config/db";
import axios from "axios";
import mongoose from "mongoose";
import productModel from "@/app/modals/productsModel";
import { NextResponse } from "next/server";

const loadDB =async()=>{
    console.log('hna');
    await ConnectDB();
}

loadDB();
export async function GET (request:Request){
    const url = new URL(request.url);
    const searchValue = url.searchParams.get("searchValue");
    console.log('search'+searchValue)
    try{
        const res = await productModel.find({
            $or: [
                { title: { $regex: searchValue, $options: 'i' } },
                { description: { $regex: searchValue, $options: 'i' } },
                // { "variations.color": { $regex: searchValue, $options: 'i' } } // Searches for color in variations
              ]
          });        if(res.length===0){

            return NextResponse.json({message:"THERE'S NO ITEMS FOUND"},{status:300});
        }
        console.log(res)
        return NextResponse.json(res);
    }
    catch(error){
        console.error(error);
        return NextResponse.json({message: error},{status:400})
    }
}