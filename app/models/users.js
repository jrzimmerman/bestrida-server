var mongoose = require('../db');

var userSchema = mongoose.Schema({ 
  _id: { type: Number, required: true },
  name: { type: String, required: true },
  token: { type: Number },
  photo: { type: String },
  email: { type: String }
});

var User = mongoose.model('User', userSchema);

module.exports = User;

module.exports.registerAthlete = function (stravaId, name, token, photo, email) {
  var newUser = new User({
    _id: stravaId,
    name: name,
    token: token,
    photo: photo,
    email: email
  });
  newUser.save(function (err, user) {
    if (err) {
      console.error('Error saving user:', err);
    } else {
      console.log('User saved!', user);
    }
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