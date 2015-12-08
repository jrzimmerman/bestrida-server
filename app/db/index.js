var mongo = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect('mongodb://bestrida:ak2S9d4k!M3@ds031581.mongolab.com:31581/heroku_s2q4dn51');
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

module.exports = mongoose;