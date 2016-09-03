var StravaStrategy = require('passport-strava-oauth2').Strategy;
var Users = require('../models/users');
var strava = require('../strava');

module.exports = function(app, express, passport) {
var STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
var STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Strava profile is
//   serialized and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Use the StravaStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Strava
//   profile), and invoke a callback with a user object.
passport.use(new StravaStrategy({
    clientID: STRAVA_CLIENT_ID,
    clientSecret: STRAVA_CLIENT_SECRET,
    callbackURL: "/auth/strava/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      // To keep the example simple, the user's Strava profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Strava account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }));

  var authRouter = express.Router();

  authRouter.use('/', passport.authenticate('strava'));
  // GET /auth/strava
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request.  The first step in Strava authentication will involve
  //   redirecting the user to strava.com.  After authorization, Strava
  //   will redirect the user back to this application at /auth/strava/callback
  authRouter.route('/strava')
  .get(function() {
    // The request will be redirected to Strava for authentication, so this
    // function will not be called.
  });

  authRouter.route('/strava/callback')
  .get(function(req, res) {
    var userToken = req.user.token;
    var userId = req.user.id;
    var profile = req.user;
    res.redirect('../../loggedIn.html?oauth_token=' + userToken + '&userId=' + userId);
    Users.registerAthlete(profile, function(err) {
      if (err) {
        console.error(err);
      } else {
        Users.getFriendsFromStrava(profile.id, profile.token, function(err) {
          if (err) {
            console.error(err);
          } else {
            strava.getSegmentsFromStrava(profile.id, profile.token, function(err, res) {
              if (err) {
                console.error(err);
              } else {
                console.log(res);
              }
            });
            strava.getStarredSegmentsFromStrava(profile.id, profile.token, function(err, res) {
              if(err) {
                console.error(err);
              } else {
                console.log(res);
              }
            });
          }
        });
      }
    });
  });

  return authRouter;
};
