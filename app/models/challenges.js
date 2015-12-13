var mongoose = require('../db');

var challengeSchema = mongoose.Schema({ 
  segmentId: { type: Number, required: true },
  segmentName: { type: String, required: true },
  challengerId: { type: Number, required: true },
  challengeeId: { type: Number, required: true },
  challengerTime: Number,
  challengeeTime: Number,
  status: { type: String, default: 'pending' },
  created: { type: Date, default: Date.now },
  expires: { type: Date }
});

var Challenge = mongoose.model('Challenge', challengeSchema);

module.exports = Challenge;

module.exports.create = function (challenge) {
  var newChallenge = new Challenge({
    segmentId: challenge.segmentId,
    segmentName: challenge.segmentName,
    challengerId: challenge.challengerId,
    challengeeId: challenge.challengeeId
  });
  newChallenge.save(function (err, res) {
    if (err) {
      console.error('Error creating challenge:', err);
    } else {
      console.log('Challenge created:', res);
    }
  });
};

module.exports.accept = function () {
  // TODO: add challenge to Active Challenges tab
};

module.exports.decline = function () {
  // TODO: update challenge status as declined so that both users can see it in
  //       challenges feed as declined
};

module.exports.complete = function () {
  // TODO: call strava api, get user's time for the correct segment
  // TODO: update challenge with the effort time (and other details, if necessary)
  // TODO: update wins, losses, and challenge count for both users
    // Need to access the correct friend from user's friends array
};

module.exports.getChallenges = function (user, status, callback) {
  Challenge.find()
    .and([{ 
      $or: [{ challengerId: user }, { challengeeId: user }],
      $and: [{ status: status }]
    }])
    .exec(function (err, challenges) {
      if (err) {
        callback(err);
      } else {
        callback(null, challenges);
      }
    });
};