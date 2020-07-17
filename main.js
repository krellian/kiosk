/**
 * Krellian Kiosk.
 *
 * Main script starts up kiosk chrome and services.
 */
const electron = require('electron');
const parseArgs = require('minimist');
const app = electron.app;
const services = require('./services');
const chrome = require('./chrome');
const DEFAULT_HTTP_PORT = 8080;

function startKiosk() {
  // Parse command line arguments
  let args = parseArgs(process.argv.slice(2));
  let httpPort = args.p || DEFAULT_HTTP_PORT;

  services.start(httpPort);
  chrome.start();
}

app.on('ready', startKiosk);
