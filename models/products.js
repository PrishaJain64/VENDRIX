const mongoose=require('mongoose');
const {Schema}=mongoose;
const colorSchema = new Schema({
    color :String,
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
    hexcode:String
});
const priceSchema=new Schema({
    currency:{
        type:String,
        default:"Rs"
    },
    amount:{
        type:Number,
        min:0,
        required:[true,"Amount is required"]
    }
},{_id:false})

const productSchema=new Schema({
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
    variant :{
        label : String,
        price :priceSchema,
        storage : String,
        ram : String
    },
    specifications:{
        type:Schema.Types.Mixed,
        required:true
    },
    intent : {
        type :String,
        enum : ["rent","refurbish","repair"],
        required : true
    },
    duration : [{
        startDate: Date,
        endDate : Date
    }],
    color: colorSchema,
    stock : {
        type : Number,
        required : function(){
            return this.intent=== "refurbish"
        }
    },
    available : {
        type : Number,
    },
    unavailable : {
        type : Number,
    },
    release_date : Date
});

module.exports.Product=mongoose.model('Product',productSchema);