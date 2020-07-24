'use strict';

/**
 * WifiNetworkItem represents a Wi-Fi Access Point that can be connected to.
 */
class WifiNetworkItem {
  constructor(data) {
    this.id = data.id;
    this.ssid = data.ssid;
    this.strength = data.strength;
    this.secure = data.secure;
  }

  /**
   * Render HTML.
   */
  render() {
    var id = this.id;
    var ssid = DOMPurify.sanitize(this.ssid); // Sanitise SSID to prevent XSS
    var security = '';
    var icon = '';
    var strength = Math.round(this.strength/25);
    if (this.secure) {
      security = 'secure';
    } else {
      security = 'insecure';
    }
    var icon = security + '-' + strength;

    return `<li id="wifi-network-${id}" class="wifi-network-item">
      <span class="wifi-network-ssid">${ssid}</span>
      <span class="wifi-network-security ${icon}" />
    </li>`;
  }
}
