#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
echo 'WAR COMMANDERS will run at http://localhost:8787'
node server.js
