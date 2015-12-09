
function getVariable(envVar) {
  var result = process.env[envVar];
  if (!result) {
    throw new Error('Environment variable ' + envVar + ' must be set');
  }
  return result;
}

function getVariableWithDefault(envVar, defaultValue) {
  if (process.env[envVar])
    return process.env[envVar];
  else
    return defaultValue;
}

module.exports = {
  strava : {
    access_token : getVariable('STRAVA_ACCESS_TOKEN'),
    client_id : getVariable('STRAVA_CLIENT_ID'),
    client_secret : getVariable('STRAVA_CLIENT_SECRET'),
    redirect_uri : getVariableWithDefault('STRAVA_REDIRECT_URI', 'http://localhost:8080') + '/registercode'
  }
};