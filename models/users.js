const mongoose=require('mongoose');
const {Schema}=mongoose;
const passportLocalMongoose=require('passport-local-mongoose');
const {Model} = require("./versions");
const {Product} = require("./products");

const userSchema=new Schema({
    email:{
        type:String,
        unique:true,
        required:[true,"Email is Required"]
    },
    shoppingCart : [{
        intent :{
            type :String,
            enum : ['buy','rent','refurbish']
        },
        product_model :{
            type :String,
            enum : ['Model','Product']
        },
        product_id : {
            type : mongoose.Schema.Types.ObjectId,
            refpath : 'shoppingCart.product_model'
        },
        quantity : {
            type : Number,
            default : 1
        },
        variant_no :{
            type:Number,
            required : function(){if(this.product_model == "Model")return true;else return false}
        },
        color_no :{
            type:Number,
            required : function(){if(this.product_model == "Model")return true;else return false}
        }
    }]
});
userSchema.plugin(passportLocalMongoose.default);
module.exports=mongoose.model('User',userSchema);