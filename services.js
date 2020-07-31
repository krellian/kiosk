const express = require('express');
const router = require('./services/router');
const database = require('./services/database');
const credentials = require('./services/models/credentials');
const network = require('./services/models/network');

/**
 * Services expose kiosk features over HTTP, both locally and via the
 * Web of Things.
 */
var Services = {

  /**
   * Start system services.
   *
   * @param {integer} port HTTP port.
   */
  start: function(port) {
    // Start database and credential manager
    database.start()
    .then(() => credentials.start())
    .catch((error) => {console.log(error)});

    // Start network manager
    network.start();

    // Start HTTP server
    this.server = express();
    this.server.use(router);
    this.server.listen(port, () =>
      console.log(`Starting HTTP server on port ${port}...`));
  }
}

module.exports = Services;
