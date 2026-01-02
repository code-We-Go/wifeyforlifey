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
        const apiKey = process.env.BREVO_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ message: "BREVO_API_KEY not configured" }, { status: 500 });
        }
        const brevoRes = await fetch("https://api.brevo.com/v3/contacts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "api-key": apiKey,
            },
            body: JSON.stringify({
                email: data.email,
                listIds: [3],
                updateEnabled: true,
            }),
        });
        if (!brevoRes.ok) {
            const errText = await brevoRes.text();
            return NextResponse.json({ message: "Failed to add contact to Brevo", error: errText }, { status: 502 });
        }
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
