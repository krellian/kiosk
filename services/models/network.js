const DBus = require('dbus');

/**
 * Network Manager is responsible for configuring network interfaces
 * using NetworkManager via DBus.
 */
const Network = {

  systemBus: null, // Connection to system bus (dBus)
  wifiAdapter: null, // Primary Wi-Fi adapter (object path)

  /**
   * Start network manager by opening connection to system bus and finding
   * primary Wi-Fi adapter.
   */
  start: function() {
    console.log('Starting network manager...');

    try {
      this.systemBus = DBus.getBus('system');
    } catch (error) {
      console.error('Failed to access system bus ' + error);
    }

    this.getWiFiDevices().then((wifiDevices) => {
      if(wifiDevices.length > 0) {
        this.wifiAdapter = wifiDevices[0];
      }
    }).catch((error) => {
      console.error('Unable to find a Wi-Fi adapter: ' + error);
    });
  },

  /**
   * Scan for a list of Wi-Fi access points and their connection information.
   *
   * @returns {Promise<Array>} An array of objects of the form:
   * {
   *   'id': '1',           // ID of access point from Network Manager
   *   'ssid': 'Subether',  // SSID
   *   'strength': 42,      // Signal strength in percent
   *   'secure': true       // True if secured, false if insecured
   * }
   */
  scanWifiAccessPoints: async function() {
    // Get a list of Wi-Fi access points
    let wifiAccessPoints = await this.getWifiAccessPoints();
    if (!wifiAccessPoints) {
      return [];
    }

    // Get Wi-Fi access point details
    let apRequests = [];
    wifiAccessPoints.forEach((ap) => {
      apRequests.push(this.getAccessPointDetails(ap));
    });
    let responses = await Promise.all(apRequests);

    return responses;
  },

  /**
   * Get a list of available Wi-Fi access points by object path.
   *
   * @returns {Promise<Array>} Resolves with an array of object paths.
   */
  getWifiAccessPoints: function() {
    return new Promise((resolve, reject) => {
      // If no Wi-Fi adapter available, resolve with an empty list.
      if(!this.wifiAdapter) {
        resolve([]);
      }

      // Otherwise get a list of access points available on the first Wi-Fi adapter.
      this.systemBus.getInterface('org.freedesktop.NetworkManager',
        this.wifiAdapter,
        'org.freedesktop.NetworkManager.Device.Wireless',
        function(error, interface) {
        if (error) {
          reject(error);
        }
        interface.getProperty('AccessPoints', function(error, value) {
          if (error) {
            reject(error);
          }
          resolve(value);
        });
      });
    });
  },


  /**
   * Get a list of network adapters from the system network manager.
   *
   * @returns {Promise<Array>} Resolves with an array of object paths.
   */
  getDevices: function() {
    return new Promise((resolve, reject) => {
      if (!this.systemBus) {
        reject('System bus not available');
      }
      this.systemBus.getInterface('org.freedesktop.NetworkManager',
        '/org/freedesktop/NetworkManager',
        'org.freedesktop.NetworkManager',
        function(error, interface) {
        if (error) {
          reject(error);
        }
        interface.GetAllDevices(function(error, result) {
          if (error) {
            reject(error);
          }
          resolve(result);
        });
      });
    });
  },

  /**
   * Get a list of Wi-Fi adapters from the system network manager.
   *
   * @returns {Promise<Array>} Resolves with an array of object paths.
   */
  getWiFiDevices: async function() {
    // Get a list of all network adapter devices
    let devices = await this.getDevices();

    // Request the device type of all devices
    let deviceTypeRequests = [];
    devices.forEach((device) => {
      deviceTypeRequests.push(this.getDeviceType(device));
    });
    let deviceTypes = await Promise.all(deviceTypeRequests);

    // Look for all the devices with a type of 2 (Wi-Fi)
    let wifiDevices = [];
    for (i in deviceTypes) {
      if (deviceTypes[i] == 2) {
        // Note: Array indices of both arrays should match up
        wifiDevices.push(devices[i]);
      }
    }

    // Resolve with the list of Wi-Fi devices
    return wifiDevices;
  },

  /**
   * Get the device type for a given network adapter.
   *
   * @param String id Object path for device.
   * @returns {Promise<Integer>} Resolves with a device type (2 is Wi-Fi).
   */
  getDeviceType: function(id) {
    return new Promise((resolve, reject) => {
      this.systemBus.getInterface('org.freedesktop.NetworkManager',
        id,
        'org.freedesktop.NetworkManager.Device',
        function(error, interface) {
        if (error) {
          reject(error);
        }
        interface.getProperty('DeviceType', function(error, value) {
          if (error) {
            reject(error);
          }
          resolve(value);
        });
      });
    });
  },

  /**
   * Get the connection details for a Wi-Fi Access Point.
   *
   * @param String id Object path of access point.
   * @returns {Promise<Object>} Resolves with an object of the form:
   * {
   *   'id': '1',           // ID of access point from Network Manager
   *   'ssid': 'Subether',  // SSID
   *   'strength': 42,      // Signal strength in percent
   *   'secure': true       // True if secured, false if insecured
   * }
   */
  getAccessPointDetails: function(id) {
    return new Promise((resolve, reject) => {
      let requests = [];
      requests.push(this.getAccessPointSsid(id));
      requests.push(this.getAccessPointStrength(id));
      requests.push(this.getAccessPointSecurity(id));

      // Wait for all properties to be received
      Promise.all(requests).then((properties) => {
        // Strip path from ID.
        id = id.replace('/org/freedesktop/NetworkManager/AccessPoint/', '');
        let response = {
          'id': id,
          'ssid': properties[0],
          'strength': properties[1],
          'secure': properties[2]
        };
        // Resolve with access point details
        resolve(response);
      }).catch((error) => {
        reject(error);
      });
    });

  },

  /**
   * Get the SSID for an access point.
   *
   * @param String id Object path of access point.
   * @returns {Promise<String>} Resolves with an SSID as a string.
   */
  getAccessPointSsid: function(id) {
    return new Promise((resolve, reject) => {
      this.systemBus.getInterface('org.freedesktop.NetworkManager',
        id,
        'org.freedesktop.NetworkManager.AccessPoint',
        function(error, interface) {
        if (error) {
          reject(error);
        }
        interface.getProperty('Ssid', function(error, value) {
          if (error) {
            reject(error);
          }

          // Convert SSID from byte array to string.
          let bytes = new Uint8Array(value);
          let string = new TextDecoder().decode(bytes);

          resolve(string);
        });
      });
    });
  },

  /**
   * Get the signal strength for an access point.
   *
   * @param String id Object path of access point.
   * @returns {Promise<Integer>} Resolves with signal strength in percent.
   */
  getAccessPointStrength: function(id) {
    return new Promise((resolve, reject) => {
      this.systemBus.getInterface('org.freedesktop.NetworkManager',
        id,
        'org.freedesktop.NetworkManager.AccessPoint',
        function(error, interface) {
        if (error) {
          reject(error);
        }
        interface.getProperty('Strength', function(error, value) {
          if (error) {
            reject(error);
          }
          resolve(value);
        });
      });
    });
  },

  /**
   * Get the secured status of an access point.
   *
   * @param String id Object path of access point.
   * @returns {Promise<boolean>} true for secured or false for not secured.
   */
  getAccessPointSecurity: async function(id) {
    // Request WPA and WPA2 flags for access point.
    let requests = [];
    requests.push(this.getAccessPointWPAFlag(id));
    requests.push(this.getAccessPointWPA2Flag(id));

    let responses = await Promise.all(requests);
    if (responses[0] == 0 && responses[1] == 0) {
      return false;
    } else {
      return true;
    }
  },

  /**
   * Get the WPA flags of an access point.
   *
   * @param String id Object path of access point.
   * @returns {Promise<Integer>} Resolves with security flag, zero if none.
   *
   * For values see:
   * https://developer.gnome.org/NetworkManager/1.2/nm-dbus-types.html#NM80211ApSecurityFlags
   */
  getAccessPointWPAFlag: function(id) {
    return new Promise((resolve, reject) => {
      this.systemBus.getInterface('org.freedesktop.NetworkManager',
        id,
        'org.freedesktop.NetworkManager.AccessPoint',
        function(error, interface) {
        if (error) {
          reject(error);
        }
        interface.getProperty('WpaFlags', function(error, value) {
          if (error) {
            reject(error);
          }
          resolve(value);
        });
      });
    });
  },

  /**
   * Get the WPA2 flags of an access point.
   *
   * @param String id Object path of access point.
   * @returns {Promise<Integer>} Resolves with security flag, zero if none.
   *
   * For values see:
   * https://developer.gnome.org/NetworkManager/1.2/nm-dbus-types.html#NM80211ApSecurityFlags
   */
  getAccessPointWPA2Flag: function(id) {
    return new Promise((resolve, reject) => {
      this.systemBus.getInterface('org.freedesktop.NetworkManager',
        id,
        'org.freedesktop.NetworkManager.AccessPoint',
        function(error, interface) {
        if (error) {
          reject(error);
        }
        interface.getProperty('RsnFlags', function(error, value) {
          if (error) {
            reject(error);
          }
          resolve(value);
        });
      });
    });
  },

  /**
   * Connect to Wi-Fi access point.
   *
   * @param {String} id of access point (e.g. 1)
   * @param {String} password provided by user.
   * @returns {Promise}
   */
  connectToWifiAccessPoint: function(id, ssid, secure, password) {
    return new Promise((resolve, reject) => {
      this.systemBus.getInterface('org.freedesktop.NetworkManager',
        '/org/freedesktop/NetworkManager',
        'org.freedesktop.NetworkManager',
        (error, interface) => {

        if (error) {
          reject(error);
        }

        // Generate object path of access point based on id
        let accessPoint = '/org/freedesktop/NetworkManager/AccessPoint/' + id;

        // Convert SSID to an array of bytes
        let ssidBytes = [];
        for (let i = 0; i < ssid.length; ++i) {
          ssidBytes.push(ssid.charCodeAt(i));
        }

        // Assemble connection information
        let connectionInfo = {
          '802-11-wireless': {
            ssid: ssidBytes,
          },
          'connection': {
            id: ssid,
            type: '802-11-wireless',
          }
        };

        if (secure) {
          connectionInfo['802-11-wireless-security'] = {
            'key-mgmt': 'wpa-psk',
            'psk': password,
          }
        }

        interface.AddAndActivateConnection(connectionInfo, this.wifiAdapter,
          accessPoint, function(error, value) {
          if (error) {
            reject(error);
          }
          resolve(value);
        });

      });
    });
  }

}

module.exports = Network;
