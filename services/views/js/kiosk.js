'use strict';

/**
 * Krellian Kiosk web interface.
 */
var Kiosk = {

  PASSWORD_IS_SET_PATH: '/settings/password_is_set',
  LOGIN_PATH: '/login',
  SETUP_PATH: '/setup',

  /**
   * Authentication token (JSON Web Token).
   */
  jwt: localStorage.getItem('jwt'),

  /**
   * Start the kiosk web interface.
   */
  start: function() {
    this.controlPanel = document.getElementById('control-panel');
    this.controls = document.getElementById('controls');
    this.urlBar = document.getElementById('url-bar');
    controls.addEventListener('submit', this.handleSubmit.bind(this));
    this.checkForPassword().then(()=> {
      this.controlPanel.classList.remove('hidden');
      this.urlBar.focus();
    }).catch((error) => {
      console.log('Not logged in, redirecting...');
    });

  },

  /**
   * Handle a submitted URL to be loaded by the kiosk.
   */
  handleSubmit: function(e) {
    e.preventDefault();
    var url = this.urlBar.value;
    var payload = '"' + url + '"';
    const headers = {
      'Authorization': 'Bearer ' + this.jwt,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    const request = {
      method: 'POST',
      body: payload,
      headers: headers
    };
    fetch('/actions/load_url', request);
  },

  /**
   * Check whether password is needed.
   *
   * Redirect to /login or /setup accordingly
   *
   * @returns {Promise} Rejects and redirects to login if password needed.
   */
  checkForPassword: function() {
    return new Promise((resolve, reject) => {
      // if a JWT is set then assume password configured and client authenticated.
      if(this.jwt) {
        resolve();
        return;
      }

      var request = {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      };

      fetch(this.PASSWORD_IS_SET_PATH, request).then((response) => {
        response.json().then(value => {
          if(value == true) {
            // If password configured but not logged in, redirect to login
            window.location.href = this.LOGIN_PATH;
            reject();
          } else {
            // If password not configured, redirect to setup
            window.location.href = this.SETUP_PATH;
            reject();
          }
        })
      }).catch((error) => {
        console.error('Failed to get password status.');
      });
    });
  }
}

/**
  * Start kiosk on page load.
  */
window.addEventListener('load', function kiosk_onLoad() {
  window.removeEventListener('load', kiosk_onLoad);
  Kiosk.start();
});
