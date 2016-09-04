var mongoose = require('../db');
var strava = require('strava-v3');
var util = require('../util');

var userSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  fullName: { type: String, required: true },
  token: String,
  photo: String,
  email: String,
  friends: { type: [mongoose.Schema.Types.Mixed], default: [] },
  segments: { type: [mongoose.Schema.Types.Mixed], default: [] },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 }
}, { timestamps: {} });

var User = mongoose.model('User', userSchema);

module.exports = User;

module.exports.registerAthlete = function (user, callback) {
  var token = user.token;
  user = user._json;
  user.token = token;

  // Check if user exists in db
  User.find({ _id: user.id }, function(err) {
    if (err) {
      console.error('Error registering athlete: ' + err);
      callback(err);
    } else {
      saveAthlete(user, function(err) {
        if (err) {
          callback(err);
        } else {
          callback();
        }
      });
    }
  });
};

module.exports.getFriendsFromStrava = function (id, token, callback) {
  console.log('getting friends from strava');
  strava.athlete.listFriends({ access_token: token }, function (err, friends) {
    if (err) {
      console.error('Error retrieving friends' + err);
      callback('Error retrieving friends' + err);
    } else {
      if (friends.length) {
        friends = friends.map(function(friend) {
          return {
            id: friend.id,
            username: friend.username,
            firstname: friend.firstname,
            lastname: friend.lastname,
            fullName: friend.firstname + ' ' + friend.lastname,
            photo: friend.profile,
            challengeCount: 0,
            wins: 0,
            losses: 0
          };
        });
        saveFriends(id, friends, function(err, res) {
          if (err) {
            console.error('Error saving friends' + err);
            callback(err);
          } else {
            console.log('saved friends: ', res);
            callback(err, res);
          }
        });
      } else {
        console.log('no friends found');
        callback(err, 'no friends found');
      }
    }
  });
};

module.exports.saveSegments = function (user, segment, callback) {
   User.update({ _id: user },
    { $addToSet: {segments: segment}},
    {$sort: { count: 'descending' }},
    function (err, res) {
      if (err) {
        console.error('Error updating segments: ' + err);
        callback('Error updating segments: ' + err);
      } else {
        console.log('Segments array updated: ' + !!res.nModified);
        callback(err, 'Segments array updated: ' + !!res.nModified);
      }
    }
  );
};

module.exports.incrementSegmentCount = function (userId, segmentId, callback) {
  User.update({ _id: userId, "segments.id": segmentId },
  {$inc: { 'segments.$.count': 1 }},
  function (err, res) {
    if (err) {
      console.error('Error incrementing segment count: ' + err);
      callback('Error incrementing segment count: ' + err);
    } else {
      console.log('Incremented segment count: ' + !!res.nModified);
      callback(err, 'Incremented segment count: ' + !!res.nModified);
    }
  });
};

// Increment wins and challenge count on the user's friend object
module.exports.incrementWins = function (userId, friendId) {
  User.update({ _id: userId, "friends.id": friendId },
  {
    $inc: {
      'friends.$.challengeCount': 1,
      'friends.$.wins': 1,
      wins: 1
    }
  },
  function (err, res) {
    if (err) {
      console.error('Error incrementing wins: ' + err);
    } else {
      console.log('Incremented wins: ' + !!res.nModified);
    }
  });
};

// Increment losses and challenge count on the user's friend object
module.exports.incrementLosses = function (userId, friendId) {
  User.update({ _id: userId, "friends.id": friendId },
  {
    $inc: {
      'friends.$.challengeCount': 1,
      'friends.$.losses': 1,
      losses: 1
    }
  },
  function (err, res) {
    if (err) {
      console.error('Error incrementing losses: ' + err);
    } else {
      console.log('Incremented losses: ' + !!res.nModified);
    }
  });
};

// Helper functions
function saveAthlete(user, callback) {
  var newUser = new User({
    _id: user.id,
    firstname: user.firstname,
    lastname: user.lastname,
    fullName: user.firstname + ' ' + user.lastname,
    token: user.token,
    photo: user.profile,
    email: user.email
  });
  User.update(
    { _id: user.id }, newUser, {upsert: true},
    function (err, raw) {
      if (err) {
        console.error('Error refreshing token: ' + err);
        callback(err);
      } else {
        console.log('User found: ' + !!raw.n + ' User updated: ' + !!raw.nModified);
        callback(err, raw);
      }
    });
}

function saveFriends (user, stravaFriends, callback) {
  User.find({ _id: user }).select('friends')
  .exec(function(err, res) {
    var friends = res[0].friends;
    var newFriends = [];
    var friendsObj = {};

    // Create a friend object for constant time lookup
    for (var i = 0; i < friends.length; i++) {
      friendsObj[friends[i].id] = 1;
    }

    // If we find a new friend on Strava, push to newFriends array to be added later
    for (var j = 0; j < stravaFriends.length; j++) {
      if (!friendsObj[stravaFriends[j].id]) {
        newFriends.push(stravaFriends[j]);
      }
    }

    // Push newFriends array to user's current friends
    User.update({ _id: user },
      { $push:
        { friends:
          { $each: newFriends,
            $sort: { challengeCount: -1 }
          }
        }
      },
      { upsert: true },
    function (err, res) {
      if (err) {
        console.error('Error updating friends: ' + err);
        callback(err);
      } else {
        console.log('Friends array found: ' + !!res.n);
        console.log('Friends array updated: ' + !!res.nModified);
        callback(err, res);
      }
    });
  });
}
