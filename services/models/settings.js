'use strict';

const database = require('../database');

/**
 * Manage system settings.
 */
const Settings = {

  /*
   * Set screen name.
   *
   * @param {String} name Name to use.
   * @return {Promise} Resolves on successful write.
   */
  setScreenName: async function(name) {
    // Create SHA256 hash of password to store.
    return database.write('name', name);
  }
}

module.exports = Settings;
