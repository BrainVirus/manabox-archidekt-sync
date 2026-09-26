// Background service worker for ManaBox -> Archidekt Deck Sync

// Rule 2: Open side panel when the extension toolbar action is clicked
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error('Failed to set side panel behavior:', error));

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    const { pairings } = await chrome.storage.local.get('pairings');
    if (!pairings) {
      await chrome.storage.local.set({ pairings: [] });
    }
  }
});
