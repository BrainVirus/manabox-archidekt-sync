# ManaBox ➔ Archidekt Sync (Chrome Extension)

A Chrome/Chromium extension side panel that compares and syncs Magic: The Gathering deck changes from **ManaBox** directly into **Archidekt**.

---

## ✨ Features

- **⚡ Direct In-Browser Sync**: No manual card copying or CSV exporting required.
- **✨ Printing & Finish Detection**: Accurately detects set codes, collector numbers (e.g. borderless variants), and card finishes (Foil vs. Normal vs. Etched).
- **🔄 Bulk Deck Sync**: Save all your deck pairs and check or sync all of them in one click.
- **🎯 Active Tab Deck Detection**: Automatically grabs the deck ID from your active Archidekt browser tab.
- **🔒 Zero Credentials Stored**: Detects your existing Archidekt browser session cookie (`tbJwt`) securely without ever asking for passwords.
- **📋 Mass Edit Clipboard Copy**: Easily export changes formatted for Archidekt's Mass Edit tool with `*F*` (foil) and `*E*` (etched) notation.

---

## ⚡ How to Install in Chrome / Chromium (Takes 30 Seconds)

You do **not** need to publish to the Chrome Web Store or have a developer account. This runs as a private, local unpacked extension.

1. Open **Google Chrome** (or Chromium / Brave / Edge).
2. In the URL address bar, navigate to:
   ```
   chrome://extensions
   ```
3. In the top-right corner, toggle **"Developer mode"** to **ON**.
4. Click the **"Load unpacked"** button in the top-left corner.
5. In the file picker, select this directory (e.g. `~/Projects/manabox-archidekt-extension`).
6. **Done!** Click the puzzle piece icon (🧩) in Chrome's toolbar and pin **ManaBox ➔ Archidekt Sync**.

---

## 🎮 How to Use It

1. **Open the Side Panel**:
   Click the extension icon in your Chrome toolbar. The sync tool will slide out as a side panel on the right side of your browser.

2. **Select Decks**:
   - If you have an Archidekt deck open, click **"🎯 Current Tab"** to auto-fill the target deck.
   - In ManaBox on your phone, tap **⋮** ➔ **Share** ➔ **Link** (tap "Update link" if you made recent changes), and paste the link into the **ManaBox Deck** input.
   - Click **"💾 Save"** to bookmark this pairing for quick access later.

3. **Compare & Sync**:
   - Click **"⚡ Compare Decks"** to view additions (🟢), removals (🔴), and modifications (🟡/🟣).
   - Card printings, collector numbers, and foil finishes are automatically compared.
   - Click **"🚀 Sync to Archidekt"**. The cards will be patched directly to your Archidekt deck, and your open Archidekt tab will automatically reload!

4. **Bulk Sync**:
   - Click **"⚡ Bulk Check / Sync"** above your saved pairs to scan all your saved decks at once and sync all updates in one batch.

---

## 🔒 Security & Privacy

- **100% Local**: All code runs inside your browser sandbox on your machine.
- **No Password Stored**: Uses your existing logged-in browser session cookie (`tbJwt`).
- **No Third-Party Servers**: Requests go directly between your browser and `manabox.app` / `archidekt.com`.
- **Strictly Scoped Permissions**: Chrome restricts the extension to only talk to `archidekt.com` and `manabox.app`. It cannot access or read any other websites.
