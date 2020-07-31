/*
 * Actions Controller
 *
 * Serves requests to /actions
 */

'use strict';

const express = require('express');
const router = express.Router();
const userAgent = require('../models/user-agent');

/**
 * Loads a URL as content inside Kiosk's system chrome.
 */
router.post('/load_url', function(request, response) {
  if (request.body) {
    var url = request.body;
    userAgent.loadURL(url);
    response.status(201).json(url);
  } else {
    response.status(400).send();
  }
});

module.exports = router;
