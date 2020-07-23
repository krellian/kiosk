/**
 * Krellian Kiosk First Time Setup UI.
 */
var Setup = {

  WIFI_ACCESS_POINTS_PATH: '/properties/wifi_access_points',
  CONNECT_TO_WIFI_NETWORK_PATH: '/actions/connect_to_wifi_network',
  SET_PASSWORD_PATH: '/settings/password',
  wifiAccessPoints: [], // Known Wi-Fi access points

  /**
   * Start the first time setup UI.
   */
  start: function() {
    // Elements
    this.screenPasswordSection = document.getElementById('screen-password');
    this.screenPasswordForm = document.getElementById('screen-password-form');
    this.screenPasswordInput = document.getElementById('screen-password-input');
    this.screenPasswordConfirm =
      document.getElementById('screen-password-confirm');
    this.wifiConnectSection = document.getElementById('wifi-connect');
    this.wifiConnectBack = document.getElementById('wifi-connect-back');
    this.wifiPasswordPromptSection =
      document.getElementById('wifi-password-prompt');
    this.wifiNetworkList = document.getElementById('wifi-networks');
    this.wifiPasswordForm = document.getElementById('wifi-password-form');
    this.wifiPasswordBack = document.getElementById('wifi-password-back');
    this.wifiNetworkName = document.getElementById('wifi-network-name');
    this.wifiPasswordInput = document.getElementById('wifi-password-input');
    this.wifiPasswordCheckbox =
      document.getElementById('wifi-password-checkbox');
    this.wifiNetworkId = document.getElementById('wifi-network-id');
    this.wifiNetworkSsid = document.getElementById('wifi-network-ssid');
    this.wifiConnectingSection = document.getElementById('wifi-connecting');

    this.showScreenPasswordSection();
  },

  /**
   * Show the section for setting the screen password.
   */
  showScreenPasswordSection: function() {
    this.screenPasswordInput.addEventListener('input',
      this.handleScreenPasswordInput.bind(this));
    this.screenPasswordConfirm.addEventListener('input',
      this.handleScreenPasswordInput.bind(this));
    this.screenPasswordForm.addEventListener('submit',
      this.handleScreenPasswordSubmit.bind(this));
    this.screenPasswordSection.classList.remove('hidden');
  },

  /**
   * Handle key presses in the password input fields.
   *
   * @param {Event} e input event.
   */
  handleScreenPasswordInput: function(e) {
    var password = this.screenPasswordInput.value;
    var confirm = this.screenPasswordConfirm.value;
    if (!password || !confirm || password != confirm) {
      this.screenPasswordInput.setCustomValidity(
        'Passwords empty or don\'t match');
      this.screenPasswordConfirm.setCustomValidity(
        'Passwords empty or don\'t match');
      return;
    } else {
      this.screenPasswordInput.setCustomValidity('');
      this.screenPasswordConfirm.setCustomValidity('');
    }
  },

  /**
   * Handle submission of the screen password form.
   *
   * @param {Event} e submit event.
   */
  handleScreenPasswordSubmit: function(e) {
    e.preventDefault();
    var password = this.screenPasswordInput.value;
    var payload = '"' + password + '"';
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    const request = {
      method: 'PUT',
      body: payload,
      headers: headers
    };
    fetch(this.SET_PASSWORD_PATH, request).then((response) => {
      if (!response.ok) {
        console.error('Failed to set password');
      } else {
        this.screenPasswordSection.classList.add('hidden');
        this.showWifiConnectSection();
      }
    }).catch((error) => {
      console.error(error);
    });

  },

  /**
   * Hide the screen password section.
   */
  hideScreenPasswordSection: function() {
    this.screenPasswordSection.classList.add('hidden');
    this.screenPasswordInput.removeEventListener('input',
      this.handleScreenPasswordInput.bind(this));
    this.screenPasswordConfirm.removeEventListener('input',
      this.handleScreenPasswordInput.bind(this));
    this.screenPasswordForm.removeEventListener('submit',
      this.handleScreenPasswordSubmit.bind(this));
  },

  /**
   * Show a list of available Wi-Fi networks.
   */
  showWifiConnectSection: function() {
    // Add event listeners
    this.wifiConnectBack.addEventListener('click', (e) => {
      e.preventDefault();
      this.hideWifiConnectSection();
      this.showScreenPasswordSection();
    })
    this.wifiNetworkList.addEventListener('click',
      this.handleWifiConnect.bind(this));
    // Show empty list
    this.wifiConnectSection.classList.remove('hidden');
    // Fetch list of Wi-fi access points
    this.getWifiAccessPoints().then((accessPoints) => {
      this.wifiAccessPoints = accessPoints;
      // Populate list
      accessPoints.forEach((data) => {
        var wifiNetworkItem = new WifiNetworkItem(data);
        var html = wifiNetworkItem.render();
        this.wifiNetworkList.insertAdjacentHTML('beforeend', html);
      });
    });
  },

  /**
   * Get a list of Wi-Fi access points from the server.
   *
   * @returns {Promise} which resolves with array of objects of the form:
   * {
   *   'id': '1',           // ID of access point from Network Manager
   *   'ssid': 'Subether',  // SSID
   *   'strength': 42,      // Signal strength in percent
   *   'secure': true       // True if secured, false if insecured
   * }
   */
  getWifiAccessPoints: function() {
    return new Promise(async (resolve, reject) => {
      const headers = {
        'Accept': 'application/json'
      };
      const request = {
        method: 'GET',
        headers: headers
      };
      fetch(this.WIFI_ACCESS_POINTS_PATH, request).then((response) => {
        resolve(response.json());
      }).catch((error) => {
        console.error('Failed to fetch list of Wi-Fi access points ' + error);
      });
    });
  },

  /**
   * Handle a request to connect to a Wi-Fi access point.
   *
   * @param {Event} e Click event on the selected Wi-Fi network item.
   */
  handleWifiConnect: function(e) {
    var target = e.target;
    // Get a reference to the list element to get its ID
    if (target.tagName != 'LI') {
      target = target.parentElement;
    }
    // Strip prefix from ID
    var id = target.id.replace('wifi-network-','');
    var connectionInfo = null;
    // Locate connection info for the access point selected
    this.wifiAccessPoints.forEach((ap) => {
      if (ap.id == id) {
        connectionInfo = ap;
      }
    });
    if (!connectionInfo) {
      console.error('Access point not found.');
      return;
    }
    // If secure network prompt for password, otherwise try to connect
    if (connectionInfo.secure) {
      this.hideWifiConnectSection();
      this.showWifiPasswordSection(connectionInfo['id'], connectionInfo['ssid']);
    } else {
      this.connectToWifiNetwork(
        connectionInfo['id'],
        connectionInfo['ssid'],
        false
      ).then(() => {
        this.hideWifiConnectSection();
        this.showWifiConnectingSection();
      });
    }
  },

  /**
   * Hide the Wi-fi network list.
   */
  hideWifiConnectSection: function() {
    this.wifiConnectSection.classList.add('hidden');
    // Reset list
    this.wifiNetworkList.innerHTML = '';
    // Remove event listeners
    this.wifiNetworkList.removeEventListener('click',
      this.handleWifiConnect.bind(this));
  },

  /**
   * Display the Wi-Fi password prompt.
   *
   * @param {String} id The id of the access point to connect to.
   * @param {String} ssid The SSID of the access point to connect to.
   */
  showWifiPasswordSection: function(id, ssid) {
    // Add event listeners
    this.wifiPasswordCheckbox.addEventListener('change',
      this.toggleWifiPasswordInput.bind(this));
    this.wifiPasswordBack.addEventListener('click', (e) => {
        e.preventDefault();
        this.hideWifiPasswordPrompt();
        this.showWifiConnectSection();
    });
    this.wifiPasswordForm.addEventListener('submit',
      this.handleWifiPasswordSubmit.bind(this));
    // Set visible SSID
    this.wifiNetworkName.textContent = ssid;
    // Set hidden form fields
    this.wifiNetworkId.value = id;
    this.wifiNetworkSsid.value = ssid;
    // Show password prompt
    this.wifiPasswordPromptSection.classList.remove('hidden');
  },

  /**
   * Hide the Wi-Fi password prompt and show the list of Wi-Fi networks.
   *
   * @param {Event} e Click event.
   */
  hideWifiPasswordPrompt: function() {
    this.wifiPasswordPromptSection.classList.add('hidden');
    this.wifiNetworkName.textContent = '';
    this.wifiPasswordInput.value = '';
    this.wifiNetworkId.value = '';
    this.wifiNetworkSsid.value = '';
    this.wifiPasswordCheckbox.checked = false;
    this.toggleWifiPasswordInput();

    // Remove event listeners
    this.wifiPasswordCheckbox.removeEventListener('change',
      this.toggleWifiPasswordInput.bind(this));
    this.wifiPasswordForm.removeEventListener('submit',
      this.handleWifiPasswordSubmit.bind(this));
  },

  /**
   * Toggle Wi-Fi password field between password and text.
   *
   * @param {Event} e Checkbox change event.
   */
  toggleWifiPasswordInput: function(e) {
    if (e && e.target.checked) {
      this.wifiPasswordInput.setAttribute('type', 'text');
    } else {
      this.wifiPasswordInput.setAttribute('type', 'password');
    }
  },

  /**
   * Handle Wi-Fi password submission.
   *
   * @param {Event} e Form submit event.
   */
  handleWifiPasswordSubmit: function(e) {
    e.preventDefault();
    this.connectToWifiNetwork(
      this.wifiNetworkId.value,
      this.wifiNetworkSsid.value,
      true,
      this.wifiPasswordInput.value
    ).then(() => {
      this.hideWifiPasswordPrompt();
      this.showWifiConnectingSection();
    }).catch((error) => {
      console.error(error);
    });
  },

  /**
   * Request connection to Wi-Fi network.
   *
   * @param {String} id ID of Wi-Fi access point.
   * @param {String} ssid SSID of Wi-Fi network.
   * @param {Boolean} secure Whether Wi-Fi access point is secured by a password.
   * @param {String} password Password to use (if any).
   * @returns {Promise} Promise which resolves upon request.
   */
  connectToWifiNetwork: function(id, ssid, secure, password) {
    return new Promise((resolve, reject) => {
      const payload = {
        'id': id,
        'ssid': ssid,
        'secure': secure
      };
      if (secure) {
        payload.password = password;
      }
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      const request = {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: headers
      };
      fetch(this.CONNECT_TO_WIFI_NETWORK_PATH, request).then((response) => {
        resolve();
      }).catch((error) => {
        console.error(error);
        reject(error);
      });
    });
  },

  /**
   * Inform the user that a connection to Wi-Fi is being attempted.
   */
  showWifiConnectingSection: function() {
    this.wifiConnectingSection.classList.remove('hidden');
  }
}

/**
  * Start Setup on page load.
  */
window.addEventListener('load', function setup_onLoad() {
  window.removeEventListener('load', setup_onLoad);
  Setup.start();
});
