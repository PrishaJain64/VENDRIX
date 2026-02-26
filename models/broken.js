const mongoose = require("mongoose");
const {Model} = require("./versions");
const {Schema} = mongoose;

const repairSchema = new Schema({
    product_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Model'
    },
    product_variant : Number,
    device : {
        type : String,
        enum:['laptop','phone','smartwatch','camera','headphone','earbuds','tablet']
    },
    color : String,
    images:[{
        url:String,
        filename:String
    }],
    thumbnail:{
        type:{
            url:String,
            filename:String
        },
        required:[true,"Thumbnail is required"]
    },

    issues :[{
        name : String,
        value : Number
    }],
    amount : Number,

    intent : {
        type : String,
        enum : ['refurbish','rent','repair']
    },

    scheduled_time : Date
});

module.exports.Broken=mongoose.model('Broken',repairSchema);