import mongoose, { Schema, Document } from "mongoose";

// Define the Subscription schema with TTL
const playlistsProgressSchema = new Schema(
  {
    userID: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    playlistID: { type: mongoose.Schema.Types.ObjectId, ref: "playlists" },
    videosWatched: { type: [mongoose.Schema.Types.ObjectId], ref: "videos" },
    lastWatchedVideoID: { type: mongoose.Schema.Types.ObjectId, ref: "videos" },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Define the Subscription model
const playlistsProgress =
  mongoose.models.playlistProgress ||
  mongoose.model<Document & mongoose.Model<any>>(
    "playlistProgress",
    playlistsProgressSchema
  );

export default playlistsProgress;
