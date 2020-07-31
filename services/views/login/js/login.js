'use strict';

/**
 * Krellian Kiosk Login UI.
 */
var Login = {

  NAME_PATH: '/settings/name',
  LOGIN_PATH: '/login',

  /**
   * Start the login UI.
   */
  start: function() {
    this.screenName = document.getElementById('screen-name');
    this.loginForm = document.getElementById('login-form');
    this.usernameInput = document.getElementById('username-input');
    this.passwordInput = document.getElementById('password-input');
    this.loginForm.addEventListener('submit', this.handleSubmit.bind(this));
    this.getScreenName().then((name) => {
      this.screenName.textContent = name;
      this.screenName.classList.remove('hidden');
      this.passwordInput.focus();
    });
  },

  /**
   * Get the name of the screen.
   *
   * @return {Promise} Resolves with name.
   */
  getScreenName: function(e) {
    return new Promise(async (resolve, reject) => {
      const request = {
        method: 'GET',
        headers: {'Accept': 'application/json'}
      };
      fetch(this.NAME_PATH, request).then((response) => {
        if (!response.ok) {
          console.error('Failed to get screen name');
          reject();
        } else {
          response.json().then((name) => {
            resolve(name);
          }).catch((error) => {
            console.error(error);
          });
        }
      }).catch((error) => {
        console.error(error);
        reject();
      });
    });
  },

  /**
   * Handle submission of login form.
   *
   * @param {Event} e Submit event.
   */
  handleSubmit: function(e) {
    e.preventDefault();
    var username = this.usernameInput.value;
    var password = this.passwordInput.value;

    var payload = {
      'username': username,
      'password': password
    };

    const request = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    };

    fetch(this.LOGIN_PATH, request).then((response) => {
      if (response.status == 400) {
        console.log('Username or password not provided.');
        // TODO: Show error to user.
      } else if (response.status == 401) {
        console.log('Incorrect username or password.');
        // TODO: Show error to user.
      } else if(response.status == 200) {
        console.log('Authenticated successfully');
        response.json().then((result) => {
          if (result.jwt) {
            localStorage.setItem('jwt', result.jwt);
            window.location.href = '/';
          }
        });
      }
    }).catch((error) => {
      console.error(error);
    });
  }
}

/**
  * Start Setup on page load.
  */
window.addEventListener('load', function login_onLoad() {
  window.removeEventListener('load', login_onLoad);
  Login.start();
});
