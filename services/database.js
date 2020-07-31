'use strict';

const level = require('level');

/**
 * Database manages a LevelDB database.
 */
const Database = {
  db: null,

  /**
   * Start the database.
   */
  start: function() {
    return new Promise((resolve, reject) => {
      console.log('Starting database...');
      // Create or open database
      level('db', (error, db) => {
        if (error) {
          console.error('Error starting database: ' + error);
          reject(error);
        } else {
          this.db = db;
          resolve();
        }
      });
    });
  },

  /**
   * Write a value.
   *
   * @param {Object} key.
   * @param {Object} value.
   * @return {Promise} Resolves on successful write.
   */
  write: async function(key, value) {
    return this.db.put(key, value);
  },

  /**
   * Read a value.
   *
   * @param {Object} key.
   * @return {Promise} Resolves with value.
   */
  read: async function(key) {
    return this.db.get(key);
  },
}

module.exports = Database;
