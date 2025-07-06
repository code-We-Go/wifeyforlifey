import { NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import ordersModel from "@/app/modals/ordersModel";

// Ensure database is connected
const loadDB = async () => {
    try {
        await ConnectDB();
        console.log("Database connected successfully.");
    } catch (error) {
        console.error("Database connection failed:", error);
    }
};

export async function GET(request: Request) {
    try {
        await loadDB();
        
        const { searchParams } = new URL(request.url);
        const email = searchParams.get("email");
        
        if (!email) {
            return NextResponse.json({ error: "Email parameter is required" }, { status: 400 });
        }

        // Fetch orders for the specific user email
        const orders = await ordersModel.find({ email: email })
            .sort({ createdAt: -1 }) // Sort by newest first
            .limit(20); // Limit to 20 most recent orders

        return NextResponse.json({
            orders: orders,
            count: orders.length
        }, { status: 200 });
        
    } catch (error) {
        console.error("Error fetching orders:", error);
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
} 