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
    intent : {
        type :String,
        enum : ["rent","refurbish","repair"],
        required : true
    },
    available : {
        type : Boolean,
        default:true,
        required : function(){
            return this.intent === "rent"
        }
    },
    duration : {
        type : {
            startDate : Date,
            endDate : Date
        },
        required : function (){
            return this.intent === "rent" && this.available === false
        }
    },
    color: String,
    release_date : Date
});

module.exports.Product=mongoose.model('Product',productSchema);