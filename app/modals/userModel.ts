import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

// Define the User interface
export interface IUser extends Document {
  username: string;
  password: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Define the User schema
const UserSchema = new Schema<IUser>(
  {
    username: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true,
      minlength: 3
    },
    password: { 
      type: String, 
      required: true,
      minlength: 6
    }
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function(next) {
  // Only hash the password if it's modified or new
  if (!this.isModified("password")) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    console.log('=== Password Comparison Debug ===');
    console.log('Stored hash:', this.password);
    console.log('Hash length:', this.password.length);
    console.log('Hash starts with:', this.password.substring(0, 7));
    console.log('Candidate password:', candidatePassword);
    
    const result = await bcrypt.compare(candidatePassword, this.password);
    console.log('Comparison result:', result);
    console.log('=== End Debug ===');
    
    return result;
  } catch (error) {
    console.error('Error in comparePassword:', error);
    return false;
  }
};

// Create and export the User model
const UserModel = mongoose.models.users || mongoose.model<IUser>("users", UserSchema);

export default UserModel;