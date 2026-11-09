#!/usr/bin/env sh
cd "$(dirname "$0")"
LAN_DISCOVERY=1 LAN_DISCOVERY_PORT=38989 node server.js
