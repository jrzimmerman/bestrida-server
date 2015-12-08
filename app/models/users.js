var mongoose = require('../db');

var userSchema = mongoose.Schema({ 
  _id: { type: Number, required: true },
  name: { type: String, required: true }
});

var User = mongoose.model('User', userSchema);

module.exports = User;

module.exports.create = function (stravaId, name) {
  var newUser = new User({
    _id: stravaId,
    name: name 
  });
  newUser.save();
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