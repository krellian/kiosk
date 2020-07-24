'use strict';

const chrome = require('../../chrome');

/**
 * UserAgent is responsible for monitoring and controlling system chrome from
 * services via Electron IPC.
 */
const UserAgent = {
  loadURL: function(url) {
    chrome.sendMessage('loadURL', url);
  }
}

module.exports = UserAgent;
