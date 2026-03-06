import mongoose, { Schema, Document, Types } from "mongoose";

// ─── Review subdocument ───────────────────────────────────────────────────────

export interface IShoppingBrandReview extends Document {
  userId: Types.ObjectId;
  userName: string;
  rating: number; // 1–5
  comment?: string;
  helpful: number;
  notHelpful: number;
  createdAt: Date;
}

const ReviewSchema = new Schema<IShoppingBrandReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    userName: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: false, trim: true },
    helpful: { type: Number, default: 0 },
    notHelpful: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ─── Main Brand document ──────────────────────────────────────────────────────

export interface IShoppingBrand extends Document {
  name: string;
  logo?: string;
  category: string;
  subCategory: string;
  description: string;
  link: string;
  tags: string[];
  clicks: number;
  isFeatured: boolean;
  isActive: boolean;
  // Denormalised stats – updated on every new review
  averageRating: number;
  totalRatings: number;
  reviews: IShoppingBrandReview[];
  createdAt: Date;
  updatedAt: Date;
}

const ShoppingBrandSchema = new Schema<IShoppingBrand>(
  {
    name: { type: String, required: true, trim: true },
    logo: { type: String, required: false },
    category: { type: String, required: true, trim: true },
    subCategory: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    link: { type: String, required: true, trim: true },
    tags: { type: [String], default: [] },
    clicks: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    reviews: { type: [ReviewSchema], default: [] },
  },
  { timestamps: true }
);

// Indexes
ShoppingBrandSchema.index({ category: 1, isActive: 1 });
ShoppingBrandSchema.index({ isFeatured: -1, averageRating: -1 });
ShoppingBrandSchema.index({ clicks: -1 });
// Unique constraint: a user can only review a brand once
ShoppingBrandSchema.index({ "reviews.userId": 1 });

const ShoppingBrandModel =
  mongoose.models.ShoppingBrand ||
  mongoose.model<IShoppingBrand>("ShoppingBrand", ShoppingBrandSchema);

export default ShoppingBrandModel;
