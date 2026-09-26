// Background service worker for ManaBox -> Archidekt Deck Sync

// Rule 2: Open side panel when the extension toolbar action is clicked
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error('Failed to set side panel behavior:', error));

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Set initial default demo pairing
    const { pairings = [] } = await chrome.storage.local.get('pairings');
    if (pairings.length === 0) {
      await chrome.storage.local.set({
        pairings: [
          {
            id: 'demo-mice',
            name: 'Sample Deck',
            manaboxUrl: 'https://manabox.app/decks/sample-deck-0',
            archidektUrl: 'https://archidekt.com/decks/4000',
            format: 'Commander'
          }
        ]
      });
    }
  }
});
