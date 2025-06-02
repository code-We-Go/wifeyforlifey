import mongoose, { Schema, Document } from 'mongoose';

export interface IDiscountUsage extends Document {
  userId: string;
  discountId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  usedAt: Date;
  discountAmount: number;
  originalOrderTotal: number;
  finalOrderTotal: number;
}

const discountUsageSchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  discountId: {
    type: Schema.Types.ObjectId,
    ref: 'Discount',
    required: true,
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  usedAt: {
    type: Date,
    default: Date.now,
  },
  discountAmount: {
    type: Number,
    required: true,
  },
  originalOrderTotal: {
    type: Number,
    required: true,
  },
  finalOrderTotal: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
});

// Add compound index for faster queries
discountUsageSchema.index({ userId: 1, discountId: 1 });

export default mongoose.models.DiscountUsage || mongoose.model<IDiscountUsage>('DiscountUsage', discountUsageSchema); 