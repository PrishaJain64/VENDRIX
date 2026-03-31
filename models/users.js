const mongoose=require('mongoose');
const {Schema}=mongoose;
const passportLocalMongoose=require('passport-local-mongoose');
const {Model} = require("./versions");
const {Product} = require("./products");

const userSchema=new Schema({
    firstname :String,
    lastname : String,
    address : String,
    email:{
        type:String,
        unique:true,
        required:[true,"Email is Required"],
        lowercase:true
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
            refPath : 'product_model'
        },
        quantity : {
            type : Number,
            default : 1
        },
        variant_no :{
            type:Number,
            required : function(){return this.product_model == "Model"}
        },
        color_no :{
            type:Number,
            required : function(){return this.product_model == "Model"}
        },
        duration : {
        startDate: {
            type :Date,
            required : function(){return this.intent == "rent"}
        },
        endDate :{
            type:Date,
            required : function(){return this.intent == "rent"}
        }
        }
    }],
    reviews:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Review'
    }],
    order_count:{
        type:Number,
        default:0
    }
},{timestamps:true});
userSchema.plugin(passportLocalMongoose.default);
module.exports=mongoose.model('User',userSchema);