import { NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import subscriptionsModel from "@/app/modals/subscriptionsModel";
import packageModel from "@/app/modals/packageModel";

// Ensure database is connected
const loadDB = async () => {
    try {
        await ConnectDB();
        console.log("Database connected successfully.");
    } catch (error) {
        console.error("Database connection failed:", error);
    }
};
loadDB();

export async function GET(request: Request) {
    try {
        // const { searchParams } = new URL(request.url);
        // const paymentID = searchParams.get("paymentID");
        // if (!paymentID) {
        //     return NextResponse.json({ error: "Missing paymentID query parameter" }, { status: 400 });
        // }
        console.log("registering" + packageModel)
        const subscription = await subscriptionsModel.findOne({ paymentID:358840801 }).populate({ path: "packageID", options: { strictPopulate: false } });
        if (!subscription) {
            return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
        }
        return NextResponse.json({ subscription });
    } catch (error) {
        console.error("Error in test-subscription API:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
} 