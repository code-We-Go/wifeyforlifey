// lib/mongodb.ts or utils/db.ts

import mongoose from "mongoose";

const MONGODB_URI = `mongodb+srv://wifeyforlifey:${process.env.MONGO_PASSWORD}@wifeyforlifey.j0pm4vx.mongodb.net/wifeyforlifey?retryWrites=true&w=majority&appName=WifeyForLifey`;

if (!process.env.MONGO_PASSWORD) {
  throw new Error("Please define the MONGO_PASSWORD environment variable");
}

export const ConnectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log("Already connected to MongoDB");
      return;
    }

    // Add connection options optimized for Vercel Pro plan
    const options = {
      serverSelectionTimeoutMS: 20000, // Increased for better reliability on Vercel Pro
      socketTimeoutMS: 60000, // Appropriate for Vercel Pro plan
      connectTimeoutMS: 30000, // Increased for Vercel Pro (60s function execution limit)
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 1, // Maintain at least 1 socket connection
      maxIdleTimeMS: 60000, // Keep connections alive longer on Pro plan
      retryWrites: true,
      retryReads: true,
    };

    await mongoose.connect(MONGODB_URI, options);
    console.log("MongoDB Connected...");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    // Don't exit the process, just throw the error
    throw error;
  }
};
