/**
 * Authenticate user.
 */

'use strict';

const jwt = require('jsonwebtoken');
const credentials = require('./models/credentials');
const DEFAULT_USER = 'admin';

const Authentication = {
  /**
   * Authenticate user based on username and password.
   *
   * @param {String} username Username provided by user.
   * @param {String} password Password provided by user.
   * @return {Promise<Object>} false if invalid, if valid object of the form:
   *   {
   *     user: { username: 'admin' },
   *     jwt: 'fmkdalfmkadl.hfidoafhiado.hifoadhfidao'
   *   }
   *
   */
  authenticate: async function(username, password) {
    // Check username (currently hard coded)
    if (username != DEFAULT_USER) {
      return false;
    }

    // Check Password
    return credentials.checkPassword(password).then((match) => {
      if (!match) {
        return false;
      }
      const user = { 'username': DEFAULT_USER };
      // Get private keys
      let privateKey = credentials.getPrivateKey();
      // Generate a JWT (JSON Web Token)
      // TODO: Send public key with response
      const token = jwt.sign(user, privateKey, { algorithm: 'RS256' });
      return { user: user, jwt: token };
    }).catch((error) => {
      console.error('Error checking password: ' + error);
      return false;
    });
  }
};

module.exports = Authentication;
