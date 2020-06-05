/*
 * Actions Controller
 *
 * Serves requests to /actions
 */
const express = require('express');
const router = express.Router();
const userAgent = require('../models/user-agent');
const networkManager = require('../models/network-manager');


/**
 * Loads a URL as content inside Kiosk's system chrome.
 */
router.post('/load_url', function(request, response) {
  if (request.body) {
    var url = request.body;
    userAgent.loadURL(url);
    response.status(201).send(url);
  } else {
    response.status(400).send();
  }
});

/**
 * Attempts to connect to a Wi-Fi access point.
 */
router.post('/connect_to_wifi_network', function(request, response) {
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
