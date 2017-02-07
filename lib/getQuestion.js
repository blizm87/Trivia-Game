// https://www.opentdb.com/api.php?amount=1&category=9&difficulty=medium&type=multiple
const request = require('request');

var getQuestion = function(callback) {
  request.get('https://www.opentdb.com/api.php?amount=1&category=9&difficulty=medium&type=multiple', (err, response, body) => {
    const data = JSON.parse(body).results[0]
    var q = data.question
    callback(data, q)
  })
}

module.exports = getQuestion