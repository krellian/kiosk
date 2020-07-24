/**
 * Settings Controller.
 *
 * Manages HTTP requests to /settings.
 */

'use strict';

const express = require('express');
const router = express.Router();
const settings = require('../models/settings');
const networkManager = require('../models/network-manager');

/**
 * Set the screen name.
 */
router.put('/name', function(request, response) {
  if (request.body) {
    let name = request.body;
    settings.setScreenName(name).then(() => {
      response.status(200).send();
    }).catch((error) => {
      response.status(500).send('Unable to set screen name');
    });
  } else {
    response.status(400).send('No name provided');
  }
});

/**
 * Set the screen password.
 */
router.put('/password', function(request, response) {
  if (request.body) {
    let password = request.body;
    settings.setScreenPassword(password).then(() => {
      response.status(200).send();
    }).catch((error) => {
      response.status(500).send('Unable to set screen password');
    });
  } else {
    response.status(400).send('No password provided');
  }
});

/**
 * Gets a list of available Wi-Fi access points from the network manager.
 */
router.get('/network/wifi_access_points', function(request, response) {
  networkManager.scanWifiAccessPoints().then((accessPoints) => {
    response.json(accessPoints);
  }).catch((error) => {
    console.error('Failed to scan for Wi-Fi access points: ' + error);
    response.status(500).send('Failed to scan for Wi-Fi access points');
  });
});

/**
 * Attempts to connect to a Wi-Fi access point.
 */
router.post('/network/wifi_connections', function(request, response) {
  if (request.body) {
    var body = request.body;
    var id = body.id;
    var ssid = body.ssid;
    var secure = body.secure;
    var password = body.password;

    networkManager.connectToWifiAccessPoint(id, ssid, secure, password);
    response.status(201).send(request.body);
  } else {
    response.status(400).send();
  }
});

module.exports = router;
