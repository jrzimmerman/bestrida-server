var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
mongoose.connect(process.env.MONGODB_URI);
// mongoose.connect('mongodb://localhost:27017/bestrida');
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

module.exports = mongoose;
