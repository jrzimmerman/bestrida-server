var mongoose = require('../db');
var strava = require('strava-v3');

var userSchema = mongoose.Schema({ 
  _id:       { type: Number, required: true },
  firstname: { type: String, required: true },
  lastname:  { type: String, required: true },
  fullName:  { type: String, required: true },
  token:     { type: String },
  photo:     { type: String },
  email:     { type: String },
  friends:   { type: [mongoose.Schema.Types.Mixed], default: [] },
  segments:  { type: [mongoose.Schema.Types.Mixed], default: [] },
  wins:      { type: Number, default: 0 },
  losses:    { type: Number, default: 0 }
});

var User = mongoose.model('User', userSchema);

module.exports = User;

module.exports.registerAthlete = function (user, callback) {
  // Check if user exists in db
  User.find({ _id: user.id })
  .then(function (usersArray) {
    // If user exists, just refresh token
    if (usersArray[0]){
      refreshAthlete(user, callback);
    } else {
      // Else if user doesn't exist in db, save them to db
      saveAthlete(user, callback);
      setTimeout(getFriendsFromStrava(user.id, user.token), 5000);
    }
  }, function (err) {
    console.error('Error retrieving user:', err);
  });
};

module.exports.saveFriends = function (user, friends) {
  User.update({ _id: user }, { friends: friends },
    function (err, res) {
    if (err) {
      console.error('Error saving friends:', err);
    } else {
      console.log('Saved friends:', res);
    }
  });
};

module.exports.saveSegments = function (user, segments) {
  User.findOneAndUpdate({ _id: user }, {$push: { segments: segments }},
    function (err, res) {
    if (err) {
      console.error('Error saving segments:', err);
    } else {
      console.log('Saved segments:', res);
    }
  });
};

module.exports.incrementSegmentCount = function (userId, segmentId) {
  User.where({ _id: userId, "segments.id": segmentId })
  .update({ 
    $inc: { 
      'segments.$.count': 1
    }
  },
  function (err, res) {
    if (err) {
      console.error('Error incrementing segment count:', err);
    } else {
      console.log('User ID: ', userId);
      console.log('Segment ID: ', segmentId);
      console.log('Incremented segment count:', res);

    }
  });
};

// Increment wins and challenge count on the user's friend object
module.exports.incrementWins = function (userId, friendId) {
  User.where({ _id: userId, "friends.id": friendId })
  .update({ 
    $inc: { 
      'friends.$.challengeCount': 1,
      'friends.$.wins': 1,
      wins: 1
    }
  },
  function (err, res) {
    if (err) {
      console.error('Error incrementing wins:', err);
    } else {
      console.log('Incremented wins:', res);

    }
  });
};

// Increment losses and challenge count on the user's friend object
module.exports.incrementLosses = function (userId, friendId) {
  User.where({ _id: userId, "friends.id": friendId })
  .update({
    $inc: {
      'friends.$.challengeCount': 1,
      'friends.$.losses': 1,
      losses: 1
    }
  },
  function (err, res) {
    if (err) {
      console.error('Error incrementing losses:', err);
    } else {
      console.log('Incremented losses:', res);
    }
  });
};

// Helper functions
function saveAthlete (user, callback) {
  // TODO: create a default photo and save the path to defaultPhoto var
  var defaultPhoto = '/some/file/path.jpg';
  var newUser = new User({
    _id: user.id,
    firstname: user.firstname,
    lastname: user.lastname,
    fullName: user.firstname + ' ' + user.lastname,
    token: user.token,
    photo: user.profile || defaultPhoto,
    email: user.email
  });
  newUser.save(function (err, savedUser) {
    if (err) {
      console.error('Error saving user:', err);
      callback(err);
    } else {
      console.log('User saved!', user);
      callback(null, user);
    }
  });
}

function refreshAthlete (user, callback) {
  User.update(
    { _id: user.id },
    {
      firstname: user.firstname,
      lastname: user.lastname,
      fullName: user.firstname + ' ' + user.lastname,
      token: user.token,
      photo: user.profile,
      email: user.email
    },
    function (err, res) {
      if (err) {
        console.error('Error refreshing token:', err);
        callback(err);
      }
      console.log('Successfully refreshed token:', res);
      callback(null, user.token);
    });
}

function getFriendsFromStrava (id, token) {
  strava.athlete.listFriends({ access_token: token }, function (err, friends) {
    if (err) {
      console.error('Error retrieving friends', err);
    }
    if (friends.length) {
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
      User.saveFriends(id, friends);
    }
  });
}