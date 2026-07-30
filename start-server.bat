@echo off
title Dev & Life Odyssey Blog Server
echo Starting Dev & Life Odyssey Blog on http://localhost:8080...
powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1" -Port 8080
pause
