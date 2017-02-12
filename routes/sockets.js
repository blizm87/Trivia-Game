var players = [];

function sockets(io) {
  io.on('connection', socket => {
    // console.log('I am the io!!!');
    socket.on('room', function(data) {
      var roomName = data.room;
      socket.join(roomName);
      players.push(data.player);
      // console.log('connect players are', players);
      // console.log('joined room ', players.length);
      var room = io.sockets.adapter.rooms[roomName];
      // console.log('total connections in ' + roomName + ': ' + room.length);
      socket.on('correct click', function(data){
        var currentPlayer;
        players.forEach( function(player) {
          for (var id in player) {
            if (player[id] === socket.id) {
              player.score += 1;
              currentPlayer = player;
              io.sockets.connected[socket.id].emit('get score', currentPlayer.score);
            }
          }
        });
        console.log(data);
        io.to(roomName).emit('correct click', data);
      });
      socket.on('incorrect click', function(data){
        io.to(roomName).emit('incorrect click', data);
      });
      socket.on('get question', function(data){
        io.to(roomName).emit('get question', data.question);
      });
      socket.on('score card', function(){
        var currentPlayers = [];
        players.forEach (function(player) {
          for (var room in player) {
            if (player[room] === roomName) {
              currentPlayers.push(player);
            }
          }
        });
        currentPlayers.sort(function(a, b){
          return b.score - a.score;
        });
        console.log('total players are', players);
        console.log('current players are', currentPlayers);
        var winner = currentPlayers[0];
        var loser = currentPlayers[1];
        io.sockets.connected[winner.id].emit('score card winner', {winner: winner, loser: loser});
        if (loser) {
          io.sockets.connected[loser.id].emit('score card loser', {winner: winner, loser: loser});
        }
      });
      socket.on('disconnect', function(){
        console.log('disconnected. total connections in ' + roomName + ': ' + room.length);
        players.forEach (function(player) {
          for (var id in player) {
            if (player[id] === socket.id) {
              var i = players.indexOf(player);
              players.splice(i, 1);
            }
          }
        });
        console.log('total players are', players);
      });
    });
  });
}

module.exports = sockets;

