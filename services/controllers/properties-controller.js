/*
 * Properties Controller
 *
 * Serves requests to /properties
 */
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
    response.status(500).send(error);
  });

});

module.exports = router;