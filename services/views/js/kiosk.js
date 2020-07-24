'use strict';

/**
 * Krellian Kiosk web interface.
 */
var Kiosk = {

  /**
   * Start the kiosk web interface.
   */
  start: function() {
    this.controls = document.getElementById('controls');
    this.urlBar = document.getElementById('url-bar');
    controls.addEventListener('submit', this.handleSubmit.bind(this));
  },

  /**
   * Handle a submitted URL to be loaded by the kiosk.
   */
  handleSubmit: async function(e) {
    e.preventDefault();
    var url = this.urlBar.value;
    var payload = '"' + url + '"';
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    const request = {
      method: 'POST',
      body: payload,
      headers: headers
    };

    const response = await fetch('/actions/load_url', request);
    const json = await response.json();
  }
}

/**
  * Start kiosk on page load.
  */
window.addEventListener('load', function kiosk_onLoad() {
  window.removeEventListener('load', kiosk_onLoad);
  Kiosk.start();
});
