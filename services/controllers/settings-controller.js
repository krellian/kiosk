/**
 * Settings Controller.
 *
 * Manages HTTP requests to /settings.
 */

const express = require('express');
const router = express.Router();
const Password = require('../models/password');

/**
 * Set the password.
 */
router.put('/password', function(request, response) {
  if (request.body) {
    let password = request.body;
    Password.set(password).then(() => {
      response.status(200).send();
    }).catch((error) => {
      response.status(500).send('Unable to set password');
    });
  } else {
    response.status(400).send('No password provided');
  }
});

module.exports = router;
