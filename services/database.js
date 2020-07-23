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
    console.log('Starting database...');
    // Create or open database
    level('kiosk', (error, db) => {
      if (error) {
        console.error('Error starting database: ' + error);
      } else {
        this.db = db;
      }
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
}

module.exports = Database;
