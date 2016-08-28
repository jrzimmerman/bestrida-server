require('dotenv').config();
require('newrelic');
var express        = require('express');
var app            = express();
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var morgan         = require('morgan');
var passport       = require('passport');
var cron           = require('./cron');

// passport configuration
app.use(passport.initialize());
app.use(passport.session());

// method override is used to simulate put and delete methods when not available
app.use(methodOverride());

// use body parser so we can grab information from POST requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// configure our app to handle CORS requests
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
  next();
});

// log all requests to console
app.use(morgan('dev'));

// start cron job
cron.job.start();

// set static files location
// used for requests that our frontend will make
app.use(express.static(__dirname + './../public'));

// API ROUTES ------------------------
var apiRoutes = require('./routes/api')(app, express);
app.use('/api', apiRoutes);

// AUTH ROUTES ------------------------
var authRoutes = require('./routes/auth')(app, express, passport);
app.use('/auth', authRoutes);

app.listen(process.env.PORT || 8000);
