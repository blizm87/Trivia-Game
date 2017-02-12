const express = require('express');
const router = express.Router();
const Handlebars = require('handlebars');
const getQuestion = require('../lib/getQuestion.js');
const answerShuffle = require('../lib/answerShuffle.js');
const Profile = require('../models/userProfiles.js');
const gameRooms = require('../models/gameRooms.js');

function getUsername(id, callback) {
  Profile.findById(id, function(err, results){
    callback(results.name);
  });
}

router.get('/', (req, res, next) => {
  if (!req.session.user) {
    res.render('index', {title: 'triviaGame'});
  } else {
      const user = JSON.stringify(req.session.user);
      res.render('new', {title: 'newGame', avatar: req.session.user.image.url});
    }
});

// Create
router.get('/new', (req, res, next) => {
  res.render('new', {title: 'newGame'});
});

router.get('/question', (req, res, next) => {
  var cat = req.query.category
  getQuestion(cat, function(data, question) {
    answerShuffle.answerShuffle(data, function(shuffleData) {
      res.send({question: question, answers: shuffleData});
    });
  });
});

router.get('/game/:id', (req, res, next) => {
  if (!req.session.user) {
    res.redirect('/');
  } else {
    console.log(req.session.user.id)
      var cat = req.query.category
      var fullUrl = '/game/' + req.params.id;
      gameRooms.find({url: fullUrl }, function(err, results) {
        if (err) {
          console.log(err);
        }
        if (results.length === 0) {
          getQuestion(cat, function(data, question) {
            answerShuffle.answerShuffle(data, function(shuffleData) {
              var gameRoom = new gameRooms({
                url: fullUrl,
                gameMode: req.query.playerMode,
                activeUsers: 1,
                firstQuestion: {
                  question: question,
                  answers: shuffleData,
                  category: cat
                },
              });
              gameRoom.save();
              getUsername(req.session.user.id, function(name){
                res.render('game', {question: question, answers: shuffleData, gameUrl: fullUrl, name: name, category: cat, playerMode: req.query.playerMode, mongoId: req.session.user.id, avatar: req.session.user.image.url});
              });
            });
          });
        } else if(results) {
            gameRooms.find({url: fullUrl}, function(err, results) {
              var formatted_results = results[0].firstQuestion[0];
              getUsername(req.session.user.id, function(name){
                res.render('game', {question: formatted_results.question, answers: formatted_results.answers, name: name, category: cat, playerMode: req.query.playerMode, mongoId: req.session.user.id, avatar: req.session.user.image.url});
              });
            });
          }
      });
    }
});

// Read
router.get('/new', (req, res, next) => {
  res.render('new', {title: 'New Game'});
});

router.get('/join', (req, res, next) => {
  gameRooms.find({activeUsers: 1, gameMode: 'Multiplayer'}, (err, allRooms) => {
    if(allRooms.length === 0){
      res.render('new', {title: 'New Game', noGameAlert: 'There are no game rooms availabe to join!', avatar: req.session.user.image.url});
    } else {
        var rand = Math.floor(Math.random() * allRooms.length);
        var joinUrl = allRooms[rand].url;
        gameRooms.update({url: joinUrl}, { $inc: { activeUsers: 1 }},(err, userData) => {
          res.redirect(joinUrl);
        });
      }
  });
});

router.get('/question', (req, res, next) => {
  getQuestion(function(data, question) {
    answerShuffle.answerShuffle(data, function(shuffleData) {
      res.send({question: question, answers: shuffleData});
    });
  });
});

router.get('/user', (req, res, next) => {
  if (!req.session.user) {
    res.redirect('/');
  } else {
    var userId = req.session.user.id;
    Profile.findOne({_id: userId}, (err, userData) => {
      res.render('profile', {title: 'playerProfile', info: userData, avatar: req.session.user.image.url});
    });
  }
});

router.get('/browse', (req, res, next) => {
  if (!req.session.user) {
    res.redirect('/')
  } else {
    Profile.find({}, (err, allData) => {
      res.render('browse',  { title: 'browseProfiles', profile: allData, avatar: req.session.user.image.url});
    });
  }
});

router.get('/user/:id', (req, res, next) => {
  var userId = req.params.id;
  Profile.findOne({_id: userId}, (err, userData) => {
    res.render('pubProfData', {title: 'playerProfile', info: userData, avatar: req.session.user.image.url });
  });
});

router.get('/user.json', (req, res, next) => {
  Profile.find({}, 'name avatar score.gamesWon score.gamesPlayed', function(err, userData) {
    res.send(userData);
  });
});

// Update
router.put('/user', (req, res, next) => {
  var userId = req.session.user.id;
  Profile.update({_id: userId}, { $set: { name: req.body.newName }},(err, userData) => {
    res.redirect('/user');
  });
});

router.put('/scores', (req, res, next) => {
  console.log('player is', req.body.player);
  var winner = req.body.winner;
  var loser = req.body.loser;

  Profile.update({name: winner.name}, {$inc: {'score.gamesWon': 1, 'score.gamesPlayed': 1}}, (err, results)=>{
    Profile.update({name: loser.name}, {$inc: {'score.gamesPlayed': 1}}, (err, results)=>{
      res.send(results);
    })
  })
});

// Delete
router.delete('/game/:id', (req, res, next) => {
  var fullUrl = '/game/' + req.params.id;
  gameRooms.findOneAndRemove({url: fullUrl}, function(err) {
    if (err) {
      console.log(err);
    }
    console.log(`The gameroom ${fullUrl} has been deleted!!!`);
  });
});

module.exports = router
