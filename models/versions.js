const mongoose = require('mongoose');
const {Schema} = mongoose;
const variantSchema = new Schema({
    label :String,
    price : Number
},{strict:false});
const colorSchema = new Schema({
    hexcode : String,
    color :String,
    images:[{
        url:String,
        filename:String
    }],
    thumbnail:{
    url: {
        type: String,
        required: true
    },
    filename: {
        type: String,
        required: true
    }
    }
})
const modelSchema = new Schema({
    name:{
        type:String,
        trim:true,
        required:[true,"Device Name required"]
    },
    brand:{
        type:String,
        trim:true,
        required:[true,"Brand Required"]
    },
    type:{
        type:String,
        lowercase:true,
        trim:true,
        enum:['laptop','phone','smartwatch','camera','headphone','earbud','tablet'],
        required:true
    },
    variants : [variantSchema],
    specifications:{
        type:Schema.Types.Mixed,
        required:true
    },
    colors : {
        type : [colorSchema]
    },
    release_date : {
        type : Date,
    },
    base_recycle_value :Number,
    max_recycle_value:Number
});

module.exports.Model = mongoose.model('Model',modelSchema); 