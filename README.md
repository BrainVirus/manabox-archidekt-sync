# ManaBox ➔ Archidekt Sync (Chrome Extension)

A Chrome/Chromium extension side panel that compares and syncs Magic: The Gathering deck changes from **ManaBox** directly into **Archidekt**.

---

## 📥 How to Install (Step-by-Step Guide)

You do **not** need a developer account or coding knowledge. This runs locally in any Chromium-based browser (**Google Chrome**, **Brave**, **Microsoft Edge**, or **Opera**).

---

### Step 1: Download the Files
1. At the top of this GitHub repository, click the green **`<> Code`** button.
2. Click **`Download ZIP`**.
3. Open your computer's **Downloads** folder and **unzip / extract** the downloaded file:
   - **Windows**: Right-click the downloaded `.zip` file ➔ click **"Extract All..."** ➔ click **Extract**.
   - **Mac**: Double-click the downloaded `.zip` file to extract the folder.

> [!IMPORTANT]
> Make sure you **extract** the `.zip` file before trying to install it. Chrome cannot read zipped files directly.  
> We recommend moving the extracted folder to your `Documents` or a folder where it won't be accidentally deleted.

---

### Step 2: Open Extensions in Chrome
1. Open **Google Chrome** (or Brave / Edge).
2. Copy and paste this into your browser's address bar and press **Enter**:
   ```
   chrome://extensions
   ```
3. In the **top-right corner** of the page, switch the **"Developer mode"** toggle to **ON**.

---

### Step 3: Load the Extension (Two Easy Methods)

#### Method A (Easiest — Drag & Drop):
- Open your computer's file explorer showing the extracted folder.
- Simply **drag and drop** the extracted `manabox-archidekt-sync-main` folder directly into the Chrome `chrome://extensions` browser window!

#### Method B (Using "Load unpacked"):
1. In `chrome://extensions`, click the **"Load unpacked"** button in the top-left corner.
2. In the folder picker window, select the extracted folder (the one containing `manifest.json`).
3. Click **Select Folder** (or **Open** on Mac).

---

### Step 4: Pin the Extension to Your Toolbar
Chrome automatically hides newly installed extensions behind the puzzle icon:
1. Click the **puzzle piece icon** (🧩) in Chrome's top-right toolbar (next to your profile icon).
2. Look for **ManaBox ➔ Archidekt Deck Sync** in the dropdown list.
3. Click the **Pin icon** (📌) next to it so it stays visible on your toolbar for convenient 1-click access!

---

## 🔄 How to Update When New Changes Are Released

When new features or bug fixes are added:
1. Download the latest version from GitHub and extract it.
2. Open `chrome://extensions` in your browser.
3. Find **ManaBox ➔ Archidekt Deck Sync** and click the small **Reload icon** (🔄).
4. That's it! Your saved deck pairings and preferences will remain completely safe in your browser's local storage.

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

---

## ❓ Frequently Asked Questions & Troubleshooting

<details>
<summary><strong>"Manifest file is missing or unreadable" error</strong></summary>

This happens if Chrome was pointed to a parent folder or if the zip wasn't unzipped.
- Make sure you extracted the `.zip` file completely.
- When clicking "Load unpacked", open the folder until you see `manifest.json`, `sidepanel.html`, and `sidepanel.js`, and select that folder.
</details>

<details>
<summary><strong>Do I need to keep the folder on my computer?</strong></summary>

Yes! Chrome runs the extension directly from the folder on your hard drive. If you delete or move the folder, Chrome won't be able to find the files. We recommend placing the unzipped folder in your `Documents` folder.
</details>

<details>
<summary><strong>Does this work in Brave, Edge, or Opera?</strong></summary>

Yes! Any Chromium-based browser supports Chrome extensions:
- **Brave**: Navigate to `brave://extensions`
- **Edge**: Navigate to `edge://extensions`
- **Opera**: Navigate to `opera://extensions`

The steps are identical.
</details>

---

## ⚖️ Disclaimer & Legal

This extension is an independent open-source project created for the Magic: The Gathering community.

- **Non-Affiliation:** This project is not affiliated with, authorized by, maintained by, or endorsed by **ManaBox** or **Archidekt**. All product and company names are trademarks™ or registered® trademarks of their respective holders. Use of them does not imply any affiliation with or endorsement by them.
- **Wizards of the Coast IP:** Portions of this software (such as card names, text, and artwork retrieved via Scryfall) are unofficial Fan Content permitted under the Wizards of the Coast Fan Content Policy. Not approved or endorsed by Wizards. Portions of the materials used are property of Wizards of the Coast LLC. &copy; Wizards of the Coast LLC.
- **Warranty & Liability:** This software is provided "as is", without warranty of any kind, express or implied. Always verify your deck changes.

