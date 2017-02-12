function removeEventListeners() {
  $('body').off('click', '.correct', correctAnswer);
  $('body').off('click', '.incorrect', incorrectAnswer);
}

function addEventListeners() {
  $('body').on('click', '.correct', correctAnswer);
  $('body').on('click', '.incorrect', incorrectAnswer);
}

function addToCounter() {
  counter++;
  $('.counter').text(counter);
  if (counter === 10) {
    $.ajax({
      url: $('#gameUrl').text(),
      type: 'delete',
    });
    socket.emit('score card');
  }
}

function putScores(winner, loser) {
  $.ajax({
    url: '/scores',
    method: 'put',
    data: {winner: winner, loser: loser}
  });
}

function getWinner(players) {
  players.sort(function(a, b){
    return b.score - a.score;
  });
  return players[0];
}

function renderHtml(question) {
  var $question = $('.question');
  $question.text(question.question);
  var html = '';
  var answer = question.answers;
  for (var i = 0; i < question.answers.length; i++) {
    if (answer[i].correct) {
      html += '<li class="mc-list"><button class="mc-btn correct" data-correct="true">' + answer[i].answer + '</button></li>';
    } else {
        html += '<li class="mc-list"><button class="mc-btn incorrect" data-correct="false">' + answer[i].answer + '</button></li>';
      }
  }
  $('#mc').html(html);
  addToCounter();
  addEventListeners();
}

function getQuestion(emitTo, answer) {
  var cat = $('#category').text()
  $.get(`/question?category=${cat}`, function(question) {
    socket.emit(emitTo, {question: question, answer: answer});
  });
}

function incorrectAnswer() {
  removeEventListeners();
  var answerText = $(this).text();
  socket.emit('incorrect click', answerText);
  if($playerMode === 'Single Player') {
    if ($('.red').length === 0) {
      getQuestion('get question', answerText);
    }
  } else {
      if ($('.red').length === 1) {
        removeEventListeners();
        getQuestion('get question', answerText);
      }
    }
}

function correctAnswer() {
  var answerText = $(this).text();
  getQuestion('correct click', answerText);
}

var randWord = function(){
  var alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  var randomWord = [];
  var i = 0;
  while(i < 8){
    var randomNumber = Math.floor(Math.random() * 62);
    var randomLetter = alphabet.charAt(randomNumber);
    randomWord.push(randomLetter);
    i++;
  }
  randomWord = randomWord.join('');
  return randomWord;
}

var socket = io();
var userName = $('#username').val();
var room = window.location.pathname;
var mongoId = $('#mongoId').text();
var $startBtn = $('#startBtn');
var $joinBtn = $('#joinBtn');
var $correct = $('.correct');
var $incorrect = $('.incorrect');
var $playerMode = $('#gameMode').text();
var counter = $('.counter').text();


console.log(userName);
socket.on('connect', function() {
  console.log('client connected');
  var player = {
    id: socket.id,
    name: userName,
    score: 0,
    room: room,
    mongoId: mongoId
  }
  socket.emit('room', {room: room, player: player});
});

//Create Game Room
$startBtn.on('click', function(){
  var cat = $('select').val();
  var randURL = '/game/';
  randURL += randWord();
  $('form').attr('action', `${randURL}?category=${cat}`);
});

// CORRECT ANSWER CLICK
$('body').on('click', '.correct', correctAnswer);
socket.on('correct click', function(data) {
  removeEventListeners();
  $('li').each( function(el) {
    if ($(this).text() === data.answer) {
      $(this).children().addClass('green');
    }
  });
  setTimeout(function() {
    renderHtml(data.question);
  }, 1000);
});

// WRONG ANSWER CLICK
$('body').on('click', '.incorrect', incorrectAnswer);
socket.on('incorrect click', function(data) {
  $('li').each( function(el) {
    if ($(this).text() === data) {
      $(this).children().addClass('red');
    }
  });
});

// Render Score
socket.on('get score', function(score){
  $('#score').text(score);
});

// Retrieve next question
socket.on('get question', function(question){
  renderHtml(question);
});

// Game Results
socket.once('score card winner', function(players){
  var winner = players.winner;
  var loser = players.loser;
  if ($playerMode === 'Multiplayer') {
    html = '<div class="container scoreboard"><h1>GAME OVER</h1><h3>YOU WIN</h3>';
    html += '<h5>' + winner.name + ' Score: ' + winner.score + '</h5><h5>' +
            loser.name + ' Score: ' + loser.score + '</h5></div>';
    $('.container').html(html);
    if (players.winner.id === socket.id) {
      console.log('sent put request');
      console.log('put score for winner')
      //putScores(winner, loser);
      putScores(winner, loser);
    }
    // if(players.loser.id === socket.id) {
    //   console.log('put score for loser')
    //   putScores(loser)

    // }
  } else {
      html = '<div class="container scoreboard"><h1>GAME RESULTS</h1><h5> Your Score: ' + winner.score + '</h5>';
      $('.container').html(html);
    }
});

socket.once('score card loser', function(players){
  var winner = players.winner;
  var loser = players.loser;
  html = '<div class="container scoreboard"><h1>GAME OVER</h1><h3>YOU LOSE</h3>';
  html += '<h5>' + winner.name + ' Score: ' + winner.score + '</h5><h5>' +
          loser.name + ' Score: ' + loser.score + '</h5></div>';
  $('.container').html(html);
});

// Profile Update rendering
var $profEdit = $('.profileEdit');
var $profEditDivBtn = $('.profileEdit>button');
var $profEditLink = $('#profEditLink');
var $profUserNameEdit = $('#profUserNameEdit');
var $input = $('.profileEdit>input');

$profEditLink.on('click', function(evt){
  $profEdit.css('display', 'inline');
  $profUserNameEdit.css('display', 'none');
});

$profEditDivBtn.on('click', function(evt){
  $profEdit.css('display', 'none');
  $profUserNameEdit.css('display', 'inline');
  $.ajax({
    url: '/user',
    method: 'PUT',
    data: {newName: $input.val()}
  });
});
