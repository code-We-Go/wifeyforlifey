const { default: mongoose } = require("mongoose");

const Shcema =mongoose.Schema({
    SubCategoryName:{
        type:String,
        required:true
    },
    collectionID:{type:String},

    imageUrl:{
        type:String,
        default:""
    },
    products:{type:[String]},
    description:{
        type:String,
    },


    });

    const SubCategorysModel= mongoose.models.SubCategorys || mongoose.model('SubCategorys', Shcema)

    export default SubCategorysModel;