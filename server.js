'use strict';

var express = require('express');
var app = express();
var server = require('http').Server(app)
var socketio = require('socket.io')(server)

server.listen(8080)

require('./app.js')(socketio, app);
