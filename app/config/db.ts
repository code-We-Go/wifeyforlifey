import mongoose from "mongoose";

const MONGODB_URI = `mongodb://wifeyforlifey:${process.env.MONGO_PASSWORD}@ac-kdiurps-shard-00-00.j0pm4vx.mongodb.net:27017,ac-kdiurps-shard-00-01.j0pm4vx.mongodb.net:27017,ac-kdiurps-shard-00-02.j0pm4vx.mongodb.net:27017/wifeyforlifey?ssl=true&replicaSet=atlas-hlglft-shard-0&authSource=admin&retryWrites=true&w=majority`;

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