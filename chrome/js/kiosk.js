const {ipcRenderer} = require('electron');

/**
 * System chrome loaded inside the top level window.
 */
var Kiosk = {
  /**
   * Start Shell.
   */
  start: function() {
    console.log('Starting kiosk...');
    this.webview = document.getElementById('webview');
    
    ipcRenderer.on('loadURL', (event, url) => {
        this.webview.src = url;
    });
  }
}

/**
  * Start Kiosk on page load.
  */
window.addEventListener('load', function kiosk_onLoad() {
  window.removeEventListener('load', kiosk_onLoad);
  Kiosk.start();
});