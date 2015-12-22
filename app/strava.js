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
      callback(null, payload);
      Users.registerAthlete(athlete, callback);
      setTimeout(getSegmentsFromStrava(athlete.id, athlete.token), 5000);
      setTimeout(Users.getFriendsFromStrava(athlete.id, athlete.token), 5000);
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
    if (!segment || !segment[0]) {
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
    if (!user || !user[0]) {
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

function getUserSegmentsFromDb (id, callback) {
  Users.find({ _id: id }, function (err, users) {
    if (err) {
      callback(err);
    }
    if (!users.length) {
      callback(null, 'User ' + id + ' not found');
    } else if (users.length) {
      callback(null, users[0].segments);
    }
  });
}

function getSegmentsFromStrava (userId, token) {
  strava.athlete.listActivities({ access_token: token }, function (err, activities) {
    if (err) {
      console.error('Error retrieving activities', err);
    }
    activities = activities.map(function(activity) {
      return {
        id: activity.id,
        name: activity.name,
      };
    });
    activities.forEach(function(activity) {
      strava.activities.get({id: activity.id}, function(err, oneActivity) {
        if (err) {
          console.error('Error retrieving activities', err);
        }
        if (oneActivity.hasOwnProperty('segment_efforts')) {
          oneActivity.segment_efforts.forEach(function(segment) {
            // Nested loop, consider alternatives
            var oneSegment = segment;

            // Check to see if oneSegment is in database
            Segments.find({ _id: oneSegment.segment.id }, function (err, segmentDB) {
              if (err) {
                console.log("Received error: ",err);
              } 
              // If segment not found in DB send API request to Strava
              if (!segmentDB[0]) {
                strava.segments.get( {id: oneSegment.segment.id}, function(err, segmentCall) {
                  if (err) {
                    console.log("Received error from segment.get service:\n" + util.stringify(err));
                  // If segment not found in segment collection, grab segment from Strava
                  } else {
                    Segments.saveSegment(segmentCall);
                    // Check if segment in user's segment obj
                    Users.where({_id: userId, "segments.id": segmentCall.id})
                    .exec(function(err, res) {
                      if(!res[0]) {
                        var userSegment = {
                            _id: segmentCall.id,
                            name: segmentCall.name,
                            count: 1
                          };
                        // May need to add a timeout to Users.saveSegments below to account
                        // for the time it takes to save a segment to a user on the database
                        // Occasionally it will create duplicate segments because the first
                        // segment is still in the process of being saved to DB and so it does
                        // not show up in DB yet, so when we query the DB to find it, it should
                        // be incrementing the segment count but because it hasn't saved yet, it
                        // saves a duplicate copy

                        // Ideally we would process the segments completely prior to saving them,
                        // i.e. incrementing counts, etc. and then save the entire segments array
                        // to the user. This would solve the issue we're having with the time it
                        // takes to save to the database
                        Users.saveSegments(userId, userSegment);
                      } else {
                        Users.incrementSegmentCount(userId, segmentCall.segment.id);
                      }
                    });
                  }
                });
              } else {
                // If segement is found in segment collection,
                // check if also stored in users' segments property
                Users.where({_id: userId, "segments.id": oneSegment.segment.id })
                .exec(function(err, res) {
                  if(!res[0]) {
                    var userSegment = {
                      id: oneSegment.segment.id,
                      name: oneSegment.segment.name,
                      count: 1
                    };
                    Users.saveSegments(userId, userSegment);
                  } else {
                    Users.incrementSegmentCount(userId, segment.segment.id);
                  }
                });
              }
            });
          });
        }
      });
    });
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
      challenge.challengerId = challenges[0].challengerId;
      challenge.challengeeId = challenges[0].challengeeId;

      /////////////////////////////////////////////
      // PRODUCTION-READY CODE
      //
      // strava.segments.listEfforts({
      //   id: challenge.segmentId,
      //   // *** DEV *** the dev code is pulling from one of justin's rides
      //   // id: 10864730,    // *** DEV ***
      //   athlete_id: challenge.userId,
      //   start_date_local: challenge.start,
      //   // start_date_local: '2015-12-09T00:00:00.000Z',    // *** DEV ***
      //   end_date_local: challenge.end
      //   // end_date_local: '2015-12-09T23:23:59.999Z'    // **** DEV ****
      // }, function (err, efforts) {
      //   if (err) {
      //     console.error('Error getting segment efforts:', err);
      //   }
      //   if (!efforts) {
      //     callback(null, 'No effort found');
      //   } else {
      //     // Strava returns the best effort first if there are multiple efforts
      //     Challenges.complete(challenge, efforts[0], callback);
      //   }
      // });
      //
      /////////////////////////////////////////////


      /////////////////////////////////////////////
      // FOR DEV PURPOSES ONLY
      /////////////////////////////////////////////
      var mockEffort = {
        elapsed_time: Math.floor(Math.random() * 1000),
        average_cadence: 1,
        average_watts: 1,
        average_heartrate: 1,
        max_heartrate: 1,
        segment: {
          distance: 1,
          average_grade: 1,
          maximum_grade: 1,
          elevation_high: 1,
          elevation_low: 1,
          climb_category: 1
        },
        athlete: {
          id: challenge.userId
        }
      };
      Challenges.complete(challenge, mockEffort, callback);
      /////////////////////////////////////////////
      // END OF DEV CODE
      /////////////////////////////////////////////
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
  getChallenge: getChallenge,
  getSegmentsFromStrava: getSegmentsFromStrava,
  getUserSegmentsFromDb: getUserSegmentsFromDb
};