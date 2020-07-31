'use strict';

const database = require('../database');

/**
 * Manage system settings.
 */
const Settings = {

  /*
   * Get screen name.
   *
   * @return {Promise} Resolves with name.
   */
  getScreenName: async function(name) {
    return database.read('name');
  },

  /*
   * Set screen name.
   *
   * @param {String} name Name to use.
   * @return {Promise} Resolves on successful write.
   */
  setScreenName: async function(name) {
    return database.write('name', name);
  }
}

module.exports = Settings;
