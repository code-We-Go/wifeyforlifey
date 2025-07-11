import { ConnectDB } from "@/app/config/db";
import  newSletterModel from "@/app/modals/newSletterModel";
import { NextResponse } from "next/server";

const loadDB = async () => {
    console.log('hna');
    await ConnectDB();
}

loadDB();

export async function POST(request: Request) {
    const data = await request.json();
    console.log('Email'+data.email);

    try {
        const res = await newSletterModel.create({email:data.email});
            return NextResponse.json({ message: "Done Wogo" }, { status: 200 });
   
    }
    catch (error: any) {
        console.error(error);

        // Check if error is related to MongoDB validation
        if (error.name === 'ValidationError') {
            return NextResponse.json({ message: 'Validation failed. Please check the data format.' }, { status: 400 });
        }

        // Check for duplicate key error
        if (error.code === 11000) {
            return NextResponse.json({ message: `Duplicate entry: The email ${data.email} already exists.` }, { status: 400 });
        }

        // For other MongoDB errors (e.g., connection issues)
        if (error.name === 'MongoNetworkError') {
            return NextResponse.json({ message: 'Network error while connecting to Database.' }, { status: 503 });
        }

        // General server error
        return NextResponse.json({ message: 'Internal server error please try again later', error: error.message }, { status: 500 });
    }
}
