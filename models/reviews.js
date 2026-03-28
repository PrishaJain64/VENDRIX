const mongoose = require('mongoose');
const {User} = require('./versions');
const {Schema} = mongoose;

const reviewSchema = new Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    product_name:String,
    intent :{
        type:String,
        enum : ['buy','refurbish','rent']
    },
    stars:Number,
    title:String,
    about:String,
    tags:[{
        type:String
    }],
    likes:{
        type:Number,
        default :0
    },
    images:[{
        type:{
            url:String,
            filename:String
        }
    }],
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
},{timestamps:true})

module.exports.Review=mongoose.model('Review',reviewSchema);
