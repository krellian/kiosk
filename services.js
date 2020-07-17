const express = require('express');
const router = require('./services/router');
const networkManager = require('./services/models/network-manager');
const PORT = 8080;

/**
 * Services expose kiosk features over HTTP, both locally and via the
 * Web of Things.
 */
var Services = {
  start: function() {
    // Start network manager
    networkManager.start();

    // Start HTTP server
    this.server = express();
    this.server.use(router);
    this.server.listen(PORT, () =>
      console.log(`Starting system services on port ${PORT}...`));
  }
}

module.exports = Services;
