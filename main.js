/**
 * Krellian Kiosk.
 *
 * Main script starts up kiosk chrome and services.
 */
const electron = require('electron');
const app = electron.app;
const services = require('./services');
const chrome = require('./chrome');

function startKiosk() {
  services.start();
  chrome.start();
}

app.on('ready', startKiosk);