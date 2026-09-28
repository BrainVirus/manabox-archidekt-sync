#!/bin/bash
set -e

# Package script for ManaBox -> Archidekt Deck Sync
# Generates a clean release zip ready to distribute to users.

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$SCRIPT_DIR"

DIST_DIR="$SCRIPT_DIR/dist"
STAGE_DIR="$DIST_DIR/manabox-archidekt-sync"
VERSION=$(grep '"version"' manifest.json | head -n 1 | sed -E 's/.*"version": "([^"]+)".*/\1/')
ZIP_NAME="manabox-archidekt-sync-v${VERSION}.zip"

echo "=========================================="
echo "Packaging ManaBox ➔ Archidekt Sync v${VERSION}"
echo "=========================================="

rm -rf "$DIST_DIR"
mkdir -p "$STAGE_DIR"
mkdir -p "$STAGE_DIR/icons"

# Copy essential extension files
cp manifest.json "$STAGE_DIR/"
cp service-worker.js "$STAGE_DIR/"
cp sidepanel.html "$STAGE_DIR/"
cp sidepanel.css "$STAGE_DIR/"
cp sidepanel.js "$STAGE_DIR/"
cp README.md "$STAGE_DIR/"
cp PRIVACY_POLICY.md "$STAGE_DIR/"
cp install-windows.bat "$STAGE_DIR/"
cp install-mac.command "$STAGE_DIR/"
cp icons/*.png "$STAGE_DIR/icons/"

# Create release zip
cd "$DIST_DIR"
zip -r "$ZIP_NAME" manabox-archidekt-sync/

echo "=========================================="
echo "✅ Build complete! Release bundle created at:"
echo "   dist/$ZIP_NAME"
echo "=========================================="
