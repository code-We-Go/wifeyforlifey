import mongoose, { Schema } from "mongoose";

/**
 * Generic key/value settings store.
 * Example: { key: "bosta_auth", value: { apiKey, token, refreshToken, tokenExpiry } }
 */
const settingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, minimize: false }
);

const settingsModel =
  mongoose.models.settings || mongoose.model("settings", settingsSchema);

export default settingsModel;
