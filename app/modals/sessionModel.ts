const mongoose = require("mongoose");

// Define the session schema
const sessionSchema = new mongoose.Schema({
  userID: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now, // Automatically sets the creation time
  },
});

// Create a TTL index on the 'createdAt' field to expire documents after a certain time
sessionSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 30 }
); // Expire after 30 days

// Create and export the Session model
// const Session = mongoose.model('Session', sessionSchema);
const verificationsModel =
  mongoose.models.verifications ||
  mongoose.model("verifications", sessionSchema);

export default verificationsModel;
