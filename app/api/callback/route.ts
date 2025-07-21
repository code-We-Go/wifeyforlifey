import { NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import ordersModel from "@/app/modals/ordersModel";
import subscriptionsModel from "@/app/modals/subscriptionsModel";
import UserModel from "@/app/modals/userModel";
import { LoyaltyPointsModel } from "@/app/modals/rewardModel";
import { LoyaltyTransactionModel } from "@/app/modals/loyaltyTransactionModel";

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

// Handle GET requests
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const data: Record<string, string> = {};
        searchParams.forEach((value, key) => {
            data[key] = value;
        });

        console.log("GET Callback Received:", data);
        const isSuccess = data.success === "true";

        // Perform your logic with the GET data here
        if (isSuccess) {
            const expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);

            const expiryDateLifeTime = new Date();
            expiryDateLifeTime.setFullYear(expiryDateLifeTime.getFullYear() + 100);
            const subscribtions =await subscriptionsModel.countDocuments({subscribed:true})
            console.log('lifeTime'+expiryDateLifeTime)
            const subscription = await subscriptionsModel.findOneAndUpdate(
                { paymentID: data.order },
                { subscribed: true, expiryDate :subscribtions>50?expiryDate:expiryDateLifeTime}
            ).populate({path:"packageID",strictPopulate:false});
            if (subscription) {
                const loyaltyBonus =await LoyaltyTransactionModel.create({email:subscription.email,type:"earn",reason:"subscription",amount:(subscription.packageID.price)/20,bonusID:"687d67f459e6ba857a54ed53"})
                const subscribedUser = await UserModel.findOneAndUpdate(
                    { email: subscription.email },
                    { isSubscribed: true,subscription:subscription._id },
                );
                if(subscribedUser){
                    return NextResponse.redirect(`${process.env.testUrl}payment/success?subscription=true&account=true`);

                }
                else{
                    return NextResponse.redirect(`${process.env.testUrl}payment/success?subscription=true`);

                }
            }
            else{
            console.log("Order2ID"+data.order)
            console.log("Transaction Successful, redirecting to /success...");
            const res= await ordersModel.findOneAndUpdate({orderID:data.order},{payment:"confirmed"})
            const loyalty = await LoyaltyTransactionModel.create({
                email: res.email,
                type: "earn",
                reason: "purchase",
                amount: res.subTotal / 20,
              });
            }
            //Update the order status with orderId here
            return NextResponse.redirect(`${process.env.testUrl}payment/success`);
        } else {
            const res= await ordersModel.findOneAndUpdate({orderID:data.order},{payment:"failed"})
            console.log("Transaction Failed, redirecting to /failure...");
            return NextResponse.redirect(`${process.env.testUrl}payment/failed`);
        }
        // if (isSuccess) {
        //     console.log("Transaction Successful, redirecting to /success...");
        //     return NextResponse.redirect(new URL("/", request.url));
        // } else {
        //     console.log("Transaction Failed, redirecting to /failure...");
        //     return NextResponse.redirect(new URL("/pages/about", request.url));
        // }
        // return NextResponse.json({ message: "GET Callback handled successfully", data });
    } catch (error) {
        console.error("Error handling GET request:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Handle POST requests
export async function POST(request: Request) {
    try {
        const data = await request.json();
        console.log("POST Callback Received:", data);
        console.log('item' + data.obj.order.currency)

        // Perform your logic with the POST data here
        return NextResponse.json({ message: "POST Callback handled successfully" });
    } catch (error) {
        console.error("Error handling POST request:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
