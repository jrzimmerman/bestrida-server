var bodyParser = require('body-parser');
var Promise = require('bluebird');
var Users = Promise.promisifyAll(require('../models/users'));
var Efforts = Promise.promisifyAll(require('../models/efforts'));
var Segments = Promise.promisifyAll(require('../models/segments'));
var Challenges = Promise.promisifyAll(require('../models/challenges'));
var strava = require('../strava');
var util = require('./../util');

module.exports = function(app, express) {
  var apiRouter = express.Router();

  // users route
  apiRouter.route('/users')
    .get(function(req, res) {
      strava.getAllUsers(function (err, users) {
        if (err) {
          console.error('Error retrieving all users:', err);
        } else {
          res.json(users);
        }
      });
    });

  // specific user route
  apiRouter.route('/users/:user_id')
    .get(function(req, res) {
      strava.getUser(req.params.user_id, function (err, user) {
        if (err) {
          console.error('Error retrieving user:', err);
        } else {
          res.json(user);
        }
      });
    });

  // get friends for a user
  apiRouter.route('/friends/:user_id')
    .get(function (req, res) {
      var userId = req.params.user_id;
      strava.getFriendsFromDb(userId, function (err, friends) {
        if (err) {
          console.error('Error retrieving friends;', err);
        } else {
          res.json(friends);
        }
      });
    });

  // challenges route
  apiRouter.route('/challenges')
    .get(function(req, res) {
      res.json({ message: 'this returns all challenges!' });   
    });

  // specific challenge route
  apiRouter.route('/challenges/:challenge_id')
    .get(function(req, res) {
      res.json({ message: 'this is a specific challenge!' });   
    });

  // active challenges for a specific user
  apiRouter.route('/challenges/active/:user_id')
    .get(function(req, res) {
      var userId = parseInt(req.params.user_id);
      Challenges.getChallenges(userId, 'active', function (err, challenges) {
        if (err) {
          console.error('Error retrieving challenges:', err);
        } else {
          res.json(challenges);
        }
      })
    });

  // completed challenges for a specific user
  apiRouter.route('/challenges/completed/:user_id')
    .get(function(req, res) {
      var userId = parseInt(req.params.user_id);
      Challenges.getChallenges(userId, 'complete', function (err, challenges) {
        if (err) {
          console.error('Error retrieving challenges:', err);
        } else {
          res.json(challenges);
        }
      })
    });

  apiRouter.route('/challenges/create')
    .post(function (req, res) {
      var challenge = req.body;
      Challenges.create(challenge);
      // TODO: What do we do with user after challenge has been created?
      // res.send('challenge received');
    });

  // specific athlete route
  apiRouter.route('/athletes/:athlete_id')
    .get(function(req, res) {
      var athlete_id = parseInt(req.params.athlete_id);
      strava.getAthlete(athlete_id,
        function(err,payload) {
          if(!err) {
            res.json(payload);
          } else {
            console.log(err);
          }
        });
    });

    ////////////////////////////////
    // Display information available for a specific athlete.
    // app.get('/athlete/:id', function(req, res) {
    //   var athleteId = parseInt(req.params.id);

    //   if (isNaN(athleteId)) {
    //     var description = 'Athlete identifier is missing';
    //     console.log(description);
    //     sendErrorMessage(res, description);
    //   } else db.getItems('athletes', { id : athleteId }, function(err, athletes) {
    //     if (err) sendError(res);
    //     else db.getItems('activites', { athleteId : athleteId }, function(err, activities) {
    //       if (err) sendError(res);
    //       else res.render('athlete.handlebars', {
    //         athlete: athletes[0],
    //         activities: activities
    //       });
    //     });
    //   });
    // });
    ////////////////////////////////

  // segments route
  apiRouter.route('/segments')
    .get(function(req, res) {
      res.json({ message: 'this returns all segments!' });   
    });

  // specific segment route
  apiRouter.route('/segments/:segment_id')
    .get(function(req, res) {
      var segment_id = parseInt(req.params.segment_id);
      strava.getSegment(segment_id,
        function(err,payload) {
          if(!err) {
            res.json(payload);
          } else {
            console.log(err);
          }
        });
    });

  // efforts route
  apiRouter.route('/efforts')
    .get(function(req, res) {
      res.json({ message: 'this returns all efforts!' });   
    });

  // specific segment effort route
  apiRouter.route('/efforts/:effort_id')
    .get(function(req, res) {
      var effort_id = parseInt(req.params.effort_id);
      strava.getEffort(effort_id,
        function(err,payload) {
          if(!err) {
            res.json(payload);
          } else {
            console.log(err);
          }
        });
    });

  // register/login route
  apiRouter.route('/register')
    .get(function(req, res) {
      // Redirect the browser to the Strava OAuth grant page.
      res.redirect(strava.getOAuthRequestAccessUrl());
    });

  // Handle the OAuth callback from Strava, and exchange the temporary code for an access token.
  apiRouter.route('/registercode')
    .get(function(req, res) {
      var stravaCode = req.query.code;

      if (stravaCode === null) {
        var description = 'Query parameter "code" is missing';
        console.log(description);
        sendErrorMessage(res, description);
      } else {
        strava.registerAthlete(stravaCode,
          function (err, user) {
            if (err) {
              console.error('Error registering athlete:', err);
            }
          });
      }
    });

  // Directly register a bearer token.  Primarily useful in a development setting.
  apiRouter.route('/registertoken')
    .get(function(req, res) {
      var stravaToken = req.query.token;
      if (stravaToken === null) {
        var description = 'Query parameter "token" is missing';
        console.log(description);
        sendErrorMessage(res, description);
      } else {
        registerAthleteToken(stravaToken, function(err) {
          if (err) sendErrorMessage(res, "Unable to register Strava token");
          else res.redirect('./');
        });
      }   
    });

  return apiRouter;
};