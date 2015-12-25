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
  var token = user.token;
  user = user._json;
  user.token = token;

  // Check if user exists in db
  User.find({ _id: user.id })
  .then(function (usersArray) {
    // If user exists, just refresh token
    if (usersArray[0]){
      refreshAthlete(user, callback);
    } else {
      // Else if user doesn't exist in db, save them to db
      saveAthlete(user, callback);
    }
  }, function (err) {
    console.error('Error retrieving user:', err);
  });
};

module.exports.getFriendsFromStrava = function (id, token) {
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
          fullName: friend.firstname + ' ' + friend.lastname,
          photo: friend.profile,
          challengeCount: 0,
          wins: 0,
          losses: 0
        };
      });
      saveFriends(id, friends);
    }
  });
};

module.exports.saveSegments = function (user, segment) {
  User.update({ _id: user }, { $addToSet: { segments: segment }},
  function (err, res) {
    if (err) console.error('Error saving segments:', err);
    console.log('Saved segments:', res.nModified === 1 ? 'Added segment' : 'Nothing added');
  });
};

module.exports.incrementSegmentCount = function (userId, segmentId) {
  User.where({ _id: userId, "segments.id": segmentId })
  .update({ 
    $inc: { 'segments.$.count': 1 },
    $sort: { 'segments.$.count': '-1' }
  },
  function (err, res) {
    if (err) {
      console.error('Error incrementing segment count:', err);
    }
    console.log('Incremented segment count:', res.nModified === 1 ? 'Incremented by 1' : 'Nothing incremented');
  });
  User.update({ _id: user }, 
      { $push: 
        { segments: 
          { $each: segments, 
            $sort: { count: -1 } 
          }}}, 
      { upsert: true },
    function (err, raw) {
      if (err) console.error('Ruh roh!', err);
      console.log('Updated segments:', raw.nModified);
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
  if (user.profile === "avatar/athlete/large.png") {
    user.profile = '/img/default_profile_photo.png';
  }
  var newUser = new User({
    _id: user.id,
    firstname: user.firstname,
    lastname: user.lastname,
    fullName: user.firstname + ' ' + user.lastname,
    token: user.token,
    photo: user.profile,
    email: user.email
  });
  newUser.save(function (err, savedUser) {
    if (err) {
      console.error('Error saving user:', err);
    } else {
      console.log('User saved!', user);
    }
  });
}

function refreshAthlete (user, callback) {
  if (user.profile === "avatar/athlete/large.png") {
    user.profile = '/img/default_profile_photo.png';
  }
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
      }
      console.log('Successfully refreshed token:', res.nModified);
    });
}

function saveFriends (user, stravaFriends) {
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
          }}}, 
      { upsert: true },
    function (err, raw) {
      if (err) console.error('Ruh roh!', err);
      console.log('Updated friends:', raw.nModified);
    });
  });
}