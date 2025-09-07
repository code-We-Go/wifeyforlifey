import mongoose from "mongoose";

export interface Video {
  _id?: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl: string;
  isPublic: boolean,

 
  createdAt: Date;
  updatedAt: Date;
}

// types/Playlist.ts
export interface Playlist {
  _id?: string;
  title: string;
  description: string[];
  videos: Video[] | string[]; // Can be full Video objects or just IDs
  thumbnailUrl: string;
  isPublic: boolean;
  category?: string;
  tags?: string[];
  featured:boolean;
  createdAt: Date;
  updatedAt: Date;
  order?:number;
}

// Add VideoPlaylist type alias for compatibility
export type VideoPlaylist = Playlist;

// Add PlaylistFilters interface
export interface PlaylistFilters {
  category?: string;
  isPublic?: boolean;
  search?: string;
  sortBy?: string;
}

// Add video categories
export const videoCategories = [
  { id: 'tutorials', name: 'Tutorials' },
  { id: 'lifestyle', name: 'Lifestyle' },
  { id: 'fashion', name: 'Fashion' },
  { id: 'beauty', name: 'Beauty' },
  { id: 'fitness', name: 'Fitness' },
];

export interface Variant {
  name: string;
  attributeName: string;
  attributes: attribute[]; // e.g., [{ name: "Color", value: "Black" }, { name: "Capacity", value: "2L" }]
  images: media[];
}

export interface Category {
  _id: string;
  categoryName: string;
  description: string;
  __v?: number; // optional if included in response
}

export interface SubCategory {
  _id: string;
  subCategoryName: string;
  description: string;
  categoryID: Category; // now a full object
  createdAt?: string;
  updatedAt?: string;
}

export type attribute = {
  name: string;
  stock: number;
};
export type media = {
  url: string;
  type: mediaType;
};
export type mediaType = "image" | "video";

export type price = {
  local: number;
  global:number;
};
export interface Category {
  _id: string;
  categoryName: string;
  description: string;
  imageURL: string;
}
export interface Collection {
  _id: string;
  collectionName: string;
  description: string;
  imageURL: string;
  products?: string[];
}
export interface SubCategory {
  _id: string;
  subCategoryName: string;
  description: string;
  categoryID: Category; // now a full object
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  _id: string;
  title: string;
  description: string;
  price: price;
  comparedPrice: number;
  // subCategoryID: mongoose.Types.ObjectId;
  subCategoryID: SubCategory; // now a full object
  variations: Variant[];
  productDimensions: string[];
  productDetails: string[];
  productCare: string[];
  season: string;
  featured: boolean;
  ratings: number;
}

export type AddProductType = Omit<Product, "_id">;

export interface Newsletters {
  name: string;
  number: string;
  _id: string;
}

export interface ImageVariant {
  image: string;
  color: string;
}
export interface Size {
  //   type:string;
  name: string;
  stock: number;
}
export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  attributes: attribute;
  variant: Variant;
  quantity: number;
  imageUrl: string;
  collections?: string[];
}

export type FeaturedProduct = Omit<CartItem, "id" | "quantity">;

//   export interface FeaturedProduct
//   {
//    productId: string,
//    productName: string,
//    price: number,
//    imageUrl: string,
//    color:string
//   }
export interface User {
  email: string;
  userId: string;
  userCountry: string;
  firstName: string;
  lastName: string;
  title: string;
  phoneNumber: string;
  address: string;
  deviceType: string;
  // phoneCode:string;
  dob: string;
}
export interface IOrder {
  _id: string;
  email: string;
  orderID?: string;
  country?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  apartment?: string;
  postalZip?: string;
  city?: string;
  state?: string;
  phone?: string;
  cash?: boolean;
  cart?: CartItem[]; // Assuming CartItem interface exists
  subTotal?: number;
  total?: number;
  currency?: string;
  status?: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  payment?: "pending" | "failed" | "confirmed";
  shipmentID?: string; // Bosta shipment ID
  billingCountry?: string;
  billingFirstName?: string;
  billingState?: string;
  billingLastName?: string;
  billingAddress?: string;
  billingApartment?: string;
  billingPostalZip?: string;
  billingCity?: string;
  billingPhone?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface ShippingZone {
  _id: string;
  zone_name: string;
  zone_rate: price;
  localGlobal: "local" | "global";
  states: string[];
  countries: string[];
}

export interface Ipackage {
  _id?: string;
  name: string;
  imgUrl: string;
  price: number;
  duration: string;
  items: string[];
  notes:string[];
}

export interface ISubscription {
  _id?: string;
  paymentID: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILoyaltyTransaction {
  _id?: string;
  userId: string; // or mongoose.Types.ObjectId
  type: 'earn' | 'spend';
  reason: string;
  amount: number;
  timestamp: Date;
  bonusID?: ILoyaltyBonus;
  createdAt:Date; // optional, if related to a reward redemption
}

export interface ILoyaltyBonus {
  _id?: string;
  title: string;
  description: string;
  bonusPoints: number;
  active: boolean;
}
