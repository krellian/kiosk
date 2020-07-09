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

Clone the kiosk repository from GitHub:

```
$ git clone https://github.com/krellian/kiosk.git
$ cd kiosk
```

Install dependencies and build for correct node version:
```
$ sudo apt-get install libdbus-1-dev
$ sudo apt-get install libglib2.0-dev
$ npm install -g node-gyp
$ npm install
$ ./node_modules/.bin/electron-rebuild
```
(commands may differ if you're not using a Debian-based Linux distribution)

Start the application:
```
$ npm start
```

The kiosk client should then start up full screen and the remote web interface should be running at http://localhost:8080

The web client uses Electron and the web server uses NodeJS.

## Install on Ubuntu Core

To install a pre-release snap package of Krellian Kiosk on Ubuntu Core (currently only supported on Raspberry Pi, Raspberry Pi 3 recommended):
- Follow the [instructions](https://ubuntu.com/download/raspberry-pi-core) to download, flash and configure Ubuntu Core on a Raspberry Pi (and connect a display to the Pi)
- Download the [latest developer build](https://build.snapcraft.io/user/krellian/kiosk/) by clicking on a build, copying and pasting the URL from the first line in the build log and downloading the krellian-kiosk_0.1_armhf.snap file to your desktop computer
- Copy the snap package to the Raspberry Pi e.g.

```
$ scp krellian-kiosk_0.1_armhf.snap joebloggs@192.168.1.123:~/
```

- SSH into the Raspberry Pi and install the network-manager snap

```
$ snap install network-manager
```

(May need to hard reboot the Pi for the network manager to reconfigure the network and then SSH back in)

- Install the krellian-kiosk snap and connect the network-manager interface

```
$ snap install --dangerous ./krellian-kiosk_0.1_armhf.snap
$ snap connect krellian-kiosk:network-manager network-manager:service
$ snap restart krellian-kiosk
```

The kiosk client should then start up full screen and the remote web interface should be running at http://localhost:8080

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
