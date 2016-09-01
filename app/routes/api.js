var Challenges = require('../models/challenges');
var Users = require('../models/users');
var strava = require('../strava');

module.exports = function(app, express) {
  var apiRouter = express.Router();

  // Gets all users
  apiRouter.route('/users')
  .get(function(req, res) {
    strava.getAllUsers(function (err, users) {
      if (err) {
        res.status(500).json({error: 'Error retrieving all users: ' + err});
      } else {
        res.json(users);
      }
    });
  });

  // Gets specific user
  apiRouter.route('/users/:user_id')
  .get(function(req, res) {
    strava.getUser(req.params.user_id, function (err, user) {
      if (err) {
        res.status(500).json({error: 'Error retrieving user: ' + err});
      } else {
        res.json(user);
      }
    });
  });

  // Gets friends for a user
  apiRouter.route('/friends/:user_id')
  .get(function (req, res) {
    var userId = req.params.user_id;
    strava.getFriendsFromDb(userId, function (err, friends) {
      if (err) {
        res.status(500).json({error: 'Error retrieving friends: ' + err});
      } else {
        res.json(friends);
      }
    });
  });

  // Gets all challenges
  apiRouter.route('/challenges')
  .get(function(req, res) {
    strava.getAllChallenges(function (err, challenges) {
      if (err) {
        res.status(500).json({error: 'Error retrieving all challenges: ' + err});
      } else {
        res.json(challenges);
      }
    });
  });

  // Gets specific challenge
  apiRouter.route('/challenges/:challenge_id')
  .get(function(req, res) {
    strava.getChallenge(req.params.challenge_id, function (err, challenge) {
      if (err) {
        res.status(500).json({error: 'Error retrieving challenge: ' + err});
      } else {
        res.json(challenge);
      }
    });
  });

  // Gets active challenges for a user
  apiRouter.route('/challenges/active/:user_id')
  .get(function(req, res) {
    Challenges.getChallenges(req.params.user_id, 'active',
      function (err, challenges) {
        if (err) {
          res.status(500).json({error: 'Error retrieving challenges: ' + err});
        } else {
          res.json(challenges);
        }
    });
  });

  // Gets pending challenges for a user
  apiRouter.route('/challenges/pending/:user_id')
  .get(function(req, res) {
    Challenges.getChallenges(req.params.user_id, 'pending',
      function (err, challenges) {
        if (err) {
          res.status(500).json({error: 'Error retrieving challenges: ' + err});
        } else {
          res.json(challenges);
        }
    });
  });

  // Gets completed challenges for a user
  apiRouter.route('/challenges/completed/:user_id')
  .get(function(req, res) {
    Challenges.getChallenges(req.params.user_id, 'complete',
      function (err, challenges) {
        if (err) {
          res.status(500).send('Error retrieving challenges: ' + err);
        } else {
          res.json(challenges);
        }
    });
  });

  // Creates a new challenge
  apiRouter.route('/challenges/create')
  .post(function (req, res) {
    var challenge = req.body;
    Challenges.create(challenge,
      function (err, raw) {
        if (err) {
          res.status(500).json({error: 'Error creating challenges: ' + err});
        } else {
          res.json(raw);
        }
    });
  });

  // Accepts a pending challenge
  apiRouter.route('/challenges/accept')
  .post(function (req, res) {
    Challenges.accept(req.body, function (err, raw) {
      if (err) {
        res.status(500).json({error: 'Error accepting challenge: ' + err});
      } else {
        res.json({body: 'challenge accepted: ' + !!raw.nModified});
      }
    });
  });

  // Declines a pending challenge
  apiRouter.route('/challenges/decline')
  .post(function (req, res) {
    var challenge = req.body;
    Challenges.decline(challenge, function (err, raw) {
      if (err) {
        res.status(500).json({error: 'Error accepting challenge: ' + err})
      } else {
        res.json({body: 'challenge declined: ' + !!raw.nModified});
      }
    });
  });

  // Completes a challenge for the user
  apiRouter.route('/challenges/complete')
  .post(function (req, res) {
    strava.getSegmentEffort(req.body,
      function (err, effort) {
      if (err) {
        res.status(500).json({error: 'Error completing challenge: ' + err});
      } else {
        res.json({challenge: 'complete: ' + effort});
      }
    });
  });

  // Gets athlete from strava
  apiRouter.route('/athletes/:athlete_id')
  .get(function(req, res) {
    strava.getAthlete(req.params.athlete_id,
      function(err, athlete) {
        if(err) {
          res.status(500).json({error: 'error getting athlete from strava: ' + err});
        } else {
          res.json(athlete);
        }
      });
  });

  // Get an athletes segments from strava
  apiRouter.route('/athletes/:athlete_id/segments')
  .get(function(req, res) {
    strava.getUser(req.params.athlete_id, function(err, user) {
      if(err) {
        res.status(500).json({error: 'error getting athlete from DB: ' + err});
      } else {
        strava.getSegmentsFromStrava(user._id, user.token, function(err) {
          if (err) {
            res.status(500).json({error: 'error getting segments from strava: ' + err});
          } else {
            strava.getStarredSegmentsFromStrava(user._id, user.token, function(err) {
              if (err) {
                res.status(500).json({error: 'error getting starred segments from strava: ' + err});
              } else {
                res.send('updated segments for ' + user._id);
              }
            });
          }
        });
      }
    });
  });

  // Get an athletes friends from strava
  apiRouter.route('/athletes/:athlete_id/friends')
  .get(function(req, res) {
    strava.getUser(req.params.athlete_id,
      function(err, user) {
        if(err) {
          res.status(500).json({error: 'error getting athlete from DB: ' + err});
        } else {
          Users.getFriendsFromStrava(user._id, user.token, function(err) {
            if(err) {
              res.status(500).json({error: 'error getting athlete friends from strava: ' + err});
            }
          });
          res.send('updated friends for ' + user._id);
        }
      });
  });

  // Gets all segments
  apiRouter.route('/segments')
  .get(function(req, res) {
    strava.getAllSegments(function (err, segments) {
      if (err) {
        res.status(500).json({error: 'Error retrieving all segments: ' + err});
      } else {
        res.json(segments);
      }
    });
  });

  // Gets a specific segment
  // if a segment is found in DB it is returned
  // if segment not found in DB it is
  // requested from Stava, stored, and returned
  apiRouter.route('/segments/:segment_id')
  .get(function(req, res) {
    strava.getSegment(req.params.segment_id,
      function(err,segment) {
        if(err) {
          res.status(500).json({error: 'error getting segment: ' + err});
        } else {
          res.json(segment);
        }
      });
  });

  // Gets a specific effort from Strava API
  apiRouter.route('/efforts/:effort_id')
  .get(function(req, res) {
    var effort_id = parseInt(req.params.effort_id);
    strava.getEffort(effort_id,
      function(err,effort) {
        if(err) {
          res.status(500).json({error: 'error getting effort from stava: ' + err});
        } else {
          res.json(effort);
        }
      });
  });

  return apiRouter;
};
