const mongoose = require("mongoose");
const {Schema} = mongoose

const couponSchema = new Schema({
    code :String,
    discount:{
        type:{
            type:String,
            enum : ["flat","percentage"]
        },
        value:Number
    },
    description:String,
    validity_check:{
        applicable_category:{
            type:String,
            enum :["all","buy","rent","refurbish"],
            default :"all"
        },
        min_order : {
            type:Number,
            default:0
        },
        user_order_count : {
            type:Number,
            default : 0
        },
        user_membership :{
            type:Number,
            default:0
        }
    }
});
module.exports.Coupon = mongoose.model('coupon',couponSchema);