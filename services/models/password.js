'use strict';

const crypto = require('crypto');
const database = require('../database');

/**
 * Password is responsible for setting the system password.
 */
const Password = {

  /*
   * Set system password.
   *
   * @param {String} password Password to set.
   * @return {Promise} Resolves on successful write.
   */
  set: async function(password) {
    // Create SHA256 hash of password to store.
    let hash =
      crypto.createHash('sha256').update(password, 'utf8').digest('hex');
    return database.write('password', hash);
  }
}

module.exports = Password;
