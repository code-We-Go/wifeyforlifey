import mongoose, { Schema, Document, Types } from "mongoose";

export interface IShoppingSubcategory extends Document {
  name: string;
  slug: string;
  categoryId: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  translations?: {
    ar?: {
      name?: string;
    };
  };
}

const ShoppingSubcategorySchema = new Schema<IShoppingSubcategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "ShoppingCategory",
      required: true,
    },
    isActive: { type: Boolean, default: true },
    translations: {
      ar: {
        name: { type: String, required: false },
      },
    },
  },
  { timestamps: true },
);

// Unique name within the same category
ShoppingSubcategorySchema.index({ categoryId: 1, slug: 1 }, { unique: true });

const ShoppingSubcategoryModel =
  mongoose.models.ShoppingSubcategory ||
  mongoose.model<IShoppingSubcategory>("ShoppingSubcategory", ShoppingSubcategorySchema);

export default ShoppingSubcategoryModel;
