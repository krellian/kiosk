#!/bin/bash -e

# Script to start krellian-kiosk on launch.

# Enable the daemon
snapctl start --enable "$SNAP_NAME.krellian-kiosk"

# Add a hack to start the socket activated service on launch
# See https://bugs.launchpad.net/snapd/+bug/1914121
# and https://github.com/anonymouse64/test-go-socket-activation-snap
attempts=0
until curl http://localhost:80/ping; do
    sleep 1
    attempts=$(( attempts + 1 ))
    if [ "$attempts" = 10 ]; then
        exit 1
    fi
done
