var mongoose = require('../db');
var Users = require('./users');
var Segments = require('./segments');

var challengeSchema = mongoose.Schema({ 
  segmentId: { type: Number, required: true },
  segmentName: { type: String, required: true },
  segmentDistance: Number,
  segmentAverageGrade: Number,
  segmentElevationGain: Number,
  segmentClimbCategory: Number,
  segmentCity: String,
  segmentState: String,
  segmentCountry: String,
  challengerId: { type: Number, required: true },
  challengeeId: { type: Number, required: true },
  challengerName: String,
  challengeeName: String,
  challengerTime: Number,
  challengeeTime: Number,
  challengerCompleted: { type: Boolean, default: false },
  challengeeCompleted: { type: Boolean, default: false },
  challengerAvgCadence: Number,
  challengeeAvgCadence: Number,
  challengerAvgWatts: Number,
  challengeeAvgWatts: Number,
  challengerAvgHeartrate: Number,
  challengeeAvgHeartrate: Number,
  challengerMaxHeartRate: Number,
  challengeeMaxHeartRate: Number,
  status: { type: String, default: 'pending' },
  created: { type: Date, default: Date.now },
  expires: Date,
  winnerId: Number,
  winnerName: String,
  loserId: Number,
  loserName: String
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
      saveSegmentToChallenge(res.id, challenge.segmentId);
    }
  });
};

function saveSegmentToChallenge (challengeId, segmentId) {
  Segments.find({ _id: segmentId }, function (err, res) {
    if (err) console.error('error', err);
    if (res.length) {
      var segment = res[0];
      Challenge.update({ _id: challengeId },
        {
          segmentDistance: segment.distance,
          segmentAverageGrade: segment.averageGrade,
          segmentElevationGain: segment.totalElevationGain,
          segmentClimbCategory: segment.climbCategory,
          segmentCity: segment.city,
          segmentState: segment.state,
          segmentCountry: segment.country
        },
        function (err, raw) {
          if (err) console.error(err);
          console.log('Updated challenge with segment details:', raw);
        });
    }
  });

}

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
          // callback(null, 'Updated challenge with user effort: ' + res);
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
          // callback(null, 'Updated challenge with user effort: ' + res);
        }
      });
    }
    setTimeout(checkForWinner(challenge.id, callback), 5000);
  });
  // Checks if the challenge has a winner; waits 5 seconds to allow for effort to be saved to DB
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
      ]
    }])
    .exec(function (err, challenges) {
      if (err) {
        callback(err);
      } else {
        callback(null, challenges);
      }
    });
  } else if (status === 'pending') {
    Challenge.find()
    .and([{ 
      $or: [
        { challengeeId: user, status: 'pending' },
        { challengerId: user, status: 'pending' }
      ]
    }])
    .exec(function (err, challenges) {
      if (err) {
        callback(err);
      } else {
        if (challenges.length) {
          callback(null, challenges);
        }
      }
    });
  }
};

function checkForWinner (challengeId, callback) {
  Challenge
  .find({ _id: challengeId })
  .then(function (challenges) {
    var challenge = challenges[0],
        winner;
    // If challenge is complete
    if (challenge.challengerTime && challenge.challengeeTime) {
      if (challenge.challengerTime === challenge.challengeeTime) {
        // TODO: Handle a tie
        callback(null, 'tie');
      } else {
        winner = challenge.challengerTime < challenge.challengeeTime ? 'challenger' : 'challengee';
      }
      // Update wins or losses and challenge count for both users
      if (winner === 'challenger') {
        Users.incrementWins(challenge.challengerId, challenge.challengeeId);
        Users.incrementLosses(challenge.challengeeId, challenge.challengerId);
        updateChallengeWinnerAndLoser(challengeId, challenge.challengerId,
          challenge.challengerName, challenge.challengeeId, challenge.challengeeName, callback);
      } else if (winner === 'challengee') {
        Users.incrementWins(challenge.challengeeId, challenge.challengerId);
        Users.incrementLosses(challenge.challengerId, challenge.challengeeId);
        updateChallengeWinnerAndLoser(challengeId, challenge.challengeeId, 
          challenge.challengeeName, challenge.challengerId, challenge.challengerName, callback);
      }
      // Updates challenge status to 'Complete'
      Challenge.update({ _id: challengeId }, { status: 'complete' }, function (err, raw) {
        if (err) {
          console.error('Error updating challenge status to \'Complete\'');
        }
      });
      // callback(null, 'effort has been updated, winner has been calculated');
    } else {
      callback(null, 'Effort has been updated, waiting for other user to complete');
    }
  });
}

function updateChallengeWinnerAndLoser (challengeId, winnerId, winnerName, loserId, loserName, cb) {
  Challenge.update({ _id: challengeId},
    {
      winnerId: winnerId,
      winnerName: winnerName,
      loserId: loserId,
      loserName: loserName
    },
    function (err, raw) {
      if (err) {
        console.error('Error updating challenge winner/loser:', err);
      } else {
        cb(null, 'Challenge updated with winner and loser');
      }
    });
}