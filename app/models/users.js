var mongoose = require('../db');

var userSchema = mongoose.Schema({ 
  _id: { type: Number, required: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  token: { type: String },
  photo: { type: String },
  email: { type: String }
});

var User = mongoose.model('User', userSchema);

module.exports = User;

module.exports.registerAthlete = function (user, callback) {
  // Check if user exists in db
  User.find({ _id: user.id })
  .then(function (usersArray) {
    // If user exists, just refresh token
    if (usersArray[0]){
      refreshToken(user, callback);
    } else {
      // Else if user doesn't exist in db, save them to db
      saveAthlete(user, callback);
    }
  }, function (err) {
    console.error('Error retrieving user:', err);
  });

};

function saveAthlete (user, callback) {
  // TODO: create a default photo and save the path to defaultPhoto var
  var defaultPhoto = '/some/file/path.jpg';
  var newUser = new User({
    _id: user.id,
    firstname: user.firstname,
    lastname: user.lastname,
    token: user.token,
    photo: user.photo || defaultPhoto,
    email: user.email
  });
  newUser.save(function (err, user) {
    if (err) {
      console.error('Error saving user:', err);
      callback(err);
    } else {
      console.log('User saved!', user);
      callback(null, user);
    }
  });
}

function refreshToken (user, callback) {
  User.update({ _id: user.id }, { token: user.token }, function (err, res) {
    if (err) {
      console.error('Error refreshing token:', err);
      callback(err);
    }
    console.log('Successfully refreshed token:', res);
    callback(null, res);
  });
};