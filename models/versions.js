const mongoose = require('mongoose');
const {Schema} = mongoose;

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
        enum:['laptop','phone','smartwatch','camera','headphone','earbuds','tablet'],
        required:true
    },
    variants : [{
        label : String,
        price : Number,
        storage : String,
        ram : String
    }],
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
    },
    specifications:{
        type:Schema.Types.Mixed,
        required:true
    },
    colors : {
        type : [String]
    },
    release_date : {
        type : Date,
    },
    base_recycle_value :Number
});

module.exports.Model = mongoose.model('Model',modelSchema); 