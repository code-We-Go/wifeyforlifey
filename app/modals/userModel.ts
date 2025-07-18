import mongoose, { Schema, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";
import { string } from "zod";
import subscriptionsModel from "./subscriptionsModel";
export interface ISubscription extends Document {
  paymentID: string;
  packageID: Types.ObjectId;
  email?: string;
  subscribed: boolean;
  expiryDate: Date;
  createdAt: Date;
  updatedAt: Date; // Because of timestamps: true
}
// Define the User interface
export interface IUser extends Document {
  _id :string
  username: string;
  firstName?:string;
  lastName?:string;
  password: string;
  role: "admin" | "moderator" | "customer";

  email:string;
  emailVerified:boolean;
  isSubscribed:boolean;
  imageURL?:string;
  subscription:ISubscription;

  // comparePassword(candidatePassword: string): Promise<boolean>;
}

// Define the User schema
console.log("here"+subscriptionsModel)
const UserSchema = new Schema<IUser>(
  {
    username: { 
      type: String, 
      required: true, 
      unique: false,
      // trim: true,
      minlength: 3
    },
    
    firstName:{
      type: String,
      required: false,
      default: ""
    },
    lastName:{
      type: String,
      required: false,
      default: ""
    },
    imageURL:{
      type: String,
      required: false,
      default: ""
    },
    role: {
      type: String,
      default: "customer",
      required: false,
    },
    password: { 
      type: String, 
      required: false,
      minlength: 6
    }
    ,
    email:{type:String,required:true},
    emailVerified:{type:Boolean,default:false},
    isSubscribed:{type:Boolean,default:false},
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subscriptions",
      required: false,
    },

  },
  { timestamps: true }
);

// Hash password before saving
// UserSchema.pre("save", async function(next) {
//   // Only hash the password if it's modified or new
//   if (!this.isModified("password")) return next();
  
//   try {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (error: any) {
//     next(error);
//   }
// });

// Method to compare passwords
// UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
//   try {
//     return await bcrypt.compare(candidatePassword, this.password);
//   } catch (error) {
//     console.error('Error in comparePassword:', error);
//     return false;
//   }
// };

// Create and export the User model
const UserModel = mongoose.models.users || mongoose.model<IUser>("users", UserSchema);

export default UserModel;