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
        intent : {
            type:String,
            enum :['buy','rent','refurbish']
        },
        product_model : {
            type:String,
            enum : ['Model','Product']
        },
        product_id : {
            type :mongoose.Schema.Types.ObjectId,
            refPath : 'shoppingCart.product_model'
        },
        variant_id : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Model',
            required : function(){
                if(this.intent === 'buy') return true; //this only works with required  
                else return false;
            }
        },
        color_id : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Model',
            required : function(){
                if(this.intent === 'buy') return true;
                else return false;
            }
        },
        quantity:{
            type:Number,
            default:1
        }
    }]
});
userSchema.plugin(passportLocalMongoose.default);
module.exports=mongoose.model('User',userSchema);