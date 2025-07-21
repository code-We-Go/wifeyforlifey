import mongoose, { Schema, Document } from "mongoose";

export interface ILoyaltyTransaction extends Document {
  email: string;
  type: 'earn' | 'spend';
  reason?: string;
  amount?: number;
  timestamp: Date;
  bonusID?: mongoose.Schema.Types.ObjectId;
}

const LoyaltyTransactionSchema = new Schema<ILoyaltyTransaction>({
  email: { type: String, required: true },
  type: { type: String, enum: ["earn", "spend"], required: true },
  timestamp: { type: Date, default: Date.now },
  reason:{type:String,required:false, enum:["purchase","subscription","birthday","wedding day","social media" ]},
  bonusID: { type: mongoose.Schema.Types.ObjectId, ref: "LoyalityPoints" },
});

export const LoyaltyTransactionModel = mongoose.models.LoyaltyTransaction || mongoose.model<ILoyaltyTransaction>("LoyaltyTransaction", LoyaltyTransactionSchema); 