const mongoose = require('mongoose');
const {Schema} = mongoose;

const questionsSchema = new Schema({
  question: String,
  type:{
    type: String,
    required : true,
    enum:['laptop','phone','smartwatch','camera','headphone','earbuds','tablet']
  },
  options: [
    { text: String, value: Number, severity : Number}
  ],
  intent : {
    type : String,
    enum :['recycle','repair']
  }
});

module.exports.Question = mongoose.model('questions',questionsSchema);