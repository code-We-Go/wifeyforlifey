import mongoose, { Schema, Document } from 'mongoose';

export interface IDiscount extends Document {
  code: string;
  type: 'percentage' | 'fixed' | 'buyXGetY' | 'freeShipping';
  value: number;
  minCartValue?: number;
  maxDiscountAmount?: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  isAutomatic: boolean;
  usageLimit?: number;
  currentUsage: number;
  applicableProducts?: string[];
  applicableCollections?: string[];
  firstTimeUserOnly: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const discountSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed', 'buyXGetY', 'freeShipping'],
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  minCartValue: {
    type: Number,
    default: 0,
  },
  maxDiscountAmount: {
    type: Number,
  },
  redeemType:{
    type:String,
    enum:["Purchase","Subscription","All"],
    required:false
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isAutomatic: {
    type: Boolean,
    default: false,
  },
  usageLimit: {
    type: Number,
  },
  currentUsage: {
    type: Number,
    default: 0,
  },
  applicableProducts: [{
    type: Schema.Types.ObjectId,
    ref: 'Product',
  }],
  applicableCollections: [{
    type: String,
  }],
  firstTimeUserOnly: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Add index for faster queries
discountSchema.index({ code: 1, isActive: 1 });
discountSchema.index({ startDate: 1, endDate: 1 });

export default mongoose.models.discount || mongoose.model<IDiscount>('discount', discountSchema); 