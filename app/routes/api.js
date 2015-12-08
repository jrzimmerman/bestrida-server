var bodyParser = require('body-parser');
var Users = require('../models/users');
var Efforts = require('../models/efforts');
var Segments = require('../models/segments');
var Challenges = require('../models/challenges');

module.exports = function(app, express) {
  var apiRouter = express.Router();

  // users route
  apiRouter.route('/users')
    .get(function(req, res) {
      res.json({ message: 'this returns all users!' });   
    });

  // specific user route
  apiRouter.route('/users/:user_id')
    .get(function(req, res) {
      res.json({ message: 'this is a specific user!' });   
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

  // athletes route
  apiRouter.route('/athletes')
    .get(function(req, res) {
      res.json({ message: 'this returns all athletes!' });   
    });

  // specific athlete route
  apiRouter.route('/athletes/:athlete_id')
    .get(function(req, res) {
      res.json({ message: 'this is a specific athlete!' });   
    });

  // segments route
  apiRouter.route('/segments')
    .get(function(req, res) {
      res.json({ message: 'this returns all segments!' });   
    });

  // specific segment route
  apiRouter.route('/segments/:segment_id')
    .get(function(req, res) {
      res.json({ message: 'this is a specific segment!' });   
    });

  // efforts route
  apiRouter.route('/efforts')
    .get(function(req, res) {
      res.json({ message: 'this returns all efforts!' });   
    });

  // specific segment effort route
  apiRouter.route('/efforts/:effort_id')
    .get(function(req, res) {
      res.json({ message: 'this is a specific effort!' });   
    });

  return apiRouter;
};