/*
 * Login Controller
 *
 * Serves requests to /login
 */

'use strict';

const express = require('express');
const router = express.Router();
const authentication = require('../authentication');

router.post('/', (request, response) => {
  const username = request.body.username;
  const password = request.body.password;
  if (!username || !password) {
    response.status(400).send('Username or password not provided.');
  }
  authentication.authenticate(username, password).then((result) => {
    if (result == false) {
      response.status(401).send('Invalid username or password.');
    } else {
      response.status(200).json(result);
    }
  });
});

module.exports = router;
