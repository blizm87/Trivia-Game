var mongoose = require('mongoose');

var userProfiles = new mongoose.Schema({
  _id: Number,
  name: String,
  avatar: String,
  score: { gamesWon: Number, gamesPlayed: Number},
  createdAt: { type: Date, default: Date.now }
});

var userProfile = mongoose.model('userProfiles', userProfiles);

module.exports = userProfile;
