const mongoose = require('mongoose');
const {Schema} = mongoose;

const tagSchema = new Schema({
    category:String,
    label:[String],
    device :{
        type:String,
        enum :['laptop','phone','smartwatch','camera','headphone','earbuds','tablet']
    }
})

module.exports.Tag=mongoose.model('tag',tagSchema);
