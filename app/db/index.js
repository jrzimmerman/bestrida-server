var mongo = require('mongodb');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
mongoose.connect(process.env.MONGOLAB_URI);
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

module.exports = mongoose;
