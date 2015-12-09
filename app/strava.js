var strava = require('strava-v3');
var Users = require('./models/users.js');

function registerAthlete(stravaCode, callback) {
  console.log('Registering athlete with code ' + stravaCode);
  // Exchange the temporary code for an access token.
  strava.getOAuthToken(stravaCode, function(err, payload) {
    if (err) {
      callback(err);
    } else {
      // Save athlete information to the database.
      var athlete = payload.athlete;
      var token = payload.access_token;
      Users.create(athlete.id, athlete.firstname + ' ' + athlete.lastname);
      // Users.create(athlete.id, athlete.name, function(err) {
      //   if (err) callback(err);
      //   else db.saveAthleteToken(athlete.id, token, function(err) {
      //     callback(err);
      //   });
      // });
    }
  });
}

function getOAuthRequestAccessUrl() {
  console.log('Generating OAuth request access URL');
  var accessUrl = strava.oauth.getRequestAccessURL({});
  console.log("Access URL: " + accessUrl);
  return accessUrl;
}

module.exports = {
  registerAthlete: registerAthlete,
  getOAuthRequestAccessUrl: getOAuthRequestAccessUrl
};