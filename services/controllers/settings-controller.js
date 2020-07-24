/**
 * Settings Controller.
 *
 * Manages HTTP requests to /settings.
 */

'use strict';

const express = require('express');
const router = express.Router();
const Password = require('../models/password');
const Settings = require('../models/settings');

/**
 * Set the screen name.
 */
router.put('/name', function(request, response) {
  if (request.body) {
    let name = request.body;
    Settings.setScreenName(name).then(() => {
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
    Password.set(password).then(() => {
      response.status(200).send();
    }).catch((error) => {
      response.status(500).send('Unable to set screen password');
    });
  } else {
    response.status(400).send('No password provided');
  }
});

module.exports = router;
