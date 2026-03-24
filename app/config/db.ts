import mongoose from "mongoose";

const MONGODB_URI = `mongodb+srv://wifeyforlifey:${process.env.MONGO_PASSWORD}@wifeyforlifey.j0pm4vx.mongodb.net/wifeyforlifey?retryWrites=true&w=majority&appName=WifeyForLifey`;

if (!process.env.MONGO_PASSWORD) {
  throw new Error("Please define the MONGO_PASSWORD environment variable");
}

// 👇 global cache (VERY IMPORTANT)
let cached = global.mongoose || { conn: null, promise: null };

export const ConnectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const options = {
      bufferCommands: false,
      maxPoolSize: 5, // lower = safer for free tier
    };

    cached.promise = mongoose.connect(MONGODB_URI, options);
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

// 👇 save to global
global.mongoose = cached;