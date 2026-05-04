import mongoose, { Schema, Document, Types } from "mongoose";

// ─── Review subdocument ───────────────────────────────────────────────────────

export interface IShoppingBrandReview extends Document {
  userId: Types.ObjectId;
  userName: string;
  rating: number; // 1–5
  comment?: string;
  helpful: Types.ObjectId[];    // users who found this review helpful
  notHelpful: Types.ObjectId[]; // users who found this review not helpful
  images: string[];
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
    helpful: { type: [Schema.Types.ObjectId], ref: "users", default: [] },
    notHelpful: { type: [Schema.Types.ObjectId], ref: "users", default: [] },
    images: { type: [String], default: [] },
  },
  { timestamps: true }
);

// ─── Main Brand document ──────────────────────────────────────────────────────

export interface IShoppingBrand extends Document {
  name: string;
  logo?: string;
  /** ObjectId refs to ShoppingSubcategory — parent category is derived via populate */
  subCategories: Types.ObjectId[];
  description?: string;
  link: string;
  tags: string[];
  clicks: number;
  isFeatured: boolean;
  isActive: boolean;
  reviews: IShoppingBrandReview[];
    /** false = pending approval; true = visible to users */
  approved: boolean;
  /** User who submitted this brand for approval (optional — admin-created brands may not have one) */
  submittedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ShoppingBrandSchema = new Schema<IShoppingBrand>(
  {
    name: { type: String, required: true, trim: true },
    logo: { type: String, required: false },
    subCategories: {
      type: [{ type: Schema.Types.ObjectId, ref: "ShoppingSubcategories" }],
      required: true,
      default: [],
    },    
    description: { type: String, required: false, trim: true },
    link: { type: String, required: true, trim: true },
    tags: { type: [String], default: [] },
    clicks: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    reviews: { type: [ReviewSchema], default: [] },
    approved: { type: Boolean, default: false },
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: false,
      default: null,
    },

  },
  { timestamps: true }
);

// Indexes
ShoppingBrandSchema.index({ isActive: 1, approved: 1 });
ShoppingBrandSchema.index({ isFeatured: -1, clicks: -1 });
ShoppingBrandSchema.index({ clicks: -1 });
// Unique constraint: a user can only review a brand once
ShoppingBrandSchema.index({ "reviews.userId": 1 });

const ShoppingBrandModel =
  mongoose.models.ShoppingBrand ||
  mongoose.model<IShoppingBrand>("ShoppingBrand", ShoppingBrandSchema);

export default ShoppingBrandModel;
