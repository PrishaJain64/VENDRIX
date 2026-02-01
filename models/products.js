const mongoose=require('mongoose');
const {Schema}=mongoose;

const priceSchema=new Schema({
    currency:{
        type:String,
        default:"Rs"
    },
    amount:{
        type:Number,
        min:0,
        required:[true,"A0mount is required"]
    }
},{_id:false})

const productSchema=new Schema({
    name:{
        type:String,
        trim:true,
        required:[true,"Device Name required"]
    },
    model:{
        type:String,
        trim:true,
        required:[true,"Model Number required"]
    },
    price:{
        type:priceSchema,
        required:true
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
    specifications:{
        type:Schema.Types.Mixed,
        required:true
    },
    isAvailable:{
        type:Boolean,
        default:true
    }
});

module.exports.Product=mongoose.model('Product',productSchema);