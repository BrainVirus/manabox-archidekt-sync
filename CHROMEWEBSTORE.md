# Chrome Web Store Listing — ManaBox ➔ Archidekt Deck Sync

> Last Updated: 2026-09-27

## Store Listing

**Extension Name** [REQUIRED]
ManaBox ➔ Archidekt Deck Sync

**Short Description** [REQUIRED]
Compare and sync Magic: The Gathering deck changes from ManaBox directly to Archidekt.

**Detailed Description** [REQUIRED]
Easily keep your Magic: The Gathering decks synchronized between ManaBox on your phone and Archidekt in your browser.

ManaBox is fantastic for fast mobile brewing, collecting, and tracking paper cards, while Archidekt offers premier desktop visualization, playtesting, and analysis. ManaBox ➔ Archidekt Deck Sync bridges the gap with a lightweight browser side panel that automatically spots card differences and applies updates in seconds.

KEY FEATURES

• One-Click Deck Comparison: Instantly view added, removed, and modified cards with color-coded diff badges.
• Printing & Variant Accuracy: Accurately tracks set codes, collector numbers (including borderless, showcase, and extended arts), and finishes (Foil, Etched, and Normal).
• Bulk Deck Management: Save all your deck pairings to check your entire collection for differences and sync multiple decks in one batch.
• Automatic Tab Detection: Detects when you have an Archidekt deck open in your active browser tab and auto-fills the deck ID.
• Seamless Session Recovery: Automatically detects your active Archidekt browser login without passwords, and offers one-click session renewal if credentials expire.
• Offline Backup & Restore: Export and import all your saved deck pairings as clean JSON anytime.

HOW TO USE IT

1. Open the extension side panel from your Chrome toolbar.
2. Enter your public ManaBox deck link and Archidekt deck URL or ID (or click "Current Tab" if already on Archidekt).
3. Click "Compare Decks" to preview changes.
4. Click "Sync to Archidekt" to apply your edits directly to your Archidekt deck.

PRIVACY & PERMISSIONS

This extension runs completely locally inside your browser sandbox. It does not run background analytics, tracking pixels, or third-party servers. Network communication occurs exclusively between your browser, manabox.app, and archidekt.com to fetch deck data and apply your requested card updates.

SUPPORT & ISSUES

Have questions, suggestions, or found a bug? Check out the project on GitHub:
https://github.com/BrainVirus/manabox-archidekt-sync

**Category** [REQUIRED]
Productivity

**Single Purpose** [REQUIRED]
Compare and sync Magic: The Gathering deck changes from ManaBox directly to Archidekt.

**Primary Language** [REQUIRED]
English

---

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon [REQUIRED] | 128×128 PNG | ✅ Ready | `icons/icon-128.png` |
| Screenshot 1 [REQUIRED] | 1280×800 or 640×400 | ⬜ To capture | Side panel inspecting deck diff |
| Screenshot 2 [RECOMMENDED] | 1280×800 or 640×400 | ⬜ To capture | Bulk deck sync modal |
| Screenshot 3 [RECOMMENDED] | 1280×800 or 640×400 | ⬜ To capture | Commander card cards and sorting |
| Small Promo Tile [RECOMMENDED] | 440×280 | ⬜ To create | |
| Marquee Promo Tile | 1400×560 | ⬜ To create | |

---

## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| `sidePanel` | permissions | Displays the sync comparison, saved deck library, and bulk sync tools directly beside open browser tabs. |
| `storage` | permissions | Saves user-configured deck pairings, nicknames, and sort preferences locally on the user's computer. |
| `cookies` | permissions | Reads the active Archidekt session token (`tbJwt`) from the user's browser to authenticate card modification requests without collecting or storing account passwords. |
| `tabs` | permissions | Detects active Archidekt deck tabs to auto-populate deck IDs ("Current Tab") and reloads the deck page after changes are synced so the user immediately sees their updated deck. |
| `https://archidekt.com/*` | host_permissions | Fetches deck card data from Archidekt's public API and submits user-approved card additions, removals, and modifications to Archidekt. |
| `https://manabox.app/*` | host_permissions | Fetches deck card lists and printing metadata shared by the user from ManaBox's public deck URLs. |

---

## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** Yes (Authentication info used solely on-device for API requests)

| Data Type | Collected? | Transmitted Off-Device? | Purpose | Shared with Third Parties? |
|-----------|-----------|------------------------|---------|---------------------------|
| Authentication info | Yes (Cookie token) | Only to Archidekt API | Authenticates deck sync requests directly with Archidekt. | No |
| Personally identifiable info | No | No | N/A | No |
| Health / Financial info | No | No | N/A | No |
| Location | No | No | N/A | No |
| Web history | No | No | N/A | No |
| User activity | No | No | N/A | No |
| Website content | No | No | N/A | No |

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

---

## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 1.0.0 | 2026-09-27 | Initial release with side panel comparison, printing detection, bulk sync, and automatic session recovery. | Draft |
