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
      setTimeout(function() {
        getSegmentsFromStrava(athlete.id, athlete.token);
        Users.getFriendsFromStrava(athlete.id, athlete.token);
      }, 2000);
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
    console.log('User', userId, 'has', activities.length, 'recent activities.');
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
                    console.log('Retrieved segment', segmentCall.name, 'from Strava, saving to DB');
                    Segments.saveSegment(segmentCall);
                    // Check if segment in user's segment obj
                    Users.where({_id: userId, "segments.id": segmentCall.id})
                    .exec(function(err, res) {
                      if(!res[0]) {
                        console.log('User doesnt have segment, going to save it');
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
                  if (err) console.error(err);
                  if(!res[0]) {
                    console.log('Segment not found for the user, going to save it');
                    var userSegment = {
                      _id: oneSegment.segment.id,
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

function getStarredSegmentsFromStrava (userId, token) {
  strava.segments.listStarred({ access_token: token }, function(err, segments) {
    if (err) console.error('Error retrieving starred segments:', err);
    console.log('User', userId, 'has', segments.length, 'starred segments.');
    // Retrieve a user's current segments to see segments are already saved
    Users.find({ _id: userId }).select('segments')
    .then(function(currentSegments) {
      // Store user's current segment id's in userSegments object for constant-time lookup
      userSegments = {};
      // Save the id of each of the user's current segments into the object
      currentSegments[0].segments.forEach(function (seg) { userSegments[seg._id] = true; });

      // Iterate over segments retrieved from Strava
      segments.forEach(function(segment) {
        // Check to see if the segment is in database
        Segments.find({ _id: segment.id }, function (err, res) {
          if (err) console.error(err);
          // If segment not found in DB, get segment details from Strava and save to DB
          if (!res.length) {
            getAndSaveSegmentInfo(segment.id, userId);
          // Else (if segment is already in our DB, don't make Strava API call)
          } else if (res.length) {
            if (!userSegments[res[0].id]) {
              var userSegment = {
                _id: res[0].id,
                name: res[0].name,
                count: 1
              };
              Users.saveSegments(userId, userSegment);
            }
          }
        });
      });
    });
  });
  setTimeout(function() {
    sortSegments(userId);
  }, 3000);
}

function sortSegments (userId) {
  Users.find({ _id: userId }).select('segments')
  .then(function(segments) {
    segments = segments[0].segments;
    var sortedSegments = segments.sort(function(x, y) {
      return y.count - x.count;
    });
    // Update user with the sorted segments array
    Users.update({ _id: userId }, { segments: sortedSegments }, function (err, raw) {
      if (err) console.error(err);
      console.log(raw.nModified === 1 ? 'User segments were sorted' : 'No changes made to users\' segments ordering');
    });
  });
}

function getAndSaveSegmentInfo (segmentId, userId) {
  strava.segments.get({ id: segmentId }, function(err, segment) {
    if (err) {
      console.log("Received error from segment.get service:\n" + util.stringify(err));
    } else {
      var userSegment = {
        _id: segment.id,
        name: segment.name,
        count: 1
      };
      Segments.saveSegment(segment);
      setTimeout(function() {
        Users.saveSegments(userId, userSegment)
      }, 1000);
    }
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
      challenge.start = new Date(challenges[0].created).toISOString();
      challenge.end = new Date(challenges[0].expires).toISOString();
      challenge.challengerId = challenges[0].challengerId;
      challenge.challengeeId = challenges[0].challengeeId;

      strava.segments.listEfforts({
        id: challenge.segmentId,
        athlete_id: challenge.userId,
        start_date_local: challenge.start,
        end_date_local: challenge.end
      }, function (err, efforts) {
        if (err) {
          console.error('Error getting segment efforts:', err);
        }
        if (!efforts) {
          callback(null, 'No effort found');
        } else {
          console.log('efforts\n', efforts);
          // Strava returns the best effort first if there are multiple efforts
          Challenges.complete(challenge, efforts[0], callback);
        }
      });

      /////////////////////////////////////////////
      //          FOR DEV PURPOSES ONLY
      //
      //
      // var mockEffort = {
      //   elapsed_time: Math.floor(Math.random() * 1000),
      //   average_cadence: 1,
      //   average_watts: 1,
      //   average_heartrate: 1,
      //   max_heartrate: 1,
      //   segment: {
      //     distance: 1,
      //     average_grade: 1,
      //     maximum_grade: 1,
      //     elevation_high: 1,
      //     elevation_low: 1,
      //     climb_category: 1
      //   },
      //   athlete: {
      //     id: challenge.userId
      //   }
      // };
      // Challenges.complete(challenge, mockEffort, callback);
      //
      //
      //             END OF DEV CODE
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
  getStarredSegmentsFromStrava: getStarredSegmentsFromStrava,
  getUserSegmentsFromDb: getUserSegmentsFromDb
};