const mongoose=require('mongoose');
const {Schema}=mongoose;
const passportLocalMongoose=require('passport-local-mongoose');

const userSchema=new Schema({
    email:{
        type:String,
        unique:true,
        required:[true,"Email is Required"]
    }
});
userSchema.plugin(passportLocalMongoose.default);
module.exports=mongoose.model('User',userSchema);