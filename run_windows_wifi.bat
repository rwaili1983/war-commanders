@echo off
chcp 65001 >nul
cd /d "%~dp0"
set LAN_DISCOVERY=1
set LAN_DISCOVERY_PORT=38989
node server.js
if errorlevel 1 (
  echo.
  echo Node.js 20+ is required. Install it from nodejs.org
  pause
)
