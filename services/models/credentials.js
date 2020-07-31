'use strict';

const crypto = require('crypto');
const database = require('../database');

/**
 * Manage admin password, public key and private key.
 */
const Credentials = {
  PRIVATE_KEY: null,
  PUBLIC_KEY: null,

  /**
   * Get public and private keys from database, or generate them if not present.
   */
  start: function() {
    return new Promise((resolve, reject) => {
      // Load private and public keys from database.
      database.read('privateKey').then((privateKey) => {
        if (!privateKey) {
          console.error('Private key was empty.');
          reject();
        }
        this.PRIVATE_KEY = privateKey;

        database.read('publicKey').then((publicKey) => {
          if (!publicKey) {
            console.error('Public key was empty.');
            reject();
          }
          this.PUBLIC_KEY = publicKey;
        })
        resolve();

      }).catch((error) => {
        // If no key set, generate a key pair to save to database and return
        if (error.notFound) {
          this.generateKeyPair().then(keypair => {
            database.write('privateKey', keypair.privateKey);
            database.write('publicKey', keypair.publicKey);
            this.PRIVATE_KEY = keypair.privateKey;
            this.PUBLIC_KEY = keypair.publicKey;
            resolve();
          });
        } else {
          console.error('Error getting keys from database: ' + error);
          reject();
        }
      });
    });
  },

  /*
   * Get screen password.
   *
   * @return {Promise} Resolves with hashed password.
   */
  getPassword: async function() {
    return database.read('password');
  },

  /*
   * Set screen password.
   *
   * @param {String} password Password to set.
   * @return {Promise} Resolves on successful write.
   */
  setPassword: async function(password) {
    // Create SHA256 hash of password to store.
    let hash =
      crypto.createHash('sha256').update(password, 'utf8').digest('hex');
    return database.write('password', hash);
  },

  /*
   * Compare password with stored hash.
   *
   * @param {String} password Password to check.
   * @return {Promise<boolean>} Resolves with true if match or false if not.
   */
  checkPassword: async function(password) {
    // Create SHA256 hash of password to check.
    let providedHash =
      crypto.createHash('sha256').update(password, 'utf8').digest('hex');
    return this.getPassword().then((storedHash) => {
      if (providedHash == storedHash) {
        return true;
      } else {
        return false;
      }
    });
  },

  /**
   * Check whether a password is set.
   *
   * @returns {Promise<boolean>} Resolves with true if set and false if not.
   */
  isPasswordSet: function() {
    return new Promise((resolve, reject) => {
      this.getPassword().then(value => {
        if (value) {
          resolve(true);
        } else {
          resolve(false);
        }
      }).catch((error) => {
        if (error.type == 'NotFoundError') {
          resolve(false);
        } else {
          reject(error);
        }
      });
    });
  },

  /**
   * Get private key.
   *
   * @returns {String} Private key.
   */
  getPrivateKey: function() {
    return this.PRIVATE_KEY;
  },

  /**
   * Get public key.
   *
   * @returns {String} Public key.
   */
  getPublicKey: function() {
    return this.PUBLIC_KEY;
  },

  /**
   * Generates an RSA keypair for use in signing and verifying a JWT.
   *
   * @returns {Promise<Object>} resolves with object of form:
   *  {
   *    'privateKey': 'generated_private_key'
   *    'publicKey': 'generated_public_key',
   *  }
   */
  generateKeyPair: function() {
    console.log('Generating keypair...');
    return new Promise((resolve, reject) => {
      crypto.generateKeyPair('rsa', {
        modulusLength: 512,
        'publicKeyEncoding': {
          'type': 'spki',
          'format': 'pem'
        },
        privateKeyEncoding: {
          'type': 'pkcs8',
          'format': 'pem'
        }
      },
      (error, publicKey, privateKey) => {
        if(error) {
          console.error('Error generating keypair: ' + error);
          reject();
        }
        resolve({
          'privateKey': privateKey,
          'publicKey': publicKey
        });
      });
    })
  }
};

module.exports = Credentials;
