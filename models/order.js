const mongoose = require("mongoose");
const {Schema} = mongoose
const {User} = require("./versions");

const orderSchema = new Schema({
    transactionId:String,
    shipping:{
        days:Number,
        rate:Number,
        name : String
    },
    address :String,
    cartItems:[{
        name:String,
        quantity : Number,
        price:Number
    }],
    discount:{
        code :String,
        amount :Number
    },
    gst:Number,
    total : Number,
    fixeddeposit:Number,
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'User'
    }
});
module.exports.Order = mongoose.model('Order',orderSchema);