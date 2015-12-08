var mongo = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect('mongodb://bestrida:ak2S9d4k!M3@ds031581.mongolab.com:31581/heroku_s2q4dn51');
var db = mongoose.connection;
var findOrCreate = require('mongoose-findorcreate')

db.on('error', console.error.bind(console, 'connection error:'));

var userSchema = mongoose.Schema(
  { 
    stravaId: Number,
    name: String
  }, 
  { 
    collection: 'Users'
  }
).plugin(findOrCreate);

var User = mongoose.model('User', userSchema);

module.exports.findOrCreateUser = function (stravaId, name) {
  User.findOrCreate(
    { stravaId: stravaId },
    { name: name },
    function (err, val, created) {
      // 'created' will be true if a new user was created
      if (err) {
        console.error(err);
      }
      return val;
    }
  );
};