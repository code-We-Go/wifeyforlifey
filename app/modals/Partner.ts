import mongoose, { Schema } from "mongoose";

export interface Partner {
  category: string;
  subCategory: string;
  brand: string;
  offer: string;
  discount: string;
  code: string;
  link: string;
  bookingMethod: string;
  imagePath: string;
  translations?: {
    ar?: {
      category?: string;
      subCategory?: string;
      brand?: string;
      offer?: string;
      discount?: string;
      bookingMethod?: string;
    };
  };
}

const PartnerSchema = new Schema<Partner>(
  {
    category: {
      type: String,
      required: true,
    },
    subCategory: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    offer: {
      type: String,
      required: true,
    },
    discount: {
      type: String,
      default: "",
    },
    code: {
      type: String,
      default: "",
    },
    link: {
      type: String,
      required: true,
    },
    bookingMethod: {
      type: String,
      required: true,
    },
    imagePath: {
      type: String,
      required: true,
    },
    translations: {
      ar: {
        category: { type: String, required: false },
        subCategory: { type: String, required: false },
        brand: { type: String, required: false },
        offer: { type: String, required: false },
        discount: { type: String, required: false },
        bookingMethod: { type: String, required: false },
      },
    },
  },
  { timestamps: true }
);

export const PartnerModel = mongoose.models.Partner || mongoose.model("Partner", PartnerSchema);