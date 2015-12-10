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

module.exports.registerAthlete = function (user) {
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
    } else {
      console.log('User saved!', user);
    }
  });
};

module.exports.refreshToken = function (stravaId, token) {
  User.where({ _id: stravaId }).update({ token: token }, function (err, res) {
    if (err) {
      console.error('Error refreshing token:', err);
    }
    console.log('Successfully refreshed token:', res);
  });
};

// If we need findOrCreate method, can use this code but wouldn't have access to mongoose Model methods
// module.exports = {
//   find: function (parameters, cb) {
//     User.find(parameters, cb);
//   },
//   findOrCreate: function (stravaId, name) {
//     User.findOrCreate(
//       {
//         _id: stravaId
//       },
//       {
//         name: name
//       },
//       function (err, user, created) {
//         // 'created' will be true if a new user was created
//         if (err) {
//           console.error(err);
//         }
//         // console.log(user);
//         return user;
//       }
//     );
//   }
// };