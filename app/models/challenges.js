var mongoose = require('../db');
var Users = require('./users');

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
    // TODO: Handle due date
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

module.exports.complete = function (challenge, effort, callback) {
  // Refactor code to pass the challenger/challengee role of user when API is called
  // to save us this extra request to the database
  Challenge.find({ _id: challenge.id }, function (err, challenges) {
    if (!challenges.length) {
      console.error('No challenges found');
    }
  })
  .then(function (result) {
    var userRole = challenge.challengerId === effort.athlete.id ? 'challenger' : 'challengee';
    if (userRole === 'challenger') {
      Challenge.update({ _id: challenge.id }, { challengerTime: effort.elapsed_time }, function (err, res) {
        if (err) {
          callback('Error updating challenge with user effort: ' + err);
        } else {
          callback(null, 'Updated challenge with user effort: ' + res);
        }
      });
    } else if (userRole === 'challengee') {
      Challenge.update({ _id: challenge.id }, { challengeeTime: effort.elapsed_time }, function (err, res) {
        if (err) {
          callback('Error updating challenge with user effort: ' + err);
        } else {
          callback(null, 'Updated challenge with user effort: ' + res);
        }
      });
    } else {
      console.error('userRole var was not set correctly in challenges.js line 55');
    }
  });
  // Checks if the challenge has a winner; waits 5 seconds to allow for effort to be saved to DB
  setTimeout(checkForWinner(challenge.id), 5000);
};

module.exports.getChallenges = function (user, status, callback) {
  Challenge
  .find()
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

function checkForWinner (challengeId) {
  Challenge
  .find({ _id: challengeId })
  .then(function (challenges) {
    var challenge = challenges[0],
        winner;
    // If challenge is complete
    if (challenge.challengerTime && challenge.challengeeTime) {
      if (challenge.challengerTime === challenge.challengeeTime) {
        // TODO: Handle a tie
      } else {
        winner = challenge.challengerTime < challenge.challengeeTime ? 'challenger' : 'challengee';
      }
      // Update wins or losses and challenge count for both users
      if (winner === 'challenger') {
        Users.incrementWins(challenge.challengerId, challenge.challengeeId);
        Users.incrementLosses(challenge.challengeeId, challenge.challengerId);
      } else if (winner === 'challengee') {
        Users.incrementWins(challenge.challengeeId, challenge.challengerId);
        Users.incrementLosses(challenge.challengerId, challenge.challengeeId);
      }
      Challenge.update({ _id: challengeId }, { status: 'complete' }, function (err, raw) {
        if (err) {
          console.error('Error updating challenge status to \'Complete\'');
        }
        console.log('Challenge has been completed by both users:', raw);
      });
    }
    // Updates challenge status to 'Complete'
  });
};