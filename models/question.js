var mongoose = require('mongoose');

// Question Schema
var questionSchema = new mongoose.Schema({
  question: String,
  answers: []
});

module.exports = questionSchema;
