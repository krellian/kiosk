/*
 * Actions Controller
 *
 * Serves requests to /actions
 */
const express = require('express');
const router = express.Router();
const chrome = require('../../chrome');

/**
 * Loads a URL as content inside Kiosk's system chrome.
 */
router.post('/loadURL', function(request, response) {
  if (request.body.loadURL && request.body.loadURL.input) {
    var url = request.body.loadURL.input;
    chrome.sendMessage('loadURL', url);
    response.status(201).send(request.body);
  } else {
    response.status(400).send();
  }
});

module.exports = router;