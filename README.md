# Krellian Kiosk

[![Snap Status](https://build.snapcraft.io/badge/krellian/kiosk.svg)](https://build.snapcraft.io/user/krellian/kiosk)

Krellian Kiosk is a web runtime for interactive kiosks and digital signage.

It acts as both a web client (to render web content) and a web server (so that screens can be remotely managed over the internet).

*Web Interface*

<img src="https://krellian.com/products/box-c19/images/krellian_box_ui.png" width="500">

*System Chrome*

<img src="https://krellian.com/images/krellian_os_screenshot.png" width="500">

## Getting Started

To get started hacking on Krellian Kiosk first make sure that you have [Git](https://git-scm.com/), [NodeJS](https://nodejs.org/en/) and [NPM](https://www.npmjs.com/) installed.

Then simply clone the Shell Kiosk repository from GitHub and run it.

```
$ git clone https://github.com/krellian/kiosk.git
$ cd kiosk
$ npm install
$ npm start
```
The kiosk client should then start up full screen and the remote web interface should be running at http://localhost:8080

The web client uses Electron and the web server uses NodeJS.

## Copyrights, Trademarks and Licensing

© Krellian Ltd. 2020

Krellian Kiosk is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Krellian Kiosk is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Krellian Kiosk in the LICENSE file. If not, see
<http://www.gnu.org/licenses/>.
