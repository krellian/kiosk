'use strict';

const crypto = require('crypto');
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
  },

  /*
   * Set screen password.
   *
   * @param {String} password Password to set.
   * @return {Promise} Resolves on successful write.
   */
  setScreenPassword: async function(password) {
    // Create SHA256 hash of password to store.
    let hash =
      crypto.createHash('sha256').update(password, 'utf8').digest('hex');
    return database.write('password', hash);
  }
}

module.exports = Settings;
