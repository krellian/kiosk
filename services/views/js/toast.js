'use strict';

/**
 * Toast - a transient popup alert to show the user a message.
 */
class Toast {
  constructor(message) {
    this.message = message;
  }

  /**
   * Render HTML.
   */
  render() {
    var message = this.message;
    return `<li class="toast">${message}</li>`;
  }
}
