# Krellian Kiosk

[![Snap Status](https://build.snapcraft.io/badge/krellian/kiosk.svg)](https://build.snapcraft.io/user/krellian/kiosk)

Krellian Kiosk is a web runtime for interactive kiosks and digital signage.

It acts as both a web client (to render web content) and a web server (so that screens can be remotely managed over the internet).

*Web Interface*

<img src="https://krellian.com/products/box-c19/images/krellian_box_ui.png" width="500">

*System Chrome*

<img src="https://krellian.com/images/krellian_os_screenshot.png" width="500">

## Building

To get started hacking on Krellian Kiosk first make sure that you have [Git](https://git-scm.com/) installed.

Clone the kiosk repository from GitHub:

```
$ git clone https://github.com/krellian/kiosk.git
$ cd kiosk
```

### Build for Linux desktop

To build for Linux desktop, first make sure that you have [NodeJS](https://nodejs.org/en/) and [NPM](https://www.npmjs.com/) installed.

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

### Build for Ubuntu Core
To build the snap package for Ubuntu core, first make sure that you have [snapcraft](https://snapcraft.io/docs/snapcraft-overview) installed.

Build for armhf using the snapcraft remote build service:

```
$ snapcraft remote-build
```

Tip: If you built locally first, you might want to remove the node_modules directory to save time uploading source code to the remote build server.

## Install on Ubuntu Core

To install a a built snap package of Krellian Kiosk on Ubuntu Core (currently only supported on armhf, Raspberry Pi 3 recommended):
- Follow the [instructions](https://ubuntu.com/download/raspberry-pi-core) to download, flash and configure Ubuntu Core on a Raspberry Pi and connect a display to the Pi
- Copy the built .snap package to the Raspberry Pi then SSH into it, using the IP address displayed on the screen and the username you assigned to your Ubuntu SSO account e.g.

```
$ scp krellian-kiosk_0.1_armhf.snap joebloggs@192.168.1.123:~/
$ ssh joebloggs@192.168.1.123
```

- Install the mir-kiosk, pulseaudio and network-manager snaps (Note: You might be interrupted at this point by snapd rebooting the system one or more times to apply system updates)

```
$ snap install mir-kiosk
$ snap install pulseaudio
$ snap install network-manager
```

(Note: network-manager may drop the network connection after installation, at which point you'll need to hard reboot the Pi and find its new IP address in order to SSH in again)

- Install the krellian-kiosk snap and connect the network-manager interface

```
$ snap install --dangerous ./krellian-kiosk_0.1_armhf.snap
$ snap connect krellian-kiosk:network-manager network-manager:service
$ snap restart krellian-kiosk
```

The kiosk client should then start up full screen and the remote web interface should be running on port 80 of the Raspberry Pi's IP address, e.g. http://192.168.1.123

### Debugging

View service status with:

```
$ systemctl status -l snap.krellian-kiosk.krellian-kiosk.service
```
Follow logs with: 

```
$ sudo journalctl -fu snap.krellian-kiosk.krellian-kiosk.service
```


## Command Line Arguments

The Krellian Kiosk application accepts command line arguments as follows:

```
-p        HTTP port for system services (default 8080, special value "systemd" gets port from systemd)
```

e.g.

```
$ ./node_modules/electron/dist/electron . -p 8000
```

Note: The snap package binds to port 80 rather than 8080 by default.

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
