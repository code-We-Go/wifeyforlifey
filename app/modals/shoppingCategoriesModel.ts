import mongoose, { Schema, Document } from "mongoose";

export interface IShoppingCategory extends Document {
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  translations?: {
    ar?: {
      name?: string;
    };
  };
}

const ShoppingCategorySchema = new Schema<IShoppingCategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true, lowercase: true },
    isActive: { type: Boolean, default: true },
    translations: {
      ar: {
        name: { type: String, required: false },
      },
    },
  },
  { timestamps: true },
);

ShoppingCategorySchema.index({ name: 1 }, { unique: true });

const ShoppingCategoryModel =
  mongoose.models.ShoppingCategory ||
  mongoose.model<IShoppingCategory>("ShoppingCategory", ShoppingCategorySchema);

export default ShoppingCategoryModel;
