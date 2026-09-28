#!/bin/bash
clear
echo "================================================================"
echo "          ManaBox to Archidekt Deck Sync - 1-Click Setup"
echo "================================================================"
echo ""
echo "Step 1: Chrome is opening to your Extensions page..."
echo "Step 2: In Chrome, turn the [Developer mode] switch ON (top-right)."
echo "Step 3: Drag and drop THIS folder into the Chrome window!"
echo "Step 4: Click the puzzle icon (🧩) in Chrome and PIN the extension."
echo ""
echo "================================================================"
echo ""

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# Open current folder in Finder
open "$DIR"

# Launch Chrome to extensions page
open -a "Google Chrome" "chrome://extensions" 2>/dev/null || open -a "Brave Browser" "chrome://extensions" 2>/dev/null || open "chrome://extensions" 2>/dev/null

echo "Folder opened in Finder and Chrome launched!"
echo "Just drag the folder into Chrome and you're done!"
echo ""
read -p "Press [Enter] to exit..."
