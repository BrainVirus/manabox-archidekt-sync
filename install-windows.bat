@echo off
title ManaBox to Archidekt Sync - Installer
color 0A
cls
echo ================================================================
echo           ManaBox to Archidekt Deck Sync - 1-Click Setup
echo ================================================================
echo.
echo Step 1: Chrome is opening to your Extensions page...
echo Step 2: In Chrome, turn the [Developer mode] switch ON (top-right).
echo Step 3: Drag and drop THIS folder into the Chrome window!
echo Step 4: Click the puzzle icon (🧩) in Chrome and PIN the extension.
echo.
echo ================================================================
echo.

:: Open current folder in Windows Explorer
start "" explorer.exe "%~dp0"

:: Launch Chrome to extensions page
start "" chrome.exe "chrome://extensions" 2>nul || start "" "chrome://extensions" 2>nul

echo Folder opened and Chrome launched!
echo Just drag the folder into Chrome and you're done!
echo.
pause
