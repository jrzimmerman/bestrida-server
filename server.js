var path = require('path');
var express = require('express');
var app = express();
var db = require('./db');

app.use(express.static(path.join(__dirname, 'public')));
app.listen(process.env.PORT || 8000);