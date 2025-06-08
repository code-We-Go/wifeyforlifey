import { ConnectDB } from "@/app/config/db";
import { NextResponse } from "next/server";
import clientPromise from '@/lib/mongodb';


const loadDB =async()=>{
    console.log('hna');
    await ConnectDB();
}

loadDB();

export async function GET(request: Request) {
    const client = await clientPromise;
    const db = client.db('mamilk'); 
 

    try {
      const states = await db.collection('states').find({country_id:65
      }).sort({name:1})
      .toArray();
  
      if (!states) {
        return NextResponse.json({ message: "states" }, { status: 404 });
      }
  
      // console.log("states found:", states);
      return NextResponse.json(states);
    } catch (err) {
      console.error("Error fetching states:", err);
      return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
  }