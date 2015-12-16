var strava = require('strava-v3');
var util = require('./util');
var Users = require('./models/users');
var Challenges = require('./models/challenges');
var Segments = require('./models/segments');

function registerAthlete(stravaCode, callback) {
  console.log('Registering athlete with code ' + stravaCode);
  // Exchange the temporary code for an access token.
  strava.oauth.getToken(stravaCode, function(err, payload) {
    if (err) {
      callback(err);
    } else {
      // Save athlete information to the database.
      var athlete = payload.athlete;
      athlete.token = payload.access_token;
      Users.registerAthlete(athlete, callback);
      setTimeout(getFriendsFromStrava(athlete.id), 5000);
    }
  });
}

function getOAuthRequestAccessUrl() {
  console.log('Generating OAuth request access URL');
  var accessUrl = strava.oauth.getRequestAccessURL({});
  console.log("Access URL: " + accessUrl);
  return accessUrl;
}

function getAthlete(athleteId, callback) {
  strava.athletes.get( {id: athleteId}, function(err, athlete) {
    if (err) {
      console.log("Received error from athlete.get service:\n" + util.stringify(err));
      callback(err);
    } else {
      console.log("Received athlete data:\n" + util.stringify(athlete));
      callback(null, athlete);
    }
  });
}

function getSegment(segmentId, callback) {
  Segments.find({ _id: segmentId }, function (err, segment) {
    if (err) {
      callback(err);
    } // if not found send API request
    if (!segment[0]) {
      strava.segments.get( {id: segmentId}, function(err, segment) {
        if (err) {
          console.log("Received error from segment.get service:\n" + util.stringify(err));
          callback(err);
        } else {
          console.log("Received segment data:\n" + util.stringify(segment));
          Segments.saveSegment(segment, callback);
        }
      }); // if found
    } else if (segment[0]) {
      callback(null, segment[0]);
    }
  });
}

function getAllSegments(callback) {
  Segments.find({}, function (err, segments) {
    if (err) {
      callback(err);
    }
    if (segments.length) {
      callback(null, segments);
    }
  });
}

function getEffort(effortId, callback) {
  strava.segmentEfforts.get( {id: effortId}, function(err, effort) {
    if (err) {
      console.log("Received error from effort.get service:\n" + util.stringify(err));
      callback(err);
    } else {
      console.log("Received effort data:\n" + util.stringify(effort));
      callback(null, effort);
    }
  });
}

function getAllUsers(callback) {
  Users.find({}, function (err, users) {
    if (err) {
      callback(err);
    }
    if (users.length) {
      callback(null, users);
    }
  });
}

function getUser(id, callback) {
  Users.find({ _id: id }, function (err, user) {
    if (err) {
      callback(err);
    }
    if (!user[0]) {
      callback(null, 'User ' + id + ' not found!');
    } else if (user[0]) {
      callback(null, user[0]);
    }
  });
}

function getFriendsFromDb (id, callback) {
  Users.find({ _id: id }, function (err, users) {
    if (err) {
      callback(err);
    }
    if (!users.length) {
      callback(null, 'User ' + id + ' not found');
    } else if (users.length) {
      callback(null, users[0].friends);
    }
  });
}

function getFriendsFromStrava (id) {
  strava.athletes.listFriends({ id: id }, function (err, friends) {
    if (err) {
      console.error('Error retrieving friends', err);
    }
    friends = friends.map(function(friend) {
      return {
        id: friend.id,
        username: friend.username, 
        firstname: friend.firstname, 
        lastname: friend.lastname,
        photo: friend.profile,
        challengeCount: 0,
        wins: 0,
        losses: 0
      };
    });
    Users.saveFriends(id, friends);
  });
}

function getSegmentEffort (challenge, callback) {
  Challenges.find({ _id: challenge.id }, function (err, challenges) {
    if (err) {
      callback(err);
    } else if (!challenges.length) {
      callback('No challenge found');
    } else if (challenges.length) {
      challenge.segmentId = challenges[0].segmentId;
      challenge.start = challenges[0].created;
      challenge.end = challenges[0].expires;

      strava.segments.listEfforts({
        // id: challenge.segmentId,
        id: 10864730,    // *** DEV ***
        athlete_id: challenge.userId,
        // start_date_local: challenge.start,
        start_date_local: '2015-12-09T00:00:00.000Z',    // *** DEV ***
        // end_date_local: challenge.end
        end_date_local: '2015-12-09T23:23:59.999Z'    // **** DEV ****
      }, function (err, efforts) {
        if (err) {
          console.error('Error getting segment efforts:', err);
        }
        if (!efforts) {
          callback(null, 'No effort found');
        } else {
          // Strava returns the best effort first if there are multiple efforts
          Challenges.complete(challenge, efforts[0], callback);
        }
      });
    }
  });
}

function getAllChallenges(callback) {
  Challenges.find({}, function (err, challenges) {
    if (err) {
      callback(err);
    }
    if (challenges.length) {
      callback(null, challenges);
    }
  });
}

function getChallenge(id, callback) {
  Challenges.find({ _id: id }, function (err, challenge) {
    if (err) {
      callback(err);
    }
    if (!challenge[0]) {
      callback(null, 'challenge ' + id + ' not found!');
    } else if (challenge[0]) {
      callback(null, challenge[0]);
    }
  });
}

module.exports = {
  registerAthlete: registerAthlete,
  getOAuthRequestAccessUrl: getOAuthRequestAccessUrl,
  getAthlete: getAthlete,
  getSegment: getSegment,
  getAllSegments: getAllSegments,
  getEffort: getEffort,
  getAllUsers: getAllUsers,
  getUser: getUser,
  getFriendsFromDb: getFriendsFromDb,
  getSegmentEffort: getSegmentEffort,
  getAllChallenges: getAllChallenges,
  getChallenge: getChallenge
};