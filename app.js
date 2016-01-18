/* jshint latedef:false */

'use strict';

var request = require('request');
var config = require('config').App;
var express = require('express');
var _ = require('lodash');
var Q = require('q');

module.exports = function(io, app) {

  app = app || express();

  var wall = (io || socketio).of('/wall');

  app.use(express.static(__dirname + '/public'));
  app.use(require('compression')());
  app.use(require('body-parser').json({ limit: '2mb' }));
  app.use(require('body-parser').urlencoded({ extended: true, limit: '100kb' }));

  wall.on('connection', function(socket) {
    socket.on('new photos please', function(user) {
      emitNewPhotos(user, socket);
    });
  });

  app.get('/subscription/instagram', function(req, res) {
    console.info('Instagram subscription setup path called.');
    if (req.query['hub.verify_token'] === config.INSTAGRAM_SUBSCRIPTION_CALLBACK_SECRET) {
      console.info('Handshaking ...');
      return res.send(200, req.query['hub.challenge']);
    }

    res.send(403);
  });

  app.post('/subscription/instagram', function(req, res) {
    res.status(200).end();
    wall.emit('new photo alert');
  });

  // INDEX

  app.use(function(req, res) {
    res.sendfile(__dirname + '/public/index.html');
  });

  return app;

};

function emitNewPhotos(user, socket) {
  getNewPhotos(user, function(data) {
    socket.emit('new photos', data);
  });
}

function getNewPhotos(user, done) {

  var tag = 'wedisatarena',
      items = [];

  var url = 'https://api.instagram.com/v1/tags' +
            '/' + tag + '/media/recent' +
            '?client_id=' + config.INSTAGRAM_CLIENT_ID +
            '&count=' + 30;

  if (user && user.minTagId) {
    url = url + '&min_tag_id=' + user.minTagId;
  }

  Q.nfcall(request.get, {
    json: true,
    url: url
  })
  .then(function(args) {

    if (args[1].pagination.min_tag_id) {
      user.minTagId = args[1].pagination.min_tag_id;
    }

    _(args[1].data)
    .filter(function(item) {
      return _.contains(item.tags, tag);
    })
    .filter(function(item) {
      return item &&
        item.images &&
        item.images.standard_resolution;
    })
    .map(function(item) {
      if (_.contains(item.tags, 'selfie') &&
          item.images &&
          item.images.standard_resolution &&
          item.images.standard_resolution.url) {
        item.images.standard_resolution.url =
          'http://mustachify.me/?src=' + item.images.standard_resolution.url;
      }

      return item;
    })
    .map(function(item) {
      return item.images.standard_resolution;
    })
    .forEach(function(item) {
      items.push(item);
    });

    done({
      user: user,
      photos: items
    });

  });

}
