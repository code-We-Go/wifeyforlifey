import mongoose, { Schema, Document } from "mongoose";

export interface ISession extends Document {
  userId: string;
  sessionId: string;
  createdAt: Date;
}

const SessionSchema = new Schema<ISession>({
  userId: { type: String, required: true, unique: true }, // One session per user
  sessionId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Create a TTL index to expire documents after 30 days
SessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

export default mongoose.models.Session ||
  mongoose.model<ISession>("Session", SessionSchema);
