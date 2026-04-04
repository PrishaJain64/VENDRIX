const mongoose = require("mongoose");
const {Schema} = mongoose

const deviceSchema = new Schema({
    device : String,
    average_weight_kg:Number
});
module.exports.Device = mongoose.model('devices',deviceSchema);