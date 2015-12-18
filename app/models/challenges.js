var mongoose = require('../db');
var Users = require('./users');

var challengeSchema = mongoose.Schema({ 
  segmentId: { type: Number, required: true },
  segmentName: { type: String, required: true },
  segmentDistance: { type: Number },
  segmentAverageGrade: { type: Number },
  segmentMaxGrade: { type: Number },
  segmentElevationHigh: { type: Number },
  segmentElevationLow: { type: Number },
  segmentClimbCategory: { type: Number },
  challengerId: { type: Number, required: true },
  challengeeId: { type: Number, required: true },
  challengerName: { type: String },
  challengeeName: { type: String },
  challengerTime: { type: Number },
  challengeeTime: { type: Number },
  challengerCompleted: { type: Boolean, default: false },
  challengeeCompleted: { type: Boolean, default: false },
  challengerAvgCadence: { type: Number },
  challengeeAvgCadence: { type: Number },
  challengerAvgWatts: { type: Number },
  challengeeAvgWatts: { type: Number },
  challengerAvgHeartrate: { type: Number },
  challengeeAvgHeartrate: { type: Number },
  challengerMaxHeartRate: { type: Number },
  challengeeMaxHeartRate: { type: Number },
  status: { type: String, default: 'pending' },
  created: { type: Date, default: Date.now },
  expires: { type: Date },
});

var Challenge = mongoose.model('Challenge', challengeSchema);

module.exports = Challenge;

module.exports.create = function (challenge) {
  var newChallenge = new Challenge({
    segmentId: challenge.segmentId,
    segmentName: challenge.segmentName,
    challengerId: challenge.challengerId,
    challengerName: challenge.challengerName,
    challengeeId: challenge.challengeeId,
    challengeeName: challenge.challengeeName,
    expires: new Date(challenge.completionDate).toISOString()
  });
  newChallenge.save(function (err, res) {
    if (err) {
      console.error('Error creating challenge:', err);
    } else {
      console.log('Challenge created:', res);
    }
  });
};

module.exports.accept = function (challenge, callback) {
  Challenge.update({ _id: challenge.id }, { status: 'active' }, function (err, raw) {
    if (err) {
      callback(err);
    } else {
      callback(null, JSON.stringify(raw));
    }
  });
};

module.exports.decline = function (challenge, callback) {
  Challenge.find({ _id: challenge.id })
  .remove(function(err, raw) {
    if (err) {
      callback(err);
    } else {
      callback(null, JSON.stringify(raw));
    }
  });
};

module.exports.complete = function (challenge, effort, callback) {
  // Can refactor code to pass the challenger/challengee role of user when
  // API is called to save us this extra request to the database
  Challenge.find({ _id: challenge.id }, function (err, challenges) {
    if (!challenges.length) {
      console.error('No challenges found');
    }
  })
  .then(function (result) {
    var userRole = challenge.challengerId === effort.athlete.id ? 'challenger' : 'challengee';
    if (userRole === 'challenger') {
      Challenge.update({ _id: challenge.id },
        { 
          challengerTime: effort.elapsed_time,
          challengerCompleted: true,
          challengerAvgCadence: effort.average_cadence,
          challengerAvgWatts: effort.average_watts,
          challengerAvgHeartrate: effort.average_heartrate,
          challengerMaxHeartRate: effort.max_heartrate,
          segmentDistance: effort.segment.distance,
          segmentAverageGrade: effort.segment.average_grade,
          segmentMaxGrade: effort.segment.maximum_grade,
          segmentElevationHigh: effort.segment.elevation_high,
          segmentElevationLow: effort.segment.elevation_low,
          segmentClimbCategory: effort.segment.climb_category
        }, function (err, res) {
        if (err) {
          callback('Error updating challenge with user effort: ' + err);
        } else {
          callback(null, 'Updated challenge with user effort: ' + res);
        }
      });
    } else if (userRole === 'challengee') {
      Challenge.update({ _id: challenge.id }, 
        { 
          challengeeTime: effort.elapsed_time,
          challengeeCompleted: true,
          challengeeAvgCadence: effort.average_cadence,
          challengeeAvgWatts: effort.average_watts,
          challengeeAvgHeartrate: effort.average_heartrate,
          challengeeMaxHeartRate: effort.max_heartrate,
          segmentDistance: effort.segment.distance,
          segmentAverageGrade: effort.segment.average_grade,
          segmentMaxGrade: effort.segment.maximum_grade,
          segmentElevationHigh: effort.segment.elevation_high,
          segmentElevationLow: effort.segment.elevation_low,
          segmentClimbCategory: effort.segment.climb_category
        }, function (err, res) {
        if (err) {
          callback('Error updating challenge with user effort: ' + err);
        } else {
          callback(null, 'Updated challenge with user effort: ' + res);
        }
      });
    }
  });
  // Checks if the challenge has a winner; waits 5 seconds to allow for effort to be saved to DB
  setTimeout(checkForWinner(challenge.id), 5000);
};

module.exports.getChallenges = function (user, status, callback) {
  if (status === 'complete') {
    Challenge
    .find()
    .and([{ 
      $or: [
        { challengerId: user, challengerCompleted: true },
        { challengeeId: user, challengeeCompleted: true }
      ],
    }])
    .exec(function (err, challenges) {
      if (err) {
        callback(err);
      } else {
        callback(null, challenges);
      }
    });
  } else if (status === 'active') {
    Challenge
    .find()
    .and([{ 
      $or: [
        { challengerId: user, challengerCompleted: false, status: status },
        { challengeeId: user, challengeeCompleted: false, status: status }
      ],
    }])
    .exec(function (err, challenges) {
      if (err) {
        callback(err);
      } else {
        callback(null, challenges);
      }
    });
  }
};

function checkForWinner (challengeId) {
  Challenge
  .find({ _id: challengeId })
  .then(function (challenges) {
    var challenge = challenges[0],
        winner;
    // If challenge is complete
    console.log('***', challenge.challengerTime, challenge.challengeeTime);
    if (challenge.challengerTime && challenge.challengeeTime) {
      console.log('hi');
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
      // Updates challenge status to 'Complete'
      Challenge.update({ _id: challengeId }, { status: 'complete' }, function (err, raw) {
        if (err) {
          console.error('Error updating challenge status to \'Complete\'');
        }
        console.log('Challenge has been completed by both users:', raw);
      });
    }
  });
}