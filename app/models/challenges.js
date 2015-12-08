var mongoose = require('../db');

var challengeSchema = mongoose.Schema({ 
  segmentId: Number,
  challengerId: Number,
  challengeeId: Number,
  challengerTime: Number,
  challengeeTime: Number
});

var Challenge = mongoose.model('Challenge', challengeSchema);

module.exports = Challenge;

module.exports.create = function (segmentId, challengerId, challengeeId) {
  var newChallenge = new Challenge(
    {
      segmentId: segmentId,
      challengerId: challengerId,
      challengeeId: challengeeId
    }
  );
  newChallenge.save();
};

// TODO: Create a helper function that returns the winner of the challenge using challengerTime/challengeeTime data


// If we need findOrCreate method, can use this code but wouldn't have access to mongoose Model methods
// module.exports = {
//   findOrCreate: function () {
//     Challenge.findOrCreate(
//       {
//         segmentId: segmentId,
//         challengerId: challengerId
//       },
//       function (err, effort, created) {
//         // 'created' will be true if a new effort was created
//         if (err) {
//           console.error(err);
//         }
//         return effort;
//       }
//     );
//   }
// };