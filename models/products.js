const mongoose=require('mongoose');
const {Schema}=mongoose;

productSchema=new Schema({
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
        type:Number,
        min:0,
        required:[true,"Price Required"]
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
    images:{
        type:[String],
        validate: {
            validator: v => v.length > 0,
            message: "At least one image is required"
        }
    },
    specification:{
        type:Schema.Types.Mixed,
        required:true
    },
    isAvailable:{
        type:Boolean,
        default:true
    }
});

specificationSchema=new Schema({
    
})



module.exports.Product=mongoose.model('Product',productSchema);