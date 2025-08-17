import mongoose, { Schema, models } from "mongoose";

const PasswordResetTokenSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 1200 }, // TTL index 20 minutes
  },
});

const PasswordResetToken =
  models.PasswordResetToken ||
  mongoose.model("PasswordResetToken", PasswordResetTokenSchema);

export default PasswordResetToken;
