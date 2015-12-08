var bodyParser = require('body-parser');

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