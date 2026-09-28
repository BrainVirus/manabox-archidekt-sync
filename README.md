# ManaBox ➔ Archidekt Sync (Chrome Extension)

A Chrome/Chromium extension side panel that compares and syncs Magic: The Gathering deck changes from **ManaBox** directly into **Archidekt**.

---

## 🚀 30-Second Quick Start (Grandma-Proof Setup)

No technical knowledge or Chrome Web Store account needed!

```
┌────────────────────────────────────────────────────────────────────────┐
│  STEP 1: Download & Unzip                                             │
│  ⬇️ Download the latest "manabox-archidekt-sync.zip" release           │
│  📂 Right-click ➔ "Extract All" (or double-click to unzip).            │
├────────────────────────────────────────────────────────────────────────┤
│  STEP 2: Open Extensions in Chrome                                     │
│  🌐 Open Google Chrome (or Brave / Edge).                              │
│  ⌨️  In your URL bar, type: chrome://extensions and press Enter.        │
│  🔘 In the top-right corner, switch "Developer mode" to ON.            │
├────────────────────────────────────────────────────────────────────────┤
│  STEP 3: Drag & Drop!                                                  │
│  🖱️ Drag the unzipped folder and DROP it right into Chrome!           │
│     (Or click the "Load unpacked" button and select the folder)        │
├────────────────────────────────────────────────────────────────────────┤
│  STEP 4: Pin It!                                                       │
│  🧩 Click the puzzle piece icon in Chrome's top-right toolbar.         │
│  📌 Click the PIN icon next to "ManaBox ➔ Archidekt Deck Sync".       │
└────────────────────────────────────────────────────────────────────────┘
```

> [!TIP]
> **Windows Users**: You can simply double-click `install-windows.bat` inside the unzipped folder — it automatically opens Chrome straight to the extensions page and opens the folder side-by-side!  
> **Mac Users**: Double-click `install-mac.command` for the same 1-click shortcut.

---

## ✨ Features

- **⚡ Direct In-Browser Sync**: No manual card copying or CSV exporting required.
- **✨ Printing & Finish Detection**: Accurately detects set codes, collector numbers (e.g. borderless variants), and card finishes (Foil vs. Normal vs. Etched).
- **🔄 Bulk Deck Sync**: Save all your deck pairs and check or sync all of them in one click.
- **🎯 Active Tab Deck Detection**: Automatically grabs the deck ID from your active Archidekt browser tab.
- **🔒 Zero Credentials Stored**: Detects your existing Archidekt browser session cookie (`tbJwt`) securely without ever asking for passwords.
- **📋 Mass Edit Clipboard Copy**: Easily export changes formatted for Archidekt's Mass Edit tool with `*F*` (foil) and `*E*` (etched) notation.
- **📦 1-Click JSON Backup & Restore**: Export and import all your saved deck pairings anytime.

---

## 🎮 How to Use It

1. **Open the Side Panel**:
   Click the pinned extension icon in your Chrome toolbar. The sync tool will slide out as a side panel on the right side of your browser.

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

Read our full [Privacy Policy](PRIVACY_POLICY.md) for details.
