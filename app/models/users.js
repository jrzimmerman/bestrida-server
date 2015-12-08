var findOrCreate = require('mongoose-findorcreate')
var mongoose = require('../db');

var userSchema = mongoose.Schema({ 
  stravaId: { type: Number, required: true },
  name: { type: String, required: true }
}).plugin(findOrCreate);

var User = mongoose.model('User', userSchema);

// Helper functions
module.exports.findOrCreate = function (stravaId, name) {
  User.findOrCreate(
    { stravaId: stravaId },
    { name: name },
    function (err, user, created) {
      // 'created' will be true if a new user was created
      if (err) {
        console.error(err);
      }
      return user;
    }
  );
};