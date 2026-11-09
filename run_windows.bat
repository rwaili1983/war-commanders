@echo off
chcp 65001 > nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Node.js 20 or newer is needed. Install Node.js first.
 pause
 exit /b 1
)
echo WAR COMMANDERS is starting at http://localhost:8787
start "WAR COMMANDERS SERVER" cmd /k "node server.js"
timeout /t 2 /nobreak > nul
start "" "http://localhost:8787"
