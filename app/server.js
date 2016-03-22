var express        = require('express');
var app            = express();
var bodyParser     = require('body-parser');
var morgan         = require('morgan');
var path           = require('path');
var strava         = require('./strava');
var passport       = require('passport');
var methodOverride = require('method-override');
var session        = require('express-session');
var cron           = require('./cron');

app.use(passport.initialize());
app.use(passport.session());
app.use(session({secret: process.env.SECRET || 'secret', maxAge: 360*5}));
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

// log all requests to the console 
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