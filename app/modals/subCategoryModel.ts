import mongoose from "mongoose";
import path from "path";

const subCategorySchema = new mongoose.Schema({
  subCategoryName: { type: String, required: true },
  categoryID: {
    type: String,
    // ref: "categories",
    // path: path.join(__dirname, "categoriesModel"),
  },
  image:{type:String,required:false},
  description: { type: String },
  HomePage: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
});
console.log("Registering subCategoryModel");
const subCategoryModel =
  mongoose.models.subCategories ||
  mongoose.model("subCategories", subCategorySchema);

export default subCategoryModel;
