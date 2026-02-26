const mongoose = require("mongoose");
const {Schema} = mongoose

const dailySchema = new Schema({
    date : Date,
    status :{
        type:Boolean,
        default:false
    }
});
module.exports.Daily = mongoose.model('dailyDeployment',dailySchema);