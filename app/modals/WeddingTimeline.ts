import mongoose, { Schema, Document } from "mongoose";

export interface IWeddingTimeline extends Document {
  userId?: string;
  startTime: string;
  events: {
    id: string;
    brideActivity: string;
    groomActivity: string;
    bridesmaidsActivity: string;
    groomsmenActivity: string;
    duration: number;
    timeLabel?: string;
  }[];
  createdAt: Date;
}

const EventSchema = new Schema({
  id: { type: String, required: true },
  brideActivity: { type: String, default: "" },
  groomActivity: { type: String, default: "" },
  bridesmaidsActivity: { type: String, default: "" },
  groomsmenActivity: { type: String, default: "" },
  duration: { type: Number, required: true },
  timeLabel: { type: String },
});

const WeddingTimelineSchema = new Schema<IWeddingTimeline>(
  {
    userId: { type: String, required: false },
    startTime: { type: String, required: true },
    weddingStartTime: { type: String, required: true },
    events: [EventSchema],
  },
  { timestamps: true }
);

const WeddingTimelineModel =
  mongoose.models.WeddingTimeline ||
  mongoose.model<IWeddingTimeline>("WeddingTimeline", WeddingTimelineSchema);

export default WeddingTimelineModel;
