const mongoose = require("mongoose");

const bannersSchema = new mongoose.Schema({
  announcmentBar: {
    type: String,
    required: false,
  },
});

const categoriesModel =
  mongoose.models.banners || mongoose.model("banners", bannersSchema);

export default categoriesModel;
