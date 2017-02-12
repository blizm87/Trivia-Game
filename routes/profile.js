const express = require('express');
const request = require('request');
const router = express.Router();
const userProfile = require('../models/userProfiles.js');

router.get('/', (req, res, next) => {
  const user = req.session.user;
  if (!user) return res.redirect('/');
  // res.render( profile page )
  res.send(`<h1>${f_name}</h1><img src=${avatar_url}>`);
});

router.get('/me', (req, res, next) => {
  const url = 'https://www.googleapis.com/plus/v1/people/me';
  const access_token = req.session.access_token;
  if (!access_token) return res.redirect('/');
  const options = {
    method: 'GET',
    url,
    headers: { 'Authorization' : `Bearer ${access_token}`}
  }
  request(options, (err, response, body) => {
    const userData = JSON.parse(body);
    req.session.user = userData;
    // Database work
    userProfile.findById({_id: req.session.user.id }, function(err, results) {
      if (err) {
        console.log(err)
      } else if (!results) {
          var player = new userProfile({
            _id: req.session.user.id,
            name: req.session.user.name.givenName,
            avatar: req.session.user.image.url,
            score: { gamesWon: 0, gamesPlayed: 0}
          });
          player.save();
        } else if(results) {
            console.log('user exists in db');
          }
      return res.redirect('/');
    });
  });
});

module.exports = router;
