const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;
const parseArgs = require('minimist');
const DEFAULT_HOST = 'http://localhost';
const DEFAULT_PORT = '8080';
const DEFAULT_PAGE = '/display';

/**
 * System chrome loaded inside the top level window.
 */
const Kiosk = {
  /**
   * Start Shell.
   */
  start: function() {
    console.log('Starting kiosk...');
    this.webview = document.getElementById('webview');

    // Parse command line arguments to get HTTP port
    //TODO: Replace use of 'remote' once deprecated in Electron 12
    // https://github.com/electron/electron/issues/21408
    let args = parseArgs(electron.remote.process.argv.slice(2));
    let httpPort = args.p || DEFAULT_PORT;

    // If port configured by systemd, assume port 80
    if (httpPort == 'systemd') {
      httpPort = '80';
    }

    // Load placeholder page
    this.webview.src = DEFAULT_HOST + ':'  + httpPort + DEFAULT_PAGE;

    // Listen for loadURL requests
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
