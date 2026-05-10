const mongoose = require("mongoose");

const categoriesSchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  image: {
    type: String,
    required: false,
  },
  active: {
    type: Boolean,
    default: true,
  },
  type: {
    type: String,
    enum: ["product", "weddingPlanning"],
    default: "product",
  },
});
console.log('Registering CategoryModel');
const categoriesModel =
  mongoose.models.categories || mongoose.model("categories", categoriesSchema);

export default categoriesModel;
