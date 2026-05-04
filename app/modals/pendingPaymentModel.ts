import mongoose, { Schema, Document } from "mongoose";

export interface IPendingPayment extends Document {
  paymobOrderId: string;
  productType: "subscription" | "order" | "partner_session";
  referenceId: mongoose.Types.ObjectId;
  status: "pending" | "processing" | "confirmed" | "failed";
  processedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const PendingPaymentSchema = new Schema<IPendingPayment>(
  {
    paymobOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    productType: {
      type: String,
      required: true,
      enum: ["subscription", "order", "partner_session"],
    },
    referenceId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "confirmed", "failed"],
      default: "pending",
    },
    processedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const PendingPaymentModel =
  mongoose.models.PendingPayment ||
  mongoose.model<IPendingPayment>("PendingPayment", PendingPaymentSchema);

export default PendingPaymentModel;
