var strava = require('strava-v3');
var util = require('./util');
var Users = require('./models/users.js');

function registerAthlete(stravaCode, callback) {
  console.log('Registering athlete with code ' + stravaCode);
  // Exchange the temporary code for an access token.
  strava.oauth.getToken(stravaCode, function(err, payload) {
    if (err) {
      callback(err);
    } else {
      // Save athlete information to the database.
      var athlete = payload.athlete;
      var token = payload.access_token;
      Users.registerAthlete(athlete.id, athlete.firstname + ' ' + athlete.lastname);
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


function getAthlete(athleteId, callback) {
  strava.athlete.get( {id: athleteId}, function(err, payload) {
    if (err) {
      console.log("Received error from athlete.get service:\n" + util.stringify(err));
      callback(err);
    } else {
      console.log("Received athlete payload:\n" + util.stringify(payload));
      callback(null, payload);
    }
  });
}

module.exports = {
  registerAthlete: registerAthlete,
  getOAuthRequestAccessUrl: getOAuthRequestAccessUrl,
  getAthlete: getAthlete
};