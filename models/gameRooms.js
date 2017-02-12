var mongoose = require('mongoose');
var questionSchema = require('./question.js');

var gameRooms = new mongoose.Schema({
  url: {type: String, unique: true},
  gameMode: String,
  activeUsers: Number,
  category: String,
  firstQuestion: [questionSchema]
});

var gameRooms = mongoose.model('gameRooms', gameRooms);

module.exports = gameRooms;
