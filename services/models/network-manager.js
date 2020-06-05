const DBus = require('dbus');

/**
 * NetworkManager is responsible for configuring network interfaces
 * using NetworkManager via DBus.
 */
const NetworkManager = {
  
  systemBus: null, // Connection to system bus (dBus)
  wifiAdapter: null, // Primary Wi-Fi adapter (object path)
  
  /**
   * Start network manager by opening connection to system bus and finding
   * primary Wi-Fi adapter.
   */
  start: async function() {
    this.systemBus = DBus.getBus('system');
    var wifiDevices = await this.getWiFiDevices();
    if(wifiDevices.length > 0) {
      this.wifiAdapter = wifiDevices[0];
    }
  },

  /**
   * Scan for a list of Wi-Fi access points and their connection information.
   *
   * @returns {Array} An array of objects of the form: 
   * {
   *   'id': '1',           // ID of access point from Network Manager
   *   'ssid': 'Subether',  // SSID
   *   'strength': 42,      // Signal strength in percent
   *   'secure': true       // True if secured, false if insecured
   * }
   */
  scanWifiAccessPoints: async function() {
    return new Promise(async (resolve, reject) => {
      var wifiAccessPoints = [];
      wifiAccessPoints = await this.getWifiAccessPoints();
      var apRequests = [];
      wifiAccessPoints.forEach((ap) => {
        apRequests.push(this.getAccessPointDetails(ap));
      });
      Promise.all(apRequests).then((responses) => {
        resolve(responses);
      }).catch((error) => {
        var error = 'Failed to scan for Wi-Fi access points: ' + error;
        reject(error);  
      });
    });
  },
  
  /**
   * Get a list of available Wi-Fi access points by object path.
   *
   * @returns {Promise} Resolves with an array of object paths.
   */
  getWifiAccessPoints: async function() {
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
          var error = 'Error accessing wireless interface: ' + error;
          console.error(error);
          reject(error);
        }
        interface.getProperty('AccessPoints', function(error, value) {
          if (error) {
            var error = 'Error getting list of access points: ' + error;
            console.error(error);
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
   * @returns {Promise} Resolves with an array of object paths.
   */
  getDevices: function() {
    return new Promise((resolve, reject) => {
      this.systemBus.getInterface('org.freedesktop.NetworkManager', 
        '/org/freedesktop/NetworkManager',
        'org.freedesktop.NetworkManager', 
        function(error, interface) {
        if (error) {
          console.error('Error accessing network manager via dbus: ' + error);
          reject('Error accessing network manager via dbus: ' + error);
        }
        interface.GetAllDevices(function(error, result) {
          if (error) {
            console.error('Error getting devices from network manager: ' + error);
            reject('Error getting devices from network manager: ' + error);
          }
          resolve(result);
        });
      });
    });
  },
  
  /**
   * Get a list of Wi-Fi adapters from the system network manager.
   *
   * @returns {Promise} Resolves with an array of object paths.
   */
  getWiFiDevices: async function() {
    return new Promise(async (resolve, reject) => {
      // Get a list of all network adapter devices
      var devices = [];
      devices = await this.getDevices();
      
      // Request the device type of all devices
      var deviceTypeRequests = [];
      devices.forEach((device) => {
        deviceTypeRequests.push(this.getDeviceType(device));
      });

      // Wait for all device types to be retrieved
      Promise.all(deviceTypeRequests).then((deviceTypes) => {
        // Look for all the devices with a type of 2 (Wi-Fi)
        var wifiDevices = [];
        for (i in deviceTypes) {
          if (deviceTypes[i] == 2) {
            // Note: Array indices of both arrays should match up
            wifiDevices.push(devices[i]);
          }
        }
        // Resolve with the list of Wi-Fi devices
        resolve(wifiDevices);
      }).catch((error) => {
        reject(error);
      });
    });  
  },
  
  /**
   * Get the device type for a given network adapter.
   *
   * @param String id Object path for device.
   * @returns {Promise} Resolves with a device type (2 is Wi-Fi).
   */
  getDeviceType: async function(id) {
    return new Promise((resolve, reject) => {
      this.systemBus.getInterface('org.freedesktop.NetworkManager', 
        id,
        'org.freedesktop.NetworkManager.Device', 
        function(error, interface) {
        if (error) {
          var error = 'Error getting interface to network device: ' + error;
          console.error(error);
          reject(error);
        }
        interface.getProperty('DeviceType', function(error, value) {
          if (error) {
            var error = 'Error getting device type of network adapter: ' +
              error;
            console.error(error);
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
   * @returns {Promise} Resolves with an object of the form:
   * {
   *   'id': '1',           // ID of access point from Network Manager
   *   'ssid': 'Subether',  // SSID
   *   'strength': 42,      // Signal strength in percent
   *   'secure': true       // True if secured, false if insecured
   * }
   */
  getAccessPointDetails: async function(id) {
    return new Promise((resolve, reject) => {
      var requests = [];
      requests.push(this.getAccessPointSsid(id));
      requests.push(this.getAccessPointStrength(id));
      requests.push(this.getAccessPointSecurity(id));
      
      // Wait for all properties to be received
      Promise.all(requests).then((properties) => {
        // Strip path from ID.
        id = id.replace('/org/freedesktop/NetworkManager/AccessPoint/', '');
        var response = {
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
   * @returns {Promise} Resolves with an SSID as a string.
   */
  getAccessPointSsid: function(id) {
    return new Promise((resolve, reject) => {
      this.systemBus.getInterface('org.freedesktop.NetworkManager', 
        id,
        'org.freedesktop.NetworkManager.AccessPoint', 
        function(error, interface) {
        if (error) {
          var error = 'Error getting interface to access point: ' + error;
          console.error(error);
          reject(error);
        }
        interface.getProperty('Ssid', function(error, value) {
          if (error) {
            var error = 'Error getting SSID of access point: ' +
              error;
            console.error(error);
            reject(error);
          }
          
          // Convert SSID from byte array to string.
          var bytes = new Uint8Array(value);
          var string = new TextDecoder().decode(bytes);
          
          resolve(string);
        });
      });
    });     
  },
  
  /**
   * Get the signal strength for an access point.
   *
   * @param String id Object path of access point.
   * @returns {Promise} Resolves with signal strength in percent.
   */
  getAccessPointStrength: function(id) {
    return new Promise((resolve, reject) => {
      this.systemBus.getInterface('org.freedesktop.NetworkManager', 
        id,
        'org.freedesktop.NetworkManager.AccessPoint', 
        function(error, interface) {
        if (error) {
          var error = 'Error getting interface to access point: ' + error;
          console.error(error);
          reject(error);
        }
        interface.getProperty('Strength', function(error, value) {
          if (error) {
            var error = 'Error getting strength of access point: ' +
              error;
            console.error(error);
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
   * @returns {Promise} Resolves with true for secured or false for not secured.
   */
  getAccessPointSecurity: function(id) {
    return new Promise((resolve, reject) => {
      // Request WPA and WPA2 flags for access point.
      var requests = [];
      requests.push(this.getAccessPointWPAFlag(id));
      requests.push(this.getAccessPointWPA2Flag(id));
      
      // Wait for both flags to be returned
      Promise.all(requests).then((responses) => {
        // If both are 0 then access point is not secured.
        if (responses[0] == 0 && responses[1] == 0) {
          resolve(false);
        } else {
          resolve(true);
        }
      }).catch((error) => {
        reject(error);
      });
    });
  },
   
  /**
   * Get the WPA flags of an access point.
   *
   * @param String id Object path of access point.
   * @returns {Promise} Resolves with an integer security flag, zero if none.
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
          var error = 'Error getting interface to access point: ' + error;
          console.error(error);
          reject(error);
        }
        interface.getProperty('WpaFlags', function(error, value) {
          if (error) {
            var error = 'Error getting WPA flag of access point: ' +
              error;
            console.error(error);
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
   * @returns {Promise} Resolves with an integer security flag, zero if none.
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
          var error = 'Error getting interface to access point: ' + error;
          console.error(error);
          reject(error);
        }
        interface.getProperty('RsnFlags', function(error, value) {
          if (error) {
            var error = 'Error getting WPA2 flag of access point: ' +
              error;
            console.error(error);
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
   */
  connectToWifiAccessPoint: function(id, ssid, secure, password) {
    return new Promise((resolve, reject) => {
      this.systemBus.getInterface('org.freedesktop.NetworkManager', 
        '/org/freedesktop/NetworkManager',
        'org.freedesktop.NetworkManager', 
        (error, interface) => {
        
        if (error) {
          var error = 'Error getting interface to access point: ' + error;
          console.error(error);
          reject(error);
        }
        
        // Generate object path of access point based on id
        var accessPoint = '/org/freedesktop/NetworkManager/AccessPoint/' + id;
                
        // Convert SSID to an array of bytes
        var ssidBytes = [];
        for (var i = 0; i < ssid.length; ++i) {
          ssidBytes.push(ssid.charCodeAt(i));
        }
        
        // Assemble connection information
        var connectionInfo = {
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
            var error = 'Error connecting to access point: ' + error;
            console.error(error);
            reject(error);
          }
          console.log('Success: ' + value);
          resolve(value);
        });
        
      });
    });  
  }
  
}

module.exports = NetworkManager;