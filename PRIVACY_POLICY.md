# Privacy Policy for ManaBox ➔ Archidekt Deck Sync

> Last Updated: September 27, 2026

ManaBox ➔ Archidekt Deck Sync is committed to protecting your privacy. This privacy policy describes what data the extension accesses, how it is used, and how it is protected.

---

## 1. What Data We Access

- **Deck URLs & Card Lists**: When you input a ManaBox or Archidekt deck URL, the extension accesses the public card list associated with that deck to perform comparisons.
- **Archidekt Authentication Cookie (`tbJwt`)**: To allow you to sync changes directly into your Archidekt deck without entering your password, the extension reads the existing login cookie created by Archidekt.com in your browser.
- **Saved Deck Pairings**: The nicknames, ManaBox URLs, Archidekt URLs, commander names, and commander card artwork URLs that you choose to save.

## 2. What Data We Do NOT Collect

- We do **not** collect your name, email address, password, or financial information.
- We do **not** track your general browsing history or monitor web pages outside of `archidekt.com` and `manabox.app`.
- We do **not** use telemetry, tracking pixels, analytics scripts, or advertising identifiers.

## 3. How Data Is Stored

- All saved deck pairings and UI preferences are stored **100% locally** on your device using Chrome's local storage API (`chrome.storage.local`).
- Your authentication token is never stored in external databases or sent to any developer-owned servers.

## 4. How Data Is Used & Transmitted

- **Deck Data**: Transmitted directly between your browser and `manabox.app` / `archidekt.com` to fetch card lists and apply your requested card additions, removals, and modifications.
- **Card Artwork**: Loaded directly from Scryfall's public content delivery network for visual identification.
- **Zero Third-Party Sharing**: No data is sold, rented, monetized, or shared with third parties, data brokers, or advertising networks.

## 5. User Control & Data Deletion

- You have full control over your saved deck data.
- You can delete any individual deck pairing directly from the extension UI.
- You can export and backup all your saved pairings to JSON at any time.
- Uninstalling the extension completely deletes all stored data and permissions from your browser.

## 6. Open Source & Transparency

The source code for this extension is open and auditable on GitHub:
https://github.com/BrainVirus/manabox-archidekt-sync

## 7. Contact & Inquiries

If you have questions, feedback, or concerns regarding this privacy policy, please open an issue on the project's GitHub repository:
https://github.com/BrainVirus/manabox-archidekt-sync/issues
