var passport = require('passport');
var StravaStrategy = require('passport-strava-oauth2').Strategy;
var jwt = require('jsonwebtoken');
var methodOverride = require('method-override'),
    session        = require('express-session'),
    expressJwt     = require('express-jwt');
var Users = require('../models/users');
var strava = require('../strava');

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Strava profile is
//   serialized and deserialized.
var STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
var STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

var userId;

// Use the StravaStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Strava
//   profile), and invoke a callback with a user object.

module.exports = function(app, express, passport) {
  passport.use(new StravaStrategy({
      clientID: STRAVA_CLIENT_ID,
      clientSecret: STRAVA_CLIENT_SECRET,
      callbackURL: "/auth/strava/callback"
    },
    function(accessToken, refreshToken, profile, done) {
      // asynchronous verification, for effect...
      process.nextTick(function () {
        userId = profile.id;
        Users.registerAthlete(profile, function() {});
        setTimeout(function() {
          strava.getSegmentsFromStrava(profile.id, profile.token);
          Users.getFriendsFromStrava(profile.id, profile.token);
        }, 1000);
        setTimeout(function() {
          strava.getStarredSegmentsFromStrava(profile.id, profile.token);
        }, 2500);
        // To keep the example simple, the user's Strava profile is returned to
        // represent the logged-in user.  In a typical application, you would want
        // to associate the Strava account with a user record in your database,
        // and return that user instead.
        return done(null, profile);
      });
    }
  ));

  var authRouter = express.Router();

  authRouter.use('/', passport.authenticate('strava'));
  // GET /auth/strava
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request.  The first step in Strava authentication will involve
  //   redirecting the user to strava.com.  After authorization, Strava
  //   will redirect the user back to this application at /auth/strava/callback
  authRouter.route('/strava')
    .get(function(req, res) {
      // The request will be redirected to Strava for authentication, so this
      // function will not be called.
    });

  authRouter.route('/strava/callback')
    .get(function(req, res) {
      var userToken = req.query.code; //remember the user should save this, db needs do nothing with it
      var month = 43829;
      var server_token = jwt.sign({id: userId}, process.env.SECRET || "secret", { expiresIn: month });

      res.redirect('../../loggedIn.html?oauth_token=' + server_token + '&userId=' + userId);
    });

  return authRouter;
};

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}