const mongoose = require('mongoose');
mongoose.Promise = Promise
const url = process.env.MONGODB_URI || 'mongodb://localhost/justinsTrivia';


mongoose.connect(url);
mongoose.connection.once('open', function () {
  console.log(`Mongoose connected to: ${url}`)
});

module.exports = mongoose;
