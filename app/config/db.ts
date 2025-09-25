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

    // Add connection options to handle timeouts and retries
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of 30
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      connectTimeoutMS: 50000, // Give up initial connection after 10 seconds
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 1, // Maintain at least 1 socket connection
      maxIdleTimeMS: 30000, // Close idle connections after 30 seconds
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
