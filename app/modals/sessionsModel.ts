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

export default mongoose.models.Session ||
  mongoose.model<ISession>("Session", SessionSchema);
