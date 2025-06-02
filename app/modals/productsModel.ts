import { media, Size ,mediaType} from '@/app/interfaces/interfaces';
import mongoose, { Schema, Document } from 'mongoose';
import { Variant } from '@/app/interfaces/interfaces';

// Define the Variant interface


// Define the Product interface
export interface Product extends Document {
  title: string;
  description: string;
  categoryID: string;
  season: string;
  price: {
    local: number;
  };
  comparedPrice: number;

  productDimensions: string[];
  productDetails: string[];
  productCare: string[];
  variations: Variant[];
}
const sizeSchema=new Schema<Size>({
  name:{type:String,required:true},
  stock:{type:Number,required:true}
})
const mediaSchema=new Schema<media>({
  url:{type:String,required:true},
  type:{type:String ,enum :["image" ,"video"],required:true}
})
// Define the Variant schema
const VariantSchema = new Schema<Variant>({
  attributes: [
    {
      name: { type: String, required: true },   // e.g., "Color"
      value: { type: String, required: true },  // e.g., "Red"
    },
  ],
  images: { 
    type: [mediaSchema], 
    required: true,
    validate: {
      validator: function(v: media[]) {
        return v.length > 0;
      },
      message: 'At least one image is required'
    }
  },
});

// Define the Product schema
const ProductSchema = new Schema<Product>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  categoryID: { type: String, required: true },
  season: { type: String, required: false },
  price: {
    local: { 
      type: Number, 
      required: true,
      min: 0 
    },
  },
  comparedPrice: {
    type: Number,
    required: false,
    min: 0
  },
  productDimensions: { type: [String], default: [] },
  productDetails: { type: [String], default: [] },
  productCare: { type: [String], default: [] },
  variations: { 
    type: [VariantSchema], 
    required: true,
    validate: {
      validator: function(v: Variant[]) {
        return v.length > 0;
      },
      message: 'At least one variation is required'
    }
  },
});

// Create and export the Product model
const productsModel = mongoose.models.products || mongoose.model<Product>('products', ProductSchema);
export default productsModel;