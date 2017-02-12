require('./config');
// Require models
const userProfile = require('../models/userProfiles.js');

var playerOne = new userProfile({
  _id: 1234567890,
  f_name: 'Jake',
  profileName: 'MyProfileName',
  avatar: 'URL To my avatar img',
  score: {gamesWon: 50, gamesPlayed: 678}
});

playerOne.save();
