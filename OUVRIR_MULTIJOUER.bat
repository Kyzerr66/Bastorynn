@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Installe Node.js depuis https://nodejs.org puis relance ce fichier.
 pause
 exit /b 1
)
node server.cjs --open
pause
