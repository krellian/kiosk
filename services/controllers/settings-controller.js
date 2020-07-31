/**
 * Settings Controller.
 *
 * Manages HTTP requests to /settings.
 */

'use strict';

const express = require('express');
const router = express.Router();
const authentication = require('../authentication');
const authorization = require('../authorization');
const auth = authorization.middleware;
const credentials = require('../models/credentials');
const settings = require('../models/settings');
const network = require('../models/network');

const DEFAULT_USER = 'admin';

/**
 * Get the screen name.
 *
 * (Never authenticated).
 */
router.get('/name', function(request, response) {
  settings.getScreenName().then((name) => {
    response.status(200).json(name);
  }).catch((error) => {
    response.status(404).send('Unable to set screen name');
  });
});


/**
 * Set the screen name.
 *
 * (Authenticated if password configured).
 */
router.put('/name', function(request, response) {
  let name = request.body;
  if (!name) {
    response.status(400).send('No name provided');
  }

  // Define a function to set a name
  const setName = function(name) {
    settings.setScreenName(name).then(() => {
      response.status(200).send();
    }).catch((error) => {
      response.status(500).send('Unable to set screen name');
    });
  };

  // If a password is set then this request must be authenticated
  credentials.isPasswordSet().then(set => {
    if(set) {
      var authorized = authorization.authorize(request);
      if (!authorized) {
        // Password set and request not authorized
        response.status(401).send('Access denied.');
      } else {
        // Password set but request authorized
        setName(name);
      }
    } else {
      // No password set yet, go ahead
      setName(name);
    }
  }).catch(error => {
    console.error(error);
    response.status(500).send('Error getting security status.');
  });
});

/**
 * Set the screen password.
 *
 * (Authenticated if a password is already set).
 */
router.put('/password', function(request, response) {
  if (!request.body) {
    response.status(400).send('No password provided.');
  }

  let password = request.body;

  // Define a function to set a new password
  const setPassword = function(password) {
    // Set new password
    credentials.setPassword(password).then(() => {
      // Authenticate with new password
      authentication.authenticate(DEFAULT_USER, password).then((result) => {
        if (result == false) {
          response.status(401).send('New password was rejected.');
        } else {
          // Send JWT (JSON Web Token) back to client
          response.status(200).json(result);
        }
      }).catch((error) => {
        console.error(error);
        response.status(500).send('Authentication error.');
      });
    }).catch((error) => {
      console.error(error);
      response.status(500).send('Unable to set screen password.');
    });
  };

  // If a password is already set then this request must be authenticated
  credentials.isPasswordSet().then(set => {
    if(set) {
      var authorized = authorization.authorize(request);
      if (!authorized) {
        // Password is already set and request not authorized
        response.status(401).send('Access denied.');
      } else {
        // Password already set but request authorized
        setPassword(password);
      }
    } else {
      // No password set yet, go ahead
      setPassword(password);
    }
  }).catch(error => {
    console.error(error);
    response.status(500).send('Error getting security status.');
  });
});

/**
 * Gets a list of available Wi-Fi access points from the network manager.
 */
router.get('/network/wifi_access_points', auth, function(request, response) {
  network.scanWifiAccessPoints().then((accessPoints) => {
    response.json(accessPoints);
  }).catch((error) => {
    console.error('Failed to scan for Wi-Fi access points: ' + error);
    response.status(500).send('Failed to scan for Wi-Fi access points');
  });
});

/**
 * Attempts to connect to a Wi-Fi access point.
 */
router.post('/network/wifi_connections', auth, function(request, response) {
  if (request.body) {
    var body = request.body;
    var id = body.id;
    var ssid = body.ssid;
    var secure = body.secure;
    var password = body.password;

    network.connectToWifiAccessPoint(id, ssid, secure, password);
    response.status(201).json(request.body);
  } else {
    response.status(400).send();
  }
});

/**
 * Gets whether password set or not.
 *
 * (Never authenticated).
 */
router.get('/password_is_set', function(request, response) {
  credentials.isPasswordSet().then(set => {
    if(set) {
      response.status(200).json(true);
    } else {
      response.status(200).json(false);
    }
  }).catch(error => {
    console.error(error);
    response.status(500).send('Error getting security status.');
  });
});

module.exports = router;
