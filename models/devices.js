const mongoose = require("mongoose");
const {Schema} = mongoose

const deviceSchema = new Schema({
    device : String,
    average_weight_kg:Number,
    max_recycle_value : Number
});
module.exports.Device = mongoose.model('devices',deviceSchema);