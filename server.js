'use strict';

var express = require('express');
var app = express();

require('./app.js')(socketio, app);

module.exports = app;
