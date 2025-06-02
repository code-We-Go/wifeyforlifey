const { default: mongoose } = require("mongoose");

const collectionsShcema =mongoose.Schema({
    collectionName:{
        type:String,
        required:true,
    },
    imageURL:{type:String},
    description:{String},
    products:{type:[String] ,required:false},
    });

    const collectionsModel= mongoose.models.collections || mongoose.model('collections', collectionsShcema)

    export default collectionsModel;