import mongoose, { Schema, Document } from "mongoose";

// Define the Subscription schema with TTL
const SubscriptionSchema = new Schema(
    {
        paymentID: { 
            type: String, 
            required: true 
        },
        email:{type:String},
        createdAt: { 
            type: Date, 
            default: Date.now,// 30 minutes in seconds
        }
    },
    { timestamps: true }
);

// Define the Subscription model
const subscriptionsModel = mongoose.models.subscriptions || mongoose.model<Document & mongoose.Model<any>>("subscriptions", SubscriptionSchema);

export default subscriptionsModel; 