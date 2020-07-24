/*
 * Properties Controller
 *
 * Serves requests to /properties
 */

'use strict';

const express = require('express');
const router = express.Router();
const networkManager = require('../models/network-manager');

/**
 * Gets a list of available Wi-Fi access points from the network manager.
 */
router.get('/wifi_access_points', function(request, response) {
  networkManager.scanWifiAccessPoints().then((accessPoints) => {
    response.json(accessPoints);
  }).catch((error) => {
    console.error('Failed to scan for Wi-Fi access points: ' + error);
    response.status(500).send('Failed to scan for Wi-Fi access points');
  });

});

module.exports = router;
