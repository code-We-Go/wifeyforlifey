import mongoose, { Schema, Document } from "mongoose";

// Define the Subscription schema with TTL
const SubscriptionSchema = new Schema(
  {
    paymentID: {
      type: String,
      required: true,
    },
    packageID: { type: mongoose.Schema.Types.ObjectId, ref: "packages" },
    email: { type: String },
    subscribed: { type: Boolean, default: false },
    redeemedLoyaltyPoints: { type: Number, required: false },
    appliedDiscount: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "discounts",
    },
    appliedDiscountAmount: { type: Number, required: false },
    // User information
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    phone: { type: String, required: false },
    whatsAppNumber: { type: String, required: false },
    // Lovely Bride's address information
    country: { type: String, required: false },
    address: { type: String, required: false },
    apartment: { type: String, required: false },
    city: { type: String, required: false },
    state: { type: String, required: false },
    postalZip: { type: String, required: false },
    // Billing information
    billingCountry: { type: String, required: false },
    billingFirstName: { type: String, required: false },
    billingLastName: { type: String, required: false },
    billingState: { type: String, required: false },
    billingAddress: { type: String, required: false },
    billingApartment: { type: String, required: false },
    billingPostalZip: { type: String, required: false },
    billingCity: { type: String, required: false },
    billingPhone: { type: String, required: false },
    // Payment information
    total: { type: Number, required: false },
    subTotal: { type: Number, required: false },
    shipping: { type: Number, required: false },
    currency: { type: String, required: false },
    expiryDate: { type: Date, default: Date.now },

    bostaCity: { type: String, required: false },
    bostaCityName: { type: String, required: false },
    bostaZone: { type: String, required: false },
    bostaZoneName: { type: String, required: false },
    bostaDistrict: { type: String, required: false },
    bostaDistrictName: { type: String, required: false },
    shipmentID: { type: String, required: false, default: "" }, // Bosta shipment ID
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Define the Subscription model
const subscriptionsModel =
  mongoose.models.subscriptions ||
  mongoose.model<Document & mongoose.Model<any>>(
    "subscriptions",
    SubscriptionSchema
  );

export default subscriptionsModel;
