/**
 * Chrome Extension Side Panel Controller
 * Handles ManaBox parsing, Archidekt API calls, diffing, and direct sync.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const state = {
    comparison: null,
    currentFilter: 'all',
    pairings: [],
    auth: {
      authenticated: false,
      token: '',
      username: ''
    }
  };

  // Elements
  const authBtn = document.getElementById('authBtn');
  const authDot = document.getElementById('authDot');
  const authText = document.getElementById('authText');
  const authDialog = document.getElementById('authDialog');
  const authStatusBox = document.getElementById('authStatusBox');
  const refreshAuthBtn = document.getElementById('refreshAuthBtn');

  const useTabDeckBtn = document.getElementById('useTabDeckBtn');
  const manaboxInput = document.getElementById('manaboxInput');
  const archidektInput = document.getElementById('archidektInput');
  const topOpenManaboxBtn = document.getElementById('topOpenManaboxBtn');
  const topOpenArchidektBtn = document.getElementById('topOpenArchidektBtn');
  const diffOpenManaboxBtn = document.getElementById('diffOpenManaboxBtn');
  const diffOpenArchidektBtn = document.getElementById('diffOpenArchidektBtn');
  const openManaboxBtn = document.getElementById('openManaboxBtn');
  const openDeckBtn = document.getElementById('openDeckBtn');
  const openAddDeckModalBtn = document.getElementById('openAddDeckModalBtn');
  const addDeckDialog = document.getElementById('addDeckDialog');
  const newPairNicknameInput = document.getElementById('newPairNicknameInput');
  const modalSaveAndCompareBtn = document.getElementById('modalSaveAndCompareBtn');
  const closeDiffBtn = document.getElementById('closeDiffBtn');
  const diffActiveTitle = document.getElementById('diffActiveTitle');
  const diffEditPairBtn = document.getElementById('diffEditPairBtn');
  const editPairDialog = document.getElementById('editPairDialog');
  const editPairIdInput = document.getElementById('editPairIdInput');
  const editPairNameInput = document.getElementById('editPairNameInput');
  const editPairMbInput = document.getElementById('editPairMbInput');
  const editOpenManaboxBtn = document.getElementById('editOpenManaboxBtn');
  const editUseTabDeckMbBtn = document.getElementById('editUseTabDeckMbBtn');
  const editPairAdInput = document.getElementById('editPairAdInput');
  const editOpenArchidektBtn = document.getElementById('editOpenArchidektBtn');
  const editUseTabDeckAdBtn = document.getElementById('editUseTabDeckAdBtn');
  const editDeletePairBtn = document.getElementById('editDeletePairBtn');
  const confirmSaveEditPairBtn = document.getElementById('confirmSaveEditPairBtn');
  const bulkHeroCount = document.getElementById('bulkHeroCount');
  const compareBtn = document.getElementById('compareBtn');
  const compareIcon = document.getElementById('compareIcon');
  const compareText = document.getElementById('compareText');
  const savePairingBtn = document.getElementById('savePairingBtn');
  const pairingsBar = document.getElementById('pairingsBar');
  const savedPairsSection = document.getElementById('savedPairsSection');
  const savedPairsToggle = document.getElementById('savedPairsToggle');
  const savedPairsToolbar = document.getElementById('savedPairsToolbar');
  const sortPairsSelect = document.getElementById('sortPairsSelect');
  const pairsCountBadge = document.getElementById('pairsCountBadge');
  const exportPairsBtn = document.getElementById('exportPairsBtn');
  const savePairDialog = document.getElementById('savePairDialog');
  const savePairModalIcon = document.getElementById('savePairModalIcon');
  const savePairModalTitle = document.getElementById('savePairModalTitle');
  const savePairModalSubtitle = document.getElementById('savePairModalSubtitle');
  const savePairDupAlert = document.getElementById('savePairDupAlert');
  const savePairDupMessage = document.getElementById('savePairDupMessage');
  const savePairNameInput = document.getElementById('savePairNameInput');
  const savePairActionsNew = document.getElementById('savePairActionsNew');
  const savePairActionsDup = document.getElementById('savePairActionsDup');
  const confirmSaveNewPairBtn = document.getElementById('confirmSaveNewPairBtn');
  const updatePairNameBtn = document.getElementById('updatePairNameBtn');
  const createNewPairBtn = document.getElementById('createNewPairBtn');
  const backupDialog = document.getElementById('backupDialog');
  const copyBackupJsonBtn = document.getElementById('copyBackupJsonBtn');
  const downloadBackupJsonBtn = document.getElementById('downloadBackupJsonBtn');
  const importJsonTextarea = document.getElementById('importJsonTextarea');
  const importJsonBtn = document.getElementById('importJsonBtn');
  const openBulkModalBtn = document.getElementById('openBulkModalBtn');
  const bulkSyncDialog = document.getElementById('bulkSyncDialog');
  const bulkCheckAllBtn = document.getElementById('bulkCheckAllBtn');
  const bulkCheckIcon = document.getElementById('bulkCheckIcon');
  const bulkCheckText = document.getElementById('bulkCheckText');
  const bulkSelectAllBtn = document.getElementById('bulkSelectAllBtn');
  const bulkDeselectBtn = document.getElementById('bulkDeselectBtn');
  const bulkStatusBanner = document.getElementById('bulkStatusBanner');
  const bulkPairsList = document.getElementById('bulkPairsList');
  const bulkSyncSelectedBtn = document.getElementById('bulkSyncSelectedBtn');
  const bulkSyncIcon = document.getElementById('bulkSyncIcon');
  const bulkSyncText = document.getElementById('bulkSyncText');

  const diffView = document.getElementById('diffView');
  const mbName = document.getElementById('mbName');
  const mbMeta = document.getElementById('mbMeta');
  const adName = document.getElementById('adName');
  const adMeta = document.getElementById('adMeta');

  const statAdded = document.getElementById('statAdded');
  const statRemoved = document.getElementById('statRemoved');
  const statModified = document.getElementById('statModified');
  const statSynced = document.getElementById('statSynced');

  const countAll = document.getElementById('countAll');
  const countAdd = document.getElementById('countAdd');
  const countRemove = document.getElementById('countRemove');
  const countModify = document.getElementById('countModify');
  const countSync = document.getElementById('countSync');

  const filterTabs = document.querySelectorAll('.filter-tab');
  const selectAllBtn = document.getElementById('selectAllBtn');
  const deselectAllBtn = document.getElementById('deselectAllBtn');
  const copyMassEditBtn = document.getElementById('copyMassEditBtn');
  const changesList = document.getElementById('changesList');
  const applySyncBtn = document.getElementById('applySyncBtn');
  const syncIcon = document.getElementById('syncIcon');
  const syncText = document.getElementById('syncText');
  const toast = document.getElementById('toast');

  // -----------------------------------------------------------
  // Dialog & Toast Helpers
  // -----------------------------------------------------------

  function setupDialogs() {
    document.querySelectorAll('dialog').forEach(dialog => {
      dialog.querySelectorAll('[data-close-dialog], .close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          dialog.close();
        });
      });

      if (!('closedBy' in HTMLDialogElement.prototype)) {
        dialog.addEventListener('click', (e) => {
          if (e.target !== dialog) return;
          const rect = dialog.getBoundingClientRect();
          const inBox = (
            rect.top <= e.clientY &&
            e.clientY <= rect.top + rect.height &&
            rect.left <= e.clientX &&
            e.clientX <= rect.left + rect.width
          );
          if (!inBox) dialog.close();
        });
      }
    });
  }

  // Run dialog setup immediately
  setupDialogs();

  let toastTimer = null;
  function showToast(msg, isSuccess = true) {
    if (!toast) return;
    if (toastTimer) clearTimeout(toastTimer);
    toast.innerHTML = `
      <span>${escapeHtml(msg)}</span>
      <span style="opacity: 0.6; font-size: 1.1rem; line-height: 1; cursor: pointer; padding-left: 0.5rem;" title="Dismiss">&times;</span>
    `;
    toast.style.display = 'flex';
    toast.style.borderLeftColor = isSuccess ? 'var(--success)' : 'var(--danger)';
    toastTimer = setTimeout(() => {
      if (toast) toast.style.display = 'none';
    }, 2200);
  }

  if (toast) {
    toast.addEventListener('click', () => {
      if (toastTimer) clearTimeout(toastTimer);
      toast.style.display = 'none';
    });
  }

  // -----------------------------------------------------------
  // Archidekt Cookie & Session Auto-Detection
  // -----------------------------------------------------------

  if (authBtn) {
    authBtn.addEventListener('click', () => {
      updateAuthDialogUI();
      if (authDialog) authDialog.showModal();
    });
  }

  if (refreshAuthBtn) {
    refreshAuthBtn.addEventListener('click', async () => {
      await checkAuthSession();
      updateAuthDialogUI();
      showToast('Session re-checked!');
    });
  }

  async function checkAuthSession() {
    try {
      // Look for Archidekt session cookie
      const jwtCookie = await chrome.cookies.get({
        url: 'https://archidekt.com',
        name: 'tbJwt'
      });

      const userCookie = await chrome.cookies.get({
        url: 'https://archidekt.com',
        name: 'tbUser'
      });

      if (jwtCookie && jwtCookie.value) {
        state.auth.authenticated = true;
        state.auth.token = jwtCookie.value;
        state.auth.username = userCookie ? decodeURIComponent(userCookie.value) : 'Logged In';
      } else {
        // Fallback: check chrome.storage
        const { storedToken, storedUsername } = await chrome.storage.local.get(['storedToken', 'storedUsername']);
        if (storedToken) {
          state.auth.authenticated = true;
          state.auth.token = storedToken;
          state.auth.username = storedUsername || 'Archidekt User';
        } else {
          state.auth.authenticated = false;
          state.auth.token = '';
          state.auth.username = '';
        }
      }
    } catch (err) {
      console.warn('Could not read cookies:', err);
    }
    renderAuthBadge();
  }

  function renderAuthBadge() {
    if (state.auth.authenticated) {
      authDot.className = 'auth-dot connected';
      authText.textContent = `@${state.auth.username}`;
    } else {
      authDot.className = 'auth-dot';
      authText.textContent = 'Not Connected';
    }
  }

  function updateAuthDialogUI() {
    if (state.auth.authenticated) {
      authStatusBox.innerHTML = `
        <span style="color: var(--success); font-weight: 700;">✅ Active Archidekt Session Detected</span><br>
        <span>Logged in as <strong>@${state.auth.username}</strong> via browser cookie.</span>
      `;
    } else {
      authStatusBox.innerHTML = `
        <span style="color: var(--warning); font-weight: 700;">⚠️ No Active Session Found</span><br>
        <span>Please log into your account on Archidekt.com in this browser.</span>
      `;
    }
  }

  // -----------------------------------------------------------
  // Active Tab Deck Detection
  // -----------------------------------------------------------

  if (useTabDeckBtn) {
    useTabDeckBtn.addEventListener('click', async () => {
      await detectActiveTabDeck(true);
    });
  }

  async function detectActiveTabDeck(showNotice = false) {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url) {
        const adMatch = tab.url.match(/archidekt\.com\/decks\/(\d+)/i);
        if (adMatch) {
          archidektInput.value = adMatch[1];
          if (showNotice) showToast(`Detected Archidekt deck #${adMatch[1]} from tab!`);
          return;
        }
        const mbMatch = tab.url.match(/manabox\.app\/decks\/([a-zA-Z0-9_-]+)/i);
        if (mbMatch) {
          manaboxInput.value = `https://manabox.app/decks/${mbMatch[1]}`;
          if (showNotice) showToast(`Detected ManaBox deck from tab!`);
          return;
        }
      }
      if (showNotice) {
        showToast('Active tab is not a ManaBox or Archidekt deck page.', false);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // -----------------------------------------------------------
  // Open Deck Link Helpers (ManaBox & Archidekt)
  // -----------------------------------------------------------

  async function openManaBoxTab(input) {
    const raw = input || (manaboxInput ? manaboxInput.value : '');
    if (!raw) {
      showToast('Enter a ManaBox link first', false);
      return;
    }
    const normalized = normalizeManaBoxUrl(raw);
    const url = normalized || (raw.startsWith('http') ? raw : `https://${raw}`);
    try {
      await chrome.tabs.create({ url });
    } catch (e) {
      window.open(url, '_blank');
    }
  }

  async function openArchidektTab(input) {
    const raw = input || (archidektInput ? archidektInput.value : '');
    const deckId = normalizeArchidektDeckId(raw);
    if (!deckId) {
      showToast('Enter an Archidekt link or ID first', false);
      return;
    }
    const url = `https://archidekt.com/decks/${deckId}`;
    try {
      await chrome.tabs.create({ url });
    } catch (e) {
      window.open(url, '_blank');
    }
  }

  if (topOpenManaboxBtn) {
    topOpenManaboxBtn.addEventListener('click', () => openManaBoxTab());
  }

  if (topOpenArchidektBtn) {
    topOpenArchidektBtn.addEventListener('click', () => openArchidektTab());
  }

  if (diffOpenManaboxBtn) {
    diffOpenManaboxBtn.addEventListener('click', () => {
      const url = state.comparison?.manabox?.url || (manaboxInput ? manaboxInput.value : '');
      openManaBoxTab(url);
    });
  }

  if (diffOpenArchidektBtn) {
    diffOpenArchidektBtn.addEventListener('click', () => {
      const id = state.comparison?.archidekt?.id || (archidektInput ? archidektInput.value : '');
      openArchidektTab(id);
    });
  }

  if (openManaboxBtn) {
    openManaboxBtn.addEventListener('click', () => {
      const url = state.comparison?.manabox?.url || (manaboxInput ? manaboxInput.value : '');
      openManaBoxTab(url);
    });
  }

  if (openDeckBtn) {
    openDeckBtn.addEventListener('click', () => {
      const id = state.comparison?.archidekt?.id || (archidektInput ? archidektInput.value : '');
      openArchidektTab(id);
    });
  }

  // -----------------------------------------------------------
  // Pairings
  // -----------------------------------------------------------

  const DEFAULT_PAIRS_FALLBACK = [
    {
      id: "pair-1790441846508",
      name: "Commander Deck A",
      commanderName: "Sample Commander A",
      commanderImage: "",
      manaboxUrl: "https://manabox.app/decks/sample-deck-1",
      archidektUrl: "2345678",
      format: "Commander"
    },
    {
      id: "pair-1790441781407",
      name: "Commander Deck B",
      commanderName: "Sample Commander B",
      commanderImage: "",
      manaboxUrl: "https://manabox.app/decks/sample-deck-2",
      archidektUrl: "3456789",
      format: "Commander"
    },
    {
      id: "pair-1790437997377",
      name: "Commander Deck C",
      commanderName: "Sample Commander C",
      commanderImage: "",
      manaboxUrl: "https://manabox.app/decks/sample-deck-3",
      archidektUrl: "1234567",
      format: "Commander"
    }
  ];

  async function loadPairings() {
    let pairings = [];
    try {
      const stored = await chrome.storage.local.get('pairings');
      if (Array.isArray(stored.pairings) && stored.pairings.length > 0) {
        pairings = stored.pairings;
      }
    } catch (e) {
      console.warn('Could not read pairings from chrome.storage.local:', e);
    }

    // Secondary backup from localStorage if chrome.storage was empty
    if (!pairings.length) {
      try {
        const backupStr = localStorage.getItem('manabox_pairings_backup');
        if (backupStr) {
          const parsed = JSON.parse(backupStr);
          if (Array.isArray(parsed) && parsed.length > 0) {
            pairings = parsed;
          }
        }
      } catch (e) {
        console.warn('Could not read pairings from localStorage backup:', e);
      }
    }

    // If still empty (e.g. storage glitch or profile reset), restore user pairs
    if (!pairings.length) {
      pairings = [...DEFAULT_PAIRS_FALLBACK];
    } else {
      // Auto-enrich existing saved pairings with commander data from fallback defaults if missing
      pairings.forEach(p => {
        const match = DEFAULT_PAIRS_FALLBACK.find(f =>
          f.id === p.id ||
          (f.archidektUrl && normalizeArchidektDeckId(f.archidektUrl) === normalizeArchidektDeckId(p.archidektUrl)) ||
          (f.manaboxUrl && normalizeManaBoxUrl(f.manaboxUrl) === normalizeManaBoxUrl(p.manaboxUrl))
        );
        if (match) {
          if (!p.commanderName && match.commanderName) p.commanderName = match.commanderName;
          if (!p.commanderImage && match.commanderImage) p.commanderImage = match.commanderImage;
          if (!p.format && match.format) p.format = match.format;
        }
      });
    }

    state.pairings = pairings;
    await persistPairings();
    renderPairings();
  }

  async function persistPairings() {
    try {
      await chrome.storage.local.set({ pairings: state.pairings });
      localStorage.setItem('manabox_pairings_backup', JSON.stringify(state.pairings));
    } catch (e) {
      console.warn('Failed to persist pairings:', e);
    }
  }

  function getPairTimestamp(pair) {
    if (typeof pair.createdAt === 'number') return pair.createdAt;
    const match = pair.id && String(pair.id).match(/\d+/);
    if (match) {
      const parsed = parseInt(match[0], 10);
      if (!isNaN(parsed) && parsed > 1600000000000) return parsed;
    }
    return 0;
  }

  function getSortedPairings() {
    const sortMode = localStorage.getItem('manabox_pairs_sort') || 'date-desc';
    const pairsCopy = [...state.pairings];

    pairsCopy.sort((a, b) => {
      if (sortMode === 'name-asc') {
        return (a.name || '').localeCompare(b.name || '', undefined, { numeric: true, sensitivity: 'base' });
      }
      if (sortMode === 'name-desc') {
        return (b.name || '').localeCompare(a.name || '', undefined, { numeric: true, sensitivity: 'base' });
      }
      if (sortMode === 'date-asc') {
        return getPairTimestamp(a) - getPairTimestamp(b);
      }
      // default: 'date-desc'
      return getPairTimestamp(b) - getPairTimestamp(a);
    });

    return pairsCopy;
  }

  function setupSortControl() {
    if (sortPairsSelect) {
      sortPairsSelect.value = localStorage.getItem('manabox_pairs_sort') || 'date-desc';
      sortPairsSelect.addEventListener('change', () => {
        localStorage.setItem('manabox_pairs_sort', sortPairsSelect.value);
        renderPairings();
      });
    }
  }

  function setupSavedPairsAccordion() {
    if (!savedPairsSection || !savedPairsToggle) return;

    // Load saved collapsed state
    const isPairsCollapsed = localStorage.getItem('manabox_pairs_collapsed') === 'true';
    if (isPairsCollapsed) {
      savedPairsSection.classList.add('collapsed');
    }

    savedPairsToggle.addEventListener('click', () => {
      savedPairsSection.classList.toggle('collapsed');
      const collapsed = savedPairsSection.classList.contains('collapsed');
      localStorage.setItem('manabox_pairs_collapsed', String(collapsed));
    });
  }

  async function loadAndComparePair(p) {
    if (manaboxInput) manaboxInput.value = p.manaboxUrl;
    if (archidektInput) archidektInput.value = p.archidektUrl;
    if (diffActiveTitle) diffActiveTitle.textContent = `Diff: ${p.name}`;
    renderPairings();
    if (diffView) {
      diffView.classList.add('active');
      diffView.scrollIntoView({ behavior: 'smooth' });
    }
    await triggerComparison();
  }

  function renderPairings() {
    if (pairsCountBadge) {
      pairsCountBadge.textContent = state.pairings.length;
    }
    if (bulkHeroCount) {
      bulkHeroCount.textContent = `${state.pairings.length} ${state.pairings.length === 1 ? 'Deck' : 'Decks'}`;
    }

    if (savedPairsToolbar) {
      savedPairsToolbar.style.display = state.pairings.length > 0 ? 'flex' : 'none';
    }

    pairingsBar.innerHTML = '';
    if (!state.pairings.length) {
      pairingsBar.innerHTML = `
        <div class="saved-pairs-empty" style="padding: 1.5rem 1rem; text-align: center; background: var(--bg-card); border: 1px dashed var(--border); border-radius: var(--radius-md);">
          <div style="font-size: 1.6rem; margin-bottom: 0.35rem;">⚔️</div>
          <strong style="color: var(--text-main); font-size: 0.85rem;">No saved deck pairs yet</strong><br>
          <p style="color: var(--text-muted); font-size: 0.72rem; margin: 0.35rem 0 0.65rem 0;">Click below to pair your first ManaBox and Archidekt decks.</p>
          <button id="emptyAddDeckBtn" type="button" class="btn btn-primary btn-sm" style="font-size: 0.72rem; padding: 0.35rem 0.75rem;">
            + Add Your First Deck
          </button>
        </div>
      `;
      const emptyAddBtn = document.getElementById('emptyAddDeckBtn');
      if (emptyAddBtn && openAddDeckModalBtn) {
        emptyAddBtn.addEventListener('click', () => openAddDeckModalBtn.click());
      }
      return;
    }

    const currentMb = (manaboxInput?.value || '').trim();
    const currentAd = (archidektInput?.value || '').trim();

    const sortedPairs = getSortedPairings();

    sortedPairs.forEach(p => {
      const card = document.createElement('div');
      const isActive = currentMb && currentAd && (p.manaboxUrl === currentMb && p.archidektUrl === currentAd);
      card.className = `deck-card ${isActive ? 'active-deck' : ''}`;
      card.setAttribute('title', `Click to compare "${p.name}"`);

      const archidektId = normalizeArchidektDeckId(p.archidektUrl) || p.archidektUrl;
      const avatarHtml = p.commanderImage
        ? `<img class="deck-card-avatar" src="${escapeHtml(p.commanderImage)}" alt="${escapeHtml(p.commanderName || p.name)}" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='inline-flex';" /><span class="deck-card-icon-fallback" style="display:none;">⚔️</span>`
        : `<span class="deck-card-icon">⚔️</span>`;

      const subtitleHtml = p.commanderName
        ? `<span class="cmdr-icon">👑</span><span class="cmdr-name" title="${escapeHtml(p.commanderName)}">${escapeHtml(p.commanderName)}</span>`
        : `<span>${escapeHtml(p.format || 'Deck')} • #${escapeHtml(archidektId)}</span>`;

      card.innerHTML = `
        <div class="deck-card-top">
          <div class="deck-card-info">
            ${avatarHtml}
            <div style="min-width: 0;">
              <div class="deck-card-title-row">
                <span class="deck-card-name" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</span>
              </div>
              <div class="deck-card-sub" title="${escapeHtml(p.commanderName || ((p.format || 'Deck') + ' • #' + archidektId))}">${subtitleHtml}</div>
            </div>
          </div>
          <div class="deck-card-links">
            <button class="pair-action-btn pair-open-mb-btn" title="Open in ManaBox (new tab)">ManaBox ↗</button>
            <button class="pair-action-btn pair-open-ad-btn pair-open-btn" title="Open in Archidekt (new tab)">Archidekt ↗</button>
          </div>
        </div>

        <div class="deck-card-bottom">
          <span class="deck-card-timestamp">Saved</span>
          <div class="deck-card-actions">
            <button class="btn btn-primary btn-sm pair-compare-btn" style="font-size: 0.68rem; padding: 0.2rem 0.55rem; display: inline-flex; align-items: center; gap: 0.25rem;">
              <span>⚡</span> Compare Diff
            </button>
            <button class="btn btn-outline btn-sm pair-edit-btn" style="font-size: 0.68rem; padding: 0.2rem 0.45rem; display: inline-flex; align-items: center; gap: 0.2rem;" title="Edit deck pairing">
              <span>✏️</span> Edit
            </button>
            <button class="pair-action-btn pair-delete-btn" title="Delete pairing">&times;</button>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        loadAndComparePair(p);
      });

      card.querySelector('.pair-compare-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        loadAndComparePair(p);
      });

      const editBtn = card.querySelector('.pair-edit-btn');
      if (editBtn) {
        editBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openEditPairDialog(p);
        });
      }

      const openMbBtn = card.querySelector('.pair-open-mb-btn');
      if (openMbBtn) {
        openMbBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openManaBoxTab(p.manaboxUrl);
        });
      }

      const openAdBtn = card.querySelector('.pair-open-ad-btn') || card.querySelector('.pair-open-btn');
      if (openAdBtn) {
        openAdBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openArchidektTab(p.archidektUrl);
        });
      }

      card.querySelector('.pair-delete-btn').addEventListener('click', async (e) => {
        e.stopPropagation();
        await deletePairing(p);
      });

      pairingsBar.appendChild(card);
    });
  }

  async function deletePairing(pairing) {
    const ok = confirm(`Remove "${pairing.name}" from your saved deck pairs?`);
    if (!ok) return;

    state.pairings = state.pairings.filter(p => p.id !== pairing.id);
    await persistPairings();
    renderPairings();
    showToast(`Removed "${pairing.name}"`);
  }

  function findExistingPairing(mbInput, adInput) {
    const normMb = normalizeManaBoxUrl(mbInput) || (mbInput ? mbInput.trim() : '');
    const normAdId = normalizeArchidektDeckId(adInput);

    // 1. Exact match (both ManaBox & Archidekt match)
    const exact = state.pairings.find(p => {
      const pMb = normalizeManaBoxUrl(p.manaboxUrl) || (p.manaboxUrl ? p.manaboxUrl.trim() : '');
      const pAd = normalizeArchidektDeckId(p.archidektUrl);
      return (normMb && pMb === normMb) && (normAdId && pAd === normAdId);
    });
    if (exact) return { pair: exact, matchType: 'exact' };

    // 2. Matching ManaBox deck
    if (normMb) {
      const mbMatch = state.pairings.find(p => {
        const pMb = normalizeManaBoxUrl(p.manaboxUrl) || (p.manaboxUrl ? p.manaboxUrl.trim() : '');
        return pMb === normMb;
      });
      if (mbMatch) return { pair: mbMatch, matchType: 'manabox' };
    }

    // 3. Matching Archidekt deck
    if (normAdId) {
      const adMatch = state.pairings.find(p => {
        const pAd = normalizeArchidektDeckId(p.archidektUrl);
        return pAd === normAdId;
      });
      if (adMatch) return { pair: adMatch, matchType: 'archidekt' };
    }

    return null;
  }

  let pendingSaveContext = null;

  if (savePairingBtn) {
    savePairingBtn.addEventListener('click', () => {
      const mbUrl = manaboxInput.value.trim();
      const adUrl = archidektInput.value.trim();
      if (!mbUrl || !adUrl) {
        showToast('Enter both deck links first', false);
        return;
      }

      const matchResult = findExistingPairing(mbUrl, adUrl);
      pendingSaveContext = {
        mbUrl,
        adUrl,
        existing: matchResult ? matchResult.pair : null
      };

      if (matchResult) {
        // DUPLICATE DETECTED
        if (savePairDupAlert) savePairDupAlert.style.display = 'block';
        if (savePairModalIcon) savePairModalIcon.textContent = '⚠️';
        if (savePairModalTitle) savePairModalTitle.textContent = 'Pairing Already Exists';
        if (savePairModalSubtitle) savePairModalSubtitle.textContent = 'Choose whether to update the nickname or create a new pairing';

        const desc = matchResult.matchType === 'exact'
          ? 'this deck pair'
          : (matchResult.matchType === 'manabox' ? 'this ManaBox deck' : 'this Archidekt deck');

        if (savePairDupMessage) {
          savePairDupMessage.innerHTML = `A saved pairing for <strong>${desc}</strong> already exists as <strong>"${escapeHtml(matchResult.pair.name)}"</strong>.<br>Would you like to update the existing name or save as a new pairing?`;
        }

        if (savePairNameInput) {
          savePairNameInput.value = matchResult.pair.name;
        }

        if (savePairActionsNew) savePairActionsNew.style.display = 'none';
        if (savePairActionsDup) savePairActionsDup.style.display = 'flex';
      } else {
        // BRAND NEW PAIRING
        if (savePairDupAlert) savePairDupAlert.style.display = 'none';
        if (savePairModalIcon) savePairModalIcon.textContent = '💾';
        if (savePairModalTitle) savePairModalTitle.textContent = 'Save Deck Pairing';
        if (savePairModalSubtitle) savePairModalSubtitle.textContent = 'Store this pair for 1-click loading and bulk sync';

        const defaultName = state.comparison ? state.comparison.manabox.name : 'Deck Pair';
        if (savePairNameInput) {
          savePairNameInput.value = defaultName;
        }

        if (savePairActionsNew) savePairActionsNew.style.display = 'flex';
        if (savePairActionsDup) savePairActionsDup.style.display = 'none';
      }

      if (savePairDialog) {
        savePairDialog.showModal();
        setTimeout(() => {
          if (savePairNameInput) {
            savePairNameInput.focus();
            savePairNameInput.select();
          }
        }, 50);
      }
    });
  }

  // Action: Save New Pairing (from New view)
  if (confirmSaveNewPairBtn) {
    confirmSaveNewPairBtn.addEventListener('click', async () => {
      if (!pendingSaveContext) return;
      const name = (savePairNameInput?.value || '').trim();
      if (!name) {
        showToast('Please enter a nickname for this pairing', false);
        return;
      }

      const newPair = {
        id: 'pair-' + Date.now(),
        name,
        manaboxUrl: pendingSaveContext.mbUrl,
        archidektUrl: pendingSaveContext.adUrl,
        commanderName: state.comparison ? (state.comparison.manabox?.commanderName || state.comparison.archidekt?.commanderName || '') : '',
        commanderImage: state.comparison ? (state.comparison.manabox?.commanderImage || state.comparison.archidekt?.commanderImage || '') : '',
        createdAt: Date.now()
      };

      state.pairings.unshift(newPair);
      await persistPairings();

      if (savedPairsSection && savedPairsSection.classList.contains('collapsed')) {
        savedPairsSection.classList.remove('collapsed');
        localStorage.setItem('manabox_pairs_collapsed', 'false');
      }

      renderPairings();
      if (savePairDialog) savePairDialog.close();
      showToast(`Saved "${name}"!`);
    });
  }

  // Action: Update Existing Pairing Name
  if (updatePairNameBtn) {
    updatePairNameBtn.addEventListener('click', async () => {
      if (!pendingSaveContext || !pendingSaveContext.existing) return;
      const name = (savePairNameInput?.value || '').trim();
      if (!name) {
        showToast('Please enter a nickname for this pairing', false);
        return;
      }

      const existing = pendingSaveContext.existing;
      existing.name = name;
      existing.manaboxUrl = pendingSaveContext.mbUrl;
      existing.archidektUrl = pendingSaveContext.adUrl;
      if (state.comparison) {
        if (!existing.commanderName && (state.comparison.manabox?.commanderName || state.comparison.archidekt?.commanderName)) {
          existing.commanderName = state.comparison.manabox?.commanderName || state.comparison.archidekt?.commanderName;
        }
        if (!existing.commanderImage && (state.comparison.manabox?.commanderImage || state.comparison.archidekt?.commanderImage)) {
          existing.commanderImage = state.comparison.manabox?.commanderImage || state.comparison.archidekt?.commanderImage;
        }
      }

      await persistPairings();

      if (savedPairsSection && savedPairsSection.classList.contains('collapsed')) {
        savedPairsSection.classList.remove('collapsed');
        localStorage.setItem('manabox_pairs_collapsed', 'false');
      }

      renderPairings();
      if (savePairDialog) savePairDialog.close();
      showToast(`Updated "${name}"!`);
    });
  }

  // Action: Create New Pairing (from Duplicate view)
  if (createNewPairBtn) {
    createNewPairBtn.addEventListener('click', async () => {
      if (!pendingSaveContext) return;
      const name = (savePairNameInput?.value || '').trim();
      if (!name) {
        showToast('Please enter a nickname for this pairing', false);
        return;
      }

      const newPair = {
        id: 'pair-' + Date.now(),
        name,
        manaboxUrl: pendingSaveContext.mbUrl,
        archidektUrl: pendingSaveContext.adUrl,
        commanderName: state.comparison ? (state.comparison.manabox?.commanderName || state.comparison.archidekt?.commanderName || '') : '',
        commanderImage: state.comparison ? (state.comparison.manabox?.commanderImage || state.comparison.archidekt?.commanderImage || '') : '',
        createdAt: Date.now()
      };

      state.pairings.unshift(newPair);
      await persistPairings();

      if (savedPairsSection && savedPairsSection.classList.contains('collapsed')) {
        savedPairsSection.classList.remove('collapsed');
        localStorage.setItem('manabox_pairs_collapsed', 'false');
      }

      renderPairings();
      if (savePairDialog) savePairDialog.close();
      showToast(`Saved new pairing "${name}"!`);
    });
  }

  // Handle Enter key inside savePairNameInput
  if (savePairNameInput) {
    savePairNameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (pendingSaveContext && pendingSaveContext.existing) {
          if (updatePairNameBtn) updatePairNameBtn.click();
        } else {
          if (confirmSaveNewPairBtn) confirmSaveNewPairBtn.click();
        }
      }
    });
  }

  // -----------------------------------------------------------
  // Add Deck Modal & Diff Header Handlers
  // -----------------------------------------------------------

  if (openAddDeckModalBtn) {
    openAddDeckModalBtn.addEventListener('click', () => {
      if (manaboxInput) manaboxInput.value = '';
      if (archidektInput) archidektInput.value = '';
      if (newPairNicknameInput) newPairNicknameInput.value = '';
      if (addDeckDialog) {
        addDeckDialog.showModal();
        setTimeout(() => {
          if (manaboxInput) manaboxInput.focus();
        }, 50);
      }
    });
  }

  if (closeDiffBtn) {
    closeDiffBtn.addEventListener('click', () => {
      if (diffView) diffView.classList.remove('active');
    });
  }

  if (modalSaveAndCompareBtn) {
    modalSaveAndCompareBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const mbUrl = (manaboxInput?.value || '').trim();
      const adUrl = (archidektInput?.value || '').trim();
      const nickname = (newPairNicknameInput?.value || '').trim();

      if (!mbUrl || !adUrl) {
        showToast('Please enter both deck links', false);
        return;
      }

      const matchResult = findExistingPairing(mbUrl, adUrl);
      if (matchResult) {
        pendingSaveContext = {
          mbUrl,
          adUrl,
          existing: matchResult.pair
        };
        if (addDeckDialog) addDeckDialog.close();

        if (savePairDupAlert) savePairDupAlert.style.display = 'block';
        if (savePairModalIcon) savePairModalIcon.textContent = '⚠️';
        if (savePairModalTitle) savePairModalTitle.textContent = 'Pairing Already Exists';
        if (savePairModalSubtitle) savePairModalSubtitle.textContent = 'Choose whether to update the nickname or create a new pairing';

        const desc = matchResult.matchType === 'exact'
          ? 'this deck pair'
          : (matchResult.matchType === 'manabox' ? 'this ManaBox deck' : 'this Archidekt deck');

        if (savePairDupMessage) {
          savePairDupMessage.innerHTML = `A saved pairing for <strong>${desc}</strong> already exists as <strong>"${escapeHtml(matchResult.pair.name)}"</strong>.<br>Would you like to update the existing name or save as a new pairing?`;
        }

        if (savePairNameInput) {
          savePairNameInput.value = nickname || matchResult.pair.name;
        }

        if (savePairActionsNew) savePairActionsNew.style.display = 'none';
        if (savePairActionsDup) savePairActionsDup.style.display = 'flex';
        if (savePairDialog) savePairDialog.showModal();
        return;
      }

      const finalName = nickname || 'Deck Pair';
      const newPair = {
        id: 'pair-' + Date.now(),
        name: finalName,
        manaboxUrl: mbUrl,
        archidektUrl: adUrl,
        createdAt: Date.now()
      };

      state.pairings.unshift(newPair);
      await persistPairings();
      renderPairings();
      if (addDeckDialog) addDeckDialog.close();
      showToast(`Added "${finalName}"!`);

      await loadAndComparePair(newPair);
    });
  }

  if (newPairNicknameInput) {
    newPairNicknameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (modalSaveAndCompareBtn) modalSaveAndCompareBtn.click();
      }
    });
  }

  // -----------------------------------------------------------
  // Edit Deck Pairing Controller
  // -----------------------------------------------------------

  function openEditPairDialog(pairing) {
    if (!pairing || !editPairDialog) return;
    if (editPairIdInput) editPairIdInput.value = pairing.id || '';
    if (editPairNameInput) editPairNameInput.value = pairing.name || '';
    if (editPairMbInput) editPairMbInput.value = pairing.manaboxUrl || '';
    if (editPairAdInput) editPairAdInput.value = pairing.archidektUrl || '';
    editPairDialog.showModal();
    setTimeout(() => {
      if (editPairNameInput) {
        editPairNameInput.focus();
        editPairNameInput.select();
      }
    }, 50);
  }

  if (diffEditPairBtn) {
    diffEditPairBtn.addEventListener('click', () => {
      const curMb = (manaboxInput?.value || '').trim();
      const curAd = (archidektInput?.value || '').trim();
      const normCurMb = normalizeManaBoxUrl(curMb) || curMb;
      const normCurAd = normalizeArchidektDeckId(curAd) || curAd;

      const matched = state.pairings.find(p => {
        const pMb = normalizeManaBoxUrl(p.manaboxUrl) || p.manaboxUrl;
        const pAd = normalizeArchidektDeckId(p.archidektUrl) || p.archidektUrl;
        return (pMb && pMb === normCurMb) || (pAd && pAd === normCurAd);
      });

      if (matched) {
        openEditPairDialog(matched);
      } else {
        openEditPairDialog({
          id: '',
          name: state.comparison?.manabox?.name || 'Deck Pair',
          manaboxUrl: curMb,
          archidektUrl: curAd
        });
      }
    });
  }

  if (editOpenManaboxBtn) {
    editOpenManaboxBtn.addEventListener('click', () => {
      const url = editPairMbInput?.value;
      openManaBoxTab(url);
    });
  }

  if (editOpenArchidektBtn) {
    editOpenArchidektBtn.addEventListener('click', () => {
      const url = editPairAdInput?.value;
      openArchidektTab(url);
    });
  }

  if (editUseTabDeckMbBtn) {
    editUseTabDeckMbBtn.addEventListener('click', async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url) {
          const mbMatch = tab.url.match(/manabox\.app\/decks\/([a-zA-Z0-9_-]+)/i);
          if (mbMatch && editPairMbInput) {
            editPairMbInput.value = `https://manabox.app/decks/${mbMatch[1]}`;
            showToast('Detected ManaBox deck from tab!');
            return;
          }
        }
        showToast('Active tab is not a ManaBox deck page', false);
      } catch (e) {
        console.error(e);
      }
    });
  }

  if (editUseTabDeckAdBtn) {
    editUseTabDeckAdBtn.addEventListener('click', async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url) {
          const adMatch = tab.url.match(/archidekt\.com\/decks\/(\d+)/i);
          if (adMatch && editPairAdInput) {
            editPairAdInput.value = adMatch[1];
            showToast(`Detected Archidekt deck #${adMatch[1]} from tab!`);
            return;
          }
        }
        showToast('Active tab is not an Archidekt deck page', false);
      } catch (e) {
        console.error(e);
      }
    });
  }

  if (editDeletePairBtn) {
    editDeletePairBtn.addEventListener('click', async () => {
      const pairId = editPairIdInput ? editPairIdInput.value : '';
      const pair = state.pairings.find(p => p.id === pairId);
      if (!pair) {
        if (editPairDialog) editPairDialog.close();
        return;
      }
      if (editPairDialog) editPairDialog.close();
      await deletePairing(pair);
    });
  }

  if (confirmSaveEditPairBtn) {
    confirmSaveEditPairBtn.addEventListener('click', async () => {
      const pairId = editPairIdInput ? editPairIdInput.value : '';
      const name = (editPairNameInput?.value || '').trim();
      const mbUrl = (editPairMbInput?.value || '').trim();
      const adUrl = (editPairAdInput?.value || '').trim();

      if (!name) {
        showToast('Please enter a nickname for this pairing', false);
        return;
      }
      if (!mbUrl || !adUrl) {
        showToast('Please provide both ManaBox and Archidekt links', false);
        return;
      }

      let pair = state.pairings.find(p => p.id === pairId);
      if (pair) {
        const prevMb = pair.manaboxUrl;
        const prevAd = pair.archidektUrl;

        pair.name = name;
        pair.manaboxUrl = mbUrl;
        pair.archidektUrl = adUrl;

        if (prevMb !== mbUrl || prevAd !== adUrl) {
          const normMb = normalizeManaBoxUrl(mbUrl);
          const normAd = normalizeArchidektDeckId(adUrl);
          if (state.comparison &&
              normalizeManaBoxUrl(state.comparison.manabox?.url) === normMb &&
              normalizeArchidektDeckId(state.comparison.archidekt?.id) === normAd) {
            pair.commanderName = state.comparison.manabox?.commanderName || state.comparison.archidekt?.commanderName || '';
            pair.commanderImage = state.comparison.manabox?.commanderImage || state.comparison.archidekt?.commanderImage || '';
          } else {
            pair.commanderName = '';
            pair.commanderImage = '';
          }
        }

        // If currently loaded in diff inputs, update them
        if (manaboxInput && manaboxInput.value === prevMb) {
          manaboxInput.value = mbUrl;
        }
        if (archidektInput && archidektInput.value === prevAd) {
          archidektInput.value = adUrl;
        }
        if (diffActiveTitle && diffActiveTitle.textContent.includes(pair.name)) {
          diffActiveTitle.textContent = `Diff: ${pair.name}`;
        }
      } else {
        // Create new pair if not existing
        pair = {
          id: 'pair-' + Date.now(),
          name,
          manaboxUrl: mbUrl,
          archidektUrl: adUrl,
          commanderName: state.comparison ? (state.comparison.manabox?.commanderName || state.comparison.archidekt?.commanderName || '') : '',
          commanderImage: state.comparison ? (state.comparison.manabox?.commanderImage || state.comparison.archidekt?.commanderImage || '') : '',
          createdAt: Date.now()
        };
        state.pairings.unshift(pair);
      }

      await persistPairings();
      renderPairings();
      if (editPairDialog) editPairDialog.close();
      showToast(`Updated "${name}"!`);
    });
  }

  [editPairNameInput, editPairMbInput, editPairAdInput].forEach(inp => {
    if (inp) {
      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (confirmSaveEditPairBtn) confirmSaveEditPairBtn.click();
        }
      });
    }
  });

  // -----------------------------------------------------------
  // Bulk Deck Check & Sync Controller
  // -----------------------------------------------------------

  const bulkState = {
    pairs: [],
    isChecking: false,
    isSyncing: false
  };

  if (openBulkModalBtn) {
    openBulkModalBtn.addEventListener('click', async () => {
      if (!state.pairings.length) {
        showToast('No saved deck pairs yet. Use 💾 Save to add pairings first.', false);
        return;
      }

      bulkState.pairs = getSortedPairings().map(p => ({
        ...p,
        status: 'idle',
        comparison: null,
        error: null,
        selected: false
      }));

      renderBulkPairsList();
      updateBulkSummaryBanner();
      if (bulkSyncDialog) bulkSyncDialog.showModal();

      // Automatically check all on open
      await runBulkCheck();
    });
  }

  if (bulkCheckAllBtn) {
    bulkCheckAllBtn.addEventListener('click', async () => {
      if (bulkState.isChecking || bulkState.isSyncing) return;
      await runBulkCheck();
    });
  }

  if (bulkSelectAllBtn) {
    bulkSelectAllBtn.addEventListener('click', () => {
      bulkState.pairs.forEach(p => {
        if (p.status === 'has_changes') p.selected = true;
      });
      renderBulkPairsList();
      updateBulkSyncButtonState();
    });
  }

  if (bulkDeselectBtn) {
    bulkDeselectBtn.addEventListener('click', () => {
      bulkState.pairs.forEach(p => p.selected = false);
      renderBulkPairsList();
      updateBulkSyncButtonState();
    });
  }

  function updateBulkSummaryBanner() {
    if (bulkState.isChecking || bulkState.isSyncing) return;

    const checkedPairs = bulkState.pairs.filter(p => p.status !== 'idle' && p.status !== 'checking');
    if (checkedPairs.length === 0) {
      bulkStatusBanner.innerHTML = '<span>Click <strong>Check All</strong> to scan saved decks for differences.</span>';
      return;
    }

    const changedCount = bulkState.pairs.filter(p => p.status === 'has_changes').length;
    const inSyncCount = bulkState.pairs.filter(p => p.status === 'in_sync' || p.status === 'synced').length;
    const errorCount = bulkState.pairs.filter(p => p.status === 'error').length;

    if (changedCount === 0 && errorCount === 0) {
      bulkStatusBanner.innerHTML = '<span style="color: var(--success); font-weight: 600;">✅ All saved decks are completely in sync with ManaBox!</span>';
    } else {
      let msg = `<span>Scanned ${checkedPairs.length} deck(s): `;
      const parts = [];
      if (changedCount > 0) parts.push(`<strong style="color: var(--warning);">${changedCount} have changes</strong>`);
      if (inSyncCount > 0) parts.push(`<span style="color: var(--success);">${inSyncCount} in sync</span>`);
      if (errorCount > 0) parts.push(`<span style="color: var(--danger);">${errorCount} errored</span>`);
      msg += parts.join(', ') + '.</span>';
      bulkStatusBanner.innerHTML = msg;
    }
  }

  function updateBulkSyncButtonState() {
    const selectedWithChanges = bulkState.pairs.filter(p => p.selected && p.status === 'has_changes');
    bulkSyncSelectedBtn.disabled = selectedWithChanges.length === 0 || bulkState.isChecking || bulkState.isSyncing;
    if (selectedWithChanges.length > 0) {
      bulkSyncText.textContent = `Sync Selected (${selectedWithChanges.length} deck${selectedWithChanges.length > 1 ? 's' : ''})`;
    } else {
      const anyChanges = bulkState.pairs.some(p => p.status === 'has_changes');
      bulkSyncText.textContent = anyChanges ? 'Select Decks to Sync' : 'No Decks to Sync';
    }
  }

  function renderBulkPairsList() {
    bulkPairsList.innerHTML = '';

    bulkState.pairs.forEach((pair) => {
      const card = document.createElement('div');
      card.className = `bulk-pair-card status-${pair.status}`;

      let badgeHtml = '';
      if (pair.status === 'idle') {
        badgeHtml = `<span class="bulk-pair-badge idle">⚪ Ready</span>`;
      } else if (pair.status === 'checking') {
        badgeHtml = `<span class="bulk-pair-badge checking"><span class="spinner" style="width: 10px; height: 10px; border-width: 1.5px;"></span> Checking</span>`;
      } else if (pair.status === 'in_sync') {
        badgeHtml = `<span class="bulk-pair-badge in_sync">✅ In Sync</span>`;
      } else if (pair.status === 'has_changes') {
        const stats = pair.comparison ? pair.comparison.stats : null;
        let changeSummary = 'Changes';
        if (stats) {
          const parts = [];
          if (stats.addedCount > 0) parts.push(`+${stats.addedCount}`);
          if (stats.removedCount > 0) parts.push(`-${stats.removedCount}`);
          if (stats.modifiedCount > 0) parts.push(`~${stats.modifiedCount}`);
          changeSummary = parts.join(' ');
        }
        badgeHtml = `<span class="bulk-pair-badge has_changes">⚠️ ${changeSummary}</span>`;
      } else if (pair.status === 'error') {
        badgeHtml = `<span class="bulk-pair-badge error" title="${escapeHtml(pair.error || 'Error')}">❌ Error</span>`;
      } else if (pair.status === 'syncing') {
        badgeHtml = `<span class="bulk-pair-badge syncing"><span class="spinner" style="width: 10px; height: 10px; border-width: 1.5px;"></span> Syncing...</span>`;
      } else if (pair.status === 'synced') {
        badgeHtml = `<span class="bulk-pair-badge synced">🎉 Synced</span>`;
      }

      let subHtml = '';
      if (pair.comparison) {
        subHtml = `
          <span>MB: <strong>${pair.comparison.manabox.totalCards}</strong> cards</span>
          <span style="color: var(--text-subtle);">➔</span>
          <span>AD: <strong>${pair.comparison.archidekt.totalCards}</strong> cards</span>
        `;
      } else if (pair.error) {
        subHtml = `<span style="color: var(--danger); font-size: 0.68rem;">${escapeHtml(pair.error)}</span>`;
      } else {
        subHtml = `<span style="color: var(--text-subtle);">${escapeHtml(pair.manaboxUrl.split('/').pop())}</span>`;
      }

      const canSelect = pair.status === 'has_changes' && !bulkState.isChecking && !bulkState.isSyncing;

      card.innerHTML = `
        <div class="bulk-pair-header">
          <div class="bulk-pair-title">
            <input
              type="checkbox"
              class="bulk-check-box"
              ${pair.selected ? 'checked' : ''}
              ${canSelect ? '' : 'disabled'}
              style="cursor: ${canSelect ? 'pointer' : 'default'};"
            />
            <span title="${escapeHtml(pair.name)}">⚔️ ${escapeHtml(pair.name)}</span>
          </div>
          <div>${badgeHtml}</div>
        </div>
        <div class="bulk-pair-sub">${subHtml}</div>
        <div class="bulk-pair-actions">
          <button class="btn btn-outline btn-sm view-diff-btn" style="font-size: 0.68rem; padding: 0.2rem 0.45rem;" title="View detailed card diff in main panel">
            👁️ Inspect
          </button>
          ${pair.status === 'has_changes' ? `
            <button class="btn btn-success btn-sm single-sync-btn" style="font-size: 0.68rem; padding: 0.2rem 0.45rem;" title="Sync only this deck">
              🚀 Sync
            </button>
          ` : ''}
        </div>
      `;

      const checkbox = card.querySelector('.bulk-check-box');
      if (checkbox && canSelect) {
        checkbox.addEventListener('change', (e) => {
          pair.selected = e.target.checked;
          updateBulkSyncButtonState();
        });
      }

      card.querySelector('.view-diff-btn').addEventListener('click', () => {
        manaboxInput.value = pair.manaboxUrl;
        archidektInput.value = pair.archidektUrl;
        bulkSyncDialog.close();

        if (pair.comparison) {
          state.comparison = pair.comparison;
          renderDiff();
          diffView.classList.add('active');
          showToast(`Inspecting "${pair.name}"`);
        } else {
          triggerComparison();
        }
      });

      const singleSyncBtn = card.querySelector('.single-sync-btn');
      if (singleSyncBtn) {
        singleSyncBtn.addEventListener('click', async () => {
          await syncSinglePairInBulk(pair);
        });
      }

      bulkPairsList.appendChild(card);
    });
  }

  async function runBulkCheck() {
    if (bulkState.isChecking || bulkState.isSyncing) return;
    bulkState.isChecking = true;
    bulkCheckAllBtn.disabled = true;
    bulkCheckIcon.className = 'spinner';
    bulkCheckIcon.textContent = '';
    bulkCheckText.textContent = 'Checking...';
    bulkSyncSelectedBtn.disabled = true;

    for (let i = 0; i < bulkState.pairs.length; i++) {
      const pair = bulkState.pairs[i];
      pair.status = 'checking';
      pair.error = null;
      renderBulkPairsList();

      bulkStatusBanner.innerHTML = `<span><span class="spinner" style="width: 12px; height: 12px;"></span> Checking ${i + 1}/${bulkState.pairs.length}: <strong>${escapeHtml(pair.name)}</strong>...</span>`;

      try {
        const mbDeck = await fetchManaBoxDeck(pair.manaboxUrl);
        const adDeck = await fetchArchidektDeck(pair.archidektUrl);
        const comparison = compareDecks(mbDeck, adDeck);
        pair.comparison = comparison;

        const cmdrName = mbDeck.commanderName || adDeck.commanderName;
        const cmdrImage = mbDeck.commanderImage || adDeck.commanderImage;
        if (cmdrName || cmdrImage) {
          if (cmdrName) pair.commanderName = cmdrName;
          if (cmdrImage) pair.commanderImage = cmdrImage;
          const orig = state.pairings.find(p => p.id === pair.id);
          if (orig) {
            let updated = false;
            if (cmdrName && orig.commanderName !== cmdrName) {
              orig.commanderName = cmdrName;
              updated = true;
            }
            if (cmdrImage && orig.commanderImage !== cmdrImage) {
              orig.commanderImage = cmdrImage;
              updated = true;
            }
            if (updated) {
              await persistPairings();
              renderPairings();
            }
          }
        }

        if (comparison.stats.totalChanges === 0) {
          pair.status = 'in_sync';
          pair.selected = false;
        } else {
          pair.status = 'has_changes';
          pair.selected = true;
        }
      } catch (err) {
        console.error(`Error checking pair "${pair.name}":`, err);
        pair.status = 'error';
        pair.error = err.message || 'Check failed';
        pair.selected = false;
      }

      renderBulkPairsList();
    }

    bulkState.isChecking = false;
    bulkCheckAllBtn.disabled = false;
    bulkCheckIcon.className = '';
    bulkCheckIcon.textContent = '🔄';
    bulkCheckText.textContent = 'Check All';

    updateBulkSummaryBanner();
    updateBulkSyncButtonState();
  }

  async function syncSinglePairInBulk(pair) {
    if (!state.auth.authenticated || !state.auth.token) {
      showToast('Please log into Archidekt first.', false);
      updateAuthDialogUI();
      authDialog.showModal();
      return;
    }

    if (!pair.comparison || pair.status !== 'has_changes') return;

    const ok = confirm(`Apply changes to "${pair.name}" on Archidekt?`);
    if (!ok) return;

    pair.status = 'syncing';
    renderBulkPairsList();

    try {
      const selectedChanges = [
        ...pair.comparison.changes.added,
        ...pair.comparison.changes.modified,
        ...pair.comparison.changes.removed
      ].filter(c => c.selected !== false);

      await executeSync(pair.comparison.archidekt.id, selectedChanges, state.auth.token);
      pair.status = 'synced';
      pair.selected = false;
      renderBulkPairsList();
      updateBulkSummaryBanner();
      updateBulkSyncButtonState();
      showToast(`Synced "${pair.name}" successfully!`);

      // Refresh tab if active on this deck
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url && tab.url.includes(`/decks/${pair.comparison.archidekt.id}`)) {
        await chrome.tabs.reload(tab.id);
      }
    } catch (err) {
      pair.status = 'error';
      pair.error = err.message;
      renderBulkPairsList();
      showToast(`Failed syncing "${pair.name}": ${err.message}`, false);
    }
  }

  if (bulkSyncSelectedBtn) {
    bulkSyncSelectedBtn.addEventListener('click', async () => {
      await runBulkSync();
    });
  }

  async function runBulkSync() {
    if (!state.auth.authenticated || !state.auth.token) {
      showToast('Please log into Archidekt first.', false);
      updateAuthDialogUI();
      authDialog.showModal();
      return;
    }

    const toSync = bulkState.pairs.filter(p => p.selected && p.status === 'has_changes' && p.comparison);
    if (toSync.length === 0) {
      showToast('No decks selected for sync.', false);
      return;
    }

    const ok = confirm(`Apply sync changes to ${toSync.length} deck(s) on Archidekt?`);
    if (!ok) return;

    bulkState.isSyncing = true;
    bulkCheckAllBtn.disabled = true;
    bulkSyncSelectedBtn.disabled = true;
    bulkSyncIcon.className = 'spinner';
    bulkSyncIcon.textContent = '';
    bulkSyncText.textContent = 'Syncing Decks...';

    let successCount = 0;
    const affectedDeckIds = [];

    for (let i = 0; i < toSync.length; i++) {
      const pair = toSync[i];
      pair.status = 'syncing';
      renderBulkPairsList();

      bulkStatusBanner.innerHTML = `<span><span class="spinner" style="width: 12px; height: 12px;"></span> Syncing ${i + 1}/${toSync.length}: <strong>${escapeHtml(pair.name)}</strong>...</span>`;

      try {
        const selectedChanges = [
          ...pair.comparison.changes.added,
          ...pair.comparison.changes.modified,
          ...pair.comparison.changes.removed
        ].filter(c => c.selected !== false);

        await executeSync(pair.comparison.archidekt.id, selectedChanges, state.auth.token);
        pair.status = 'synced';
        pair.selected = false;
        successCount++;
        affectedDeckIds.push(pair.comparison.archidekt.id);
      } catch (err) {
        console.error(`Sync error on "${pair.name}":`, err);
        pair.status = 'error';
        pair.error = err.message;
      }

      renderBulkPairsList();
    }

    bulkState.isSyncing = false;
    bulkCheckAllBtn.disabled = false;
    bulkSyncIcon.className = '';
    bulkSyncIcon.textContent = '🚀';

    updateBulkSummaryBanner();
    updateBulkSyncButtonState();

    showToast(`🎉 Bulk sync finished: ${successCount} of ${toSync.length} decks updated!`);

    // Reload active tab if on one of these decks
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url) {
        if (affectedDeckIds.some(id => tab.url.includes(`/decks/${id}`))) {
          await chrome.tabs.reload(tab.id);
        }
      }
    } catch (e) {
      console.warn(e);
    }
  }

  // -----------------------------------------------------------
  // ManaBox Fetching & Decoding
  // -----------------------------------------------------------

  function unwrapAstroData(val) {
    if (Array.isArray(val)) {
      if (val.length === 2 && typeof val[0] === 'number') {
        return unwrapAstroData(val[1]);
      }
      return val.map(unwrapAstroData);
    } else if (val !== null && typeof val === 'object') {
      const res = {};
      for (const [k, v] of Object.entries(val)) {
        res[k] = unwrapAstroData(v);
      }
      return res;
    }
    return val;
  }

  function normalizeManaBoxUrl(input) {
    if (!input) return null;
    const trimmed = input.trim();
    const idMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?manabox\.app\/decks\/([a-zA-Z0-9_-]+)/i);
    if (idMatch) {
      return `https://manabox.app/decks/${idMatch[1]}`;
    }
    if (/^[a-zA-Z0-9_-]{10,40}$/.test(trimmed)) {
      return `https://manabox.app/decks/${trimmed}`;
    }
    return null;
  }

  function normalizeArchidektDeckId(input) {
    if (!input) return null;
    const str = String(input).trim();
    const match = str.match(/(?:https?:\/\/)?(?:www\.)?archidekt\.com\/decks\/(\d+)/i);
    if (match) return match[1];
    const digitsMatch = str.match(/^(\d+)$/);
    if (digitsMatch) return digitsMatch[1];
    return null;
  }

  function normalizeModifier(val) {
    if (!val) return 'Normal';
    const str = String(val).toLowerCase();
    if (str.includes('etched')) return 'Etched';
    if (str.includes('foil')) return 'Foil';
    return 'Normal';
  }

  function getManaBoxBoard(boardCategory) {
    switch (boardCategory) {
      case 0:
      case 1:
      case 2:
        return 'Commander';
      case 4:
        return 'Sideboard';
      case 5:
        return 'Maybeboard';
      case 3:
      default:
        return 'Mainboard';
    }
  }

  function getArchidektBoard(categories = [], isCompanion = false) {
    const normCats = (categories || []).map(c => String(c).toLowerCase().trim());
    if (isCompanion || normCats.some(c => c === 'commander' || c.includes('commander'))) {
      return 'Commander';
    }
    if (normCats.some(c => c === 'sideboard' || c.includes('sideboard'))) {
      return 'Sideboard';
    }
    if (normCats.some(c => c === 'maybeboard' || c === 'maybe' || c.includes('maybeboard'))) {
      return 'Maybeboard';
    }
    return 'Mainboard';
  }

  async function fetchManaBoxDeck(inputUrl) {
    const url = normalizeManaBoxUrl(inputUrl);
    if (!url) {
      throw new Error('Invalid ManaBox link. Expected format: https://manabox.app/decks/<id>');
    }

    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`ManaBox returned HTTP ${resp.status}`);

    const html = await resp.text();
    const match = html.match(/props=[\"'](\{&quot;deck&quot;:.*?)(?<!\\)[\"']/);
    if (!match) throw new Error('Could not find deck data in ManaBox page.');

    const jsonStr = match[1]
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'");

    const rawData = JSON.parse(jsonStr);
    const rawDeck = unwrapAstroData(rawData.deck);

    const cards = (rawDeck.cards || []).map((c, idx) => {
      const board = getManaBoxBoard(c.boardCategory);
      const isCommander = board === 'Commander';
      const imageUrl = c.images && c.images[0] ? (c.images[0].imageUrlNormal || c.images[0].imageUrlSmall) : '';
      const modifier = normalizeModifier(c.variant);
      return {
        index: idx,
        name: c.name || 'Unknown',
        quantity: Number(c.quantity) || 1,
        boardCategory: c.boardCategory,
        board,
        category: board,
        categories: [board],
        isCommander,
        setId: (c.setId || '').toLowerCase().trim(),
        collectorNumber: String(c.collectorNumber || '').trim(),
        variant: c.variant || 'Normal',
        modifier,
        isFoil: modifier === 'Foil' || modifier === 'Etched',
        imageUrl,
        manaCost: c.faces && c.faces[0] ? (c.faces[0].manaCost || '') : '',
        manaValue: c.manaValue || 0
      };
    });

    const commanderCard = cards.find(c => c.isCommander);
    let commanderName = commanderCard ? commanderCard.name : '';
    let commanderImage = '';
    if (commanderCard && commanderCard.imageUrl) {
      commanderImage = commanderCard.imageUrl
        .replace('/normal/', '/art_crop/')
        .replace('/small/', '/art_crop/')
        .replace('/large/', '/art_crop/');
    } else if (rawDeck.imageUrl) {
      commanderImage = rawDeck.imageUrl
        .replace('/normal/', '/art_crop/')
        .replace('/small/', '/art_crop/')
        .replace('/large/', '/art_crop/');
    }

    return {
      url,
      name: rawDeck.name || 'ManaBox Deck',
      format: rawDeck.format || 'Commander',
      totalCards: cards.reduce((sum, c) => sum + c.quantity, 0),
      commanderName,
      commanderImage,
      cards
    };
  }

  // -----------------------------------------------------------
  // Archidekt Fetching
  // -----------------------------------------------------------

  async function fetchArchidektDeck(input) {
    const deckId = normalizeArchidektDeckId(input);
    if (!deckId) {
      throw new Error('Invalid Archidekt link or ID. Expected e.g. https://archidekt.com/decks/1234567');
    }

    const resp = await fetch(`https://archidekt.com/api/decks/${deckId}/`);
    if (!resp.ok) throw new Error(`Archidekt returned HTTP ${resp.status}`);

    const data = await resp.json();
    const cards = (data.cards || []).map(entry => {
      const cardObj = entry.card || {};
      const oracleObj = cardObj.oracleCard || {};
      const editionObj = cardObj.edition || {};
      const categories = entry.categories || [];
      const board = getArchidektBoard(categories, entry.companion);
      const isCommander = board === 'Commander';
      const modifier = normalizeModifier(entry.modifier);

      return {
        relationId: entry.id,
        name: oracleObj.name || cardObj.displayName || 'Unknown',
        quantity: Number(entry.quantity) || 1,
        categories,
        board,
        category: board,
        isCommander,
        cardId: cardObj.id,
        setId: (editionObj.editioncode || '').toLowerCase().trim(),
        collectorNumber: String(cardObj.collectorNumber || '').trim(),
        modifier,
        isFoil: modifier === 'Foil' || modifier === 'Etched',
        manaCost: oracleObj.manaCost || '',
        manaValue: oracleObj.cmc || 0,
        imageUrl: cardObj.uid
          ? `https://cards.scryfall.io/small/front/${cardObj.uid.charAt(0)}/${cardObj.uid.charAt(1)}/${cardObj.uid}.jpg`
          : ''
      };
    });

    const commanderCard = cards.find(c => c.isCommander);
    let commanderName = commanderCard ? commanderCard.name : '';
    let commanderImage = '';
    if (commanderCard && commanderCard.imageUrl) {
      commanderImage = commanderCard.imageUrl.replace('/small/', '/art_crop/');
    } else if (data.featured) {
      commanderImage = data.featured;
    }

    return {
      id: String(data.id || deckId),
      name: data.name || 'Archidekt Deck',
      owner: data.owner ? data.owner.username : 'Unknown',
      format: data.deckFormat ? (typeof data.deckFormat === 'object' ? data.deckFormat.name : data.deckFormat) : 'Commander',
      totalCards: cards.reduce((sum, c) => sum + c.quantity, 0),
      commanderName,
      commanderImage,
      cards
    };
  }

  // -----------------------------------------------------------
  // Diff Engine
  // -----------------------------------------------------------

  function normalizeCardName(name) {
    return (name || '')
      .toLowerCase()
      .trim()
      .replace(/[’']/g, "'")
      .replace(/[“”"]/g, '"')
      .replace(/\s+/g, ' ');
  }

  function getCardKeys(name) {
    const norm = normalizeCardName(name);
    const keys = [norm];
    if (norm.includes(' // ')) keys.push(norm.split(' // ')[0].trim());
    return keys;
  }

  function compareDecks(mbDeck, adDeck) {
    // Group ManaBox cards by primary key
    const mbMap = new Map();
    for (const c of mbDeck.cards) {
      const keys = getCardKeys(c.name);
      const k = keys[0];
      if (!mbMap.has(k)) {
        mbMap.set(k, { name: c.name, allKeys: keys, entries: [] });
      }
      mbMap.get(k).entries.push({ ...c });
    }

    // Group Archidekt cards by primary key
    const adMap = new Map();
    for (const c of adDeck.cards) {
      const keys = getCardKeys(c.name);
      const k = keys[0];
      if (!adMap.has(k)) {
        adMap.set(k, { name: c.name, allKeys: keys, entries: [] });
      }
      adMap.get(k).entries.push({ ...c });
    }

    const added = [];
    const removed = [];
    const modified = [];
    const inSync = [];

    const matchedAdKeys = new Set();

    for (const [mbKey, mbGroup] of mbMap.entries()) {
      let adGroup = null;
      for (const k of mbGroup.allKeys) {
        if (adMap.has(k)) {
          adGroup = adMap.get(k);
          break;
        }
      }

      if (!adGroup) {
        // Entire card name missing from Archidekt: ADD to target board
        for (const mb of mbGroup.entries) {
          added.push({
            id: `add-${mb.name}-${mb.setId}-${mb.collectorNumber}-${mb.modifier}-${mb.board}`,
            name: mb.name,
            action: 'add',
            board: mb.board,
            categories: [mb.board],
            delta: mb.quantity,
            targetQuantity: mb.quantity,
            manaboxQty: mb.quantity,
            archidektQty: 0,
            isCommander: mb.isCommander,
            setId: mb.setId,
            collectorNumber: mb.collectorNumber,
            modifier: mb.modifier,
            isFoil: mb.isFoil,
            imageUrl: mb.imageUrl,
            manaCost: mb.manaCost,
            selected: true
          });
        }
      } else {
        matchedAdKeys.add(adGroup.allKeys[0]);

        const remainingMb = [...mbGroup.entries];
        const remainingAd = [...adGroup.entries];

        // 1. Exact match on same board + printing (setId + collectorNumber) + modifier (finish)
        for (let i = remainingMb.length - 1; i >= 0; i--) {
          const mb = remainingMb[i];
          const matchIdx = remainingAd.findIndex(ad =>
            ad.board === mb.board &&
            ad.setId === mb.setId &&
            ad.collectorNumber === mb.collectorNumber &&
            ad.modifier === mb.modifier
          );

          if (matchIdx !== -1) {
            const ad = remainingAd.splice(matchIdx, 1)[0];
            remainingMb.splice(i, 1);

            if (mb.quantity === ad.quantity) {
              inSync.push({
                id: `sync-${mb.name}-${mb.setId}-${mb.collectorNumber}-${mb.modifier}-${mb.board}`,
                name: mb.name,
                action: 'sync',
                board: mb.board,
                categories: ad.categories,
                quantity: mb.quantity,
                manaboxQty: mb.quantity,
                archidektQty: ad.quantity,
                isCommander: mb.isCommander,
                setId: mb.setId,
                collectorNumber: mb.collectorNumber,
                modifier: mb.modifier,
                isFoil: mb.isFoil,
                imageUrl: mb.imageUrl || ad.imageUrl,
                selected: false
              });
            } else {
              modified.push({
                id: `mod-qty-${ad.relationId}`,
                name: mb.name,
                action: 'modify',
                changeType: 'quantity',
                board: mb.board,
                categories: ad.categories,
                delta: mb.quantity - ad.quantity,
                targetQuantity: mb.quantity,
                manaboxQty: mb.quantity,
                archidektQty: ad.quantity,
                isCommander: mb.isCommander,
                archidektCardId: ad.cardId,
                archidektRelationId: ad.relationId,
                setId: mb.setId,
                collectorNumber: mb.collectorNumber,
                modifier: mb.modifier,
                isFoil: mb.isFoil,
                imageUrl: mb.imageUrl || ad.imageUrl,
                manaCost: mb.manaCost,
                selected: true
              });
            }
          }
        }

        // 2. Same board match: version or finish change
        for (let i = remainingMb.length - 1; i >= 0; i--) {
          const mb = remainingMb[i];
          const matchIdx = remainingAd.findIndex(ad => ad.board === mb.board);

          if (matchIdx !== -1) {
            const ad = remainingAd.splice(matchIdx, 1)[0];
            remainingMb.splice(i, 1);

            const isVersionChange = mb.setId !== ad.setId || mb.collectorNumber !== ad.collectorNumber;
            const isFinishChange = mb.modifier !== ad.modifier;
            const changeType = isVersionChange ? 'version' : (isFinishChange ? 'finish' : 'quantity');

            modified.push({
              id: `mod-ver-${ad.relationId}`,
              name: mb.name,
              action: 'modify',
              changeType,
              board: mb.board,
              categories: ad.categories,
              delta: mb.quantity - ad.quantity,
              targetQuantity: mb.quantity,
              manaboxQty: mb.quantity,
              archidektQty: ad.quantity,
              isCommander: mb.isCommander,
              archidektCardId: ad.cardId,
              archidektRelationId: ad.relationId,
              setId: mb.setId,
              collectorNumber: mb.collectorNumber,
              modifier: mb.modifier,
              isFoil: mb.isFoil,
              fromSet: ad.setId,
              fromCollector: ad.collectorNumber,
              fromModifier: ad.modifier,
              toSet: mb.setId,
              toCollector: mb.collectorNumber,
              toModifier: mb.modifier,
              imageUrl: mb.imageUrl || ad.imageUrl,
              manaCost: mb.manaCost,
              selected: true
            });
          }
        }

        // 3. Cross-board match: card moved between boards (e.g. Mainboard -> Sideboard/Maybeboard)
        while (remainingMb.length > 0 && remainingAd.length > 0) {
          const mb = remainingMb.shift();
          const ad = remainingAd.shift();

          const isVersionChange = mb.setId !== ad.setId || mb.collectorNumber !== ad.collectorNumber;
          const isFinishChange = mb.modifier !== ad.modifier;

          modified.push({
            id: `mod-board-${ad.relationId}`,
            name: mb.name,
            action: 'modify',
            changeType: 'board',
            fromBoard: ad.board,
            toBoard: mb.board,
            board: mb.board,
            categories: [mb.board],
            delta: mb.quantity - ad.quantity,
            targetQuantity: mb.quantity,
            manaboxQty: mb.quantity,
            archidektQty: ad.quantity,
            isCommander: mb.isCommander,
            archidektCardId: ad.cardId,
            archidektRelationId: ad.relationId,
            setId: mb.setId,
            collectorNumber: mb.collectorNumber,
            modifier: mb.modifier,
            isFoil: mb.isFoil,
            fromSet: ad.setId,
            fromCollector: ad.collectorNumber,
            fromModifier: ad.modifier,
            toSet: mb.setId,
            toCollector: mb.collectorNumber,
            toModifier: mb.modifier,
            isVersionChange,
            isFinishChange,
            imageUrl: mb.imageUrl || ad.imageUrl,
            manaCost: mb.manaCost,
            selected: true
          });
        }

        // 4. Any leftovers in ManaBox are extra additions
        for (const mb of remainingMb) {
          added.push({
            id: `add-${mb.name}-${mb.setId}-${mb.collectorNumber}-${mb.modifier}-${mb.board}`,
            name: mb.name,
            action: 'add',
            board: mb.board,
            categories: [mb.board],
            delta: mb.quantity,
            targetQuantity: mb.quantity,
            manaboxQty: mb.quantity,
            archidektQty: 0,
            isCommander: mb.isCommander,
            setId: mb.setId,
            collectorNumber: mb.collectorNumber,
            modifier: mb.modifier,
            isFoil: mb.isFoil,
            imageUrl: mb.imageUrl,
            manaCost: mb.manaCost,
            selected: true
          });
        }

        // 5. Any leftovers in Archidekt are removals
        for (const ad of remainingAd) {
          removed.push({
            id: `rem-${ad.relationId}`,
            name: ad.name,
            action: 'remove',
            board: ad.board,
            categories: ad.categories,
            delta: -ad.quantity,
            targetQuantity: 0,
            manaboxQty: 0,
            archidektQty: ad.quantity,
            isCommander: ad.isCommander,
            archidektCardId: ad.cardId,
            archidektRelationId: ad.relationId,
            setId: ad.setId,
            collectorNumber: ad.collectorNumber,
            modifier: ad.modifier,
            isFoil: ad.isFoil,
            imageUrl: ad.imageUrl,
            selected: true
          });
        }
      }
    }

    // Removals for cards completely missing from ManaBox
    for (const [adKey, adGroup] of adMap.entries()) {
      if (!matchedAdKeys.has(adKey)) {
        for (const ad of adGroup.entries) {
          removed.push({
            id: `rem-${ad.relationId}`,
            name: ad.name,
            action: 'remove',
            board: ad.board,
            categories: ad.categories,
            delta: -ad.quantity,
            targetQuantity: 0,
            manaboxQty: 0,
            archidektQty: ad.quantity,
            isCommander: ad.isCommander,
            archidektCardId: ad.cardId,
            archidektRelationId: ad.relationId,
            setId: ad.setId,
            collectorNumber: ad.collectorNumber,
            modifier: ad.modifier,
            isFoil: ad.isFoil,
            imageUrl: ad.imageUrl,
            selected: true
          });
        }
      }
    }

    return {
      manabox: mbDeck,
      archidekt: adDeck,
      stats: {
        addedCount: added.length,
        removedCount: removed.length,
        modifiedCount: modified.length,
        inSyncCount: inSync.length,
        totalChanges: added.length + removed.length + modified.length
      },
      changes: { added, removed, modified, inSync }
    };
  }

  // -----------------------------------------------------------
  // Comparison Handler
  // -----------------------------------------------------------

  if (compareBtn) {
    compareBtn.addEventListener('click', async () => {
      await triggerComparison();
    });
  }

  async function triggerComparison() {
    const mbVal = manaboxInput.value.trim();
    const adVal = archidektInput.value.trim();

    if (!mbVal || !adVal) {
      showToast('Please provide both deck URLs/IDs', false);
      return;
    }

    setCompareLoading(true);

    try {
      const mbDeck = await fetchManaBoxDeck(mbVal);
      const adDeck = await fetchArchidektDeck(adVal);
      const comparison = compareDecks(mbDeck, adDeck);
      state.comparison = comparison;

      // Auto-enrich matching pairing with commander details
      const normMb = normalizeManaBoxUrl(mbVal);
      const normAd = normalizeArchidektDeckId(adVal);
      const matchedPair = state.pairings.find(p =>
        (normMb && normalizeManaBoxUrl(p.manaboxUrl) === normMb) ||
        (normAd && normalizeArchidektDeckId(p.archidektUrl) === normAd)
      );
      if (matchedPair) {
        const cmdrName = mbDeck.commanderName || adDeck.commanderName;
        const cmdrImage = mbDeck.commanderImage || adDeck.commanderImage;
        let changed = false;
        if (cmdrName && matchedPair.commanderName !== cmdrName) {
          matchedPair.commanderName = cmdrName;
          changed = true;
        }
        if (cmdrImage && matchedPair.commanderImage !== cmdrImage) {
          matchedPair.commanderImage = cmdrImage;
          changed = true;
        }
        if (changed) {
          await persistPairings();
          renderPairings();
        }
      }

      renderDiff();
      diffView.classList.add('active');
      showToast('Decks compared successfully!');
    } catch (err) {
      console.error(err);
      showToast(err.message, false);
    } finally {
      setCompareLoading(false);
    }
  }

  function setCompareLoading(loading) {
    compareBtn.disabled = loading;
    if (loading) {
      compareIcon.className = 'spinner';
      compareIcon.textContent = '';
      compareText.textContent = 'Comparing...';
    } else {
      compareIcon.className = '';
      compareIcon.textContent = '⚡';
      compareText.textContent = 'Compare Decks';
    }
  }

  // -----------------------------------------------------------
  // Diff View Renderer
  // -----------------------------------------------------------

  function renderDiff() {
    const { manabox, archidekt, stats } = state.comparison;

    mbName.textContent = manabox.name;
    mbMeta.textContent = `${manabox.format} • ${manabox.totalCards} cards`;

    adName.textContent = archidekt.name;
    adMeta.textContent = `by @${archidekt.owner} • ${archidekt.totalCards} cards`;

    statAdded.textContent = `+${stats.addedCount}`;
    statRemoved.textContent = `-${stats.removedCount}`;
    statModified.textContent = `~${stats.modifiedCount}`;
    statSynced.textContent = `=${stats.inSyncCount}`;

    countAll.textContent = stats.totalChanges;
    countAdd.textContent = stats.addedCount;
    countRemove.textContent = stats.removedCount;
    countModify.textContent = stats.modifiedCount;
    countSync.textContent = stats.inSyncCount;

    renderChangesList();
  }

  function renderChangesList() {
    changesList.innerHTML = '';
    const { added, removed, modified, inSync } = state.comparison.changes;

    let items = [];
    if (state.currentFilter === 'all') items = [...added, ...modified, ...removed];
    else if (state.currentFilter === 'add') items = added;
    else if (state.currentFilter === 'remove') items = removed;
    else if (state.currentFilter === 'modify') items = modified;
    else if (state.currentFilter === 'sync') items = inSync;

    if (items.length === 0) {
      changesList.innerHTML = `
        <div style="text-align: center; padding: 1.5rem; color: var(--text-muted);">
          No cards in this filter.
        </div>
      `;
      return;
    }

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = `change-card action-${item.action}`;

      let tagClass = item.action;
      let tagLabel = '';

      let boardBadgeHtml = '';
      const displayBoard = item.toBoard || item.board;
      if (displayBoard === 'Sideboard') {
        boardBadgeHtml = '<span class="badge-board sideboard">Sideboard</span>';
      } else if (displayBoard === 'Maybeboard') {
        boardBadgeHtml = '<span class="badge-board maybeboard">Maybeboard</span>';
      } else if (item.isCommander || displayBoard === 'Commander') {
        boardBadgeHtml = '<span class="badge-board commander">Commander</span>';
      }

      if (item.action === 'add') {
        tagLabel = `+${item.targetQuantity}`;
      } else if (item.action === 'remove') {
        tagLabel = `-${item.archidektQty}`;
      } else if (item.action === 'modify') {
        if (item.changeType === 'board') {
          tagClass = 'modify board';
          tagLabel = item.delta !== 0 ? `~ Board (${item.archidektQty}➔${item.targetQuantity})` : `~ Board`;
        } else if (item.changeType === 'version') {
          tagClass = 'modify version';
          tagLabel = item.delta !== 0 ? `~ Ver (${item.archidektQty}➔${item.targetQuantity})` : `~ Version`;
        } else if (item.changeType === 'finish') {
          tagClass = 'modify finish';
          tagLabel = item.delta !== 0 ? `~ Foil (${item.archidektQty}➔${item.targetQuantity})` : `~ Foil`;
        } else {
          tagLabel = `${item.archidektQty}➔${item.targetQuantity}`;
        }
      } else {
        tagLabel = `=${item.quantity}`;
      }

      const isChecked = item.selected !== false;
      const isSync = item.action === 'sync';
      const thumbUrl = item.imageUrl || `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(item.name)}&format=image`;

      let metaHtml = '';
      if (item.action === 'modify' && item.changeType === 'board') {
        const fromFoil = item.fromModifier && item.fromModifier !== 'Normal' ? ` <span class="foil-sparkle">✨${item.fromModifier}</span>` : '';
        const toFoil = item.toModifier && item.toModifier !== 'Normal' ? ` <span class="foil-sparkle">✨${item.toModifier}</span>` : '';
        const printingInfo = item.isVersionChange || item.isFinishChange
          ? ` • [${(item.fromSet || '').toUpperCase()}]${fromFoil} ➔ [${(item.toSet || '').toUpperCase()}]${toFoil}`
          : '';
        metaHtml = `
          <span>${item.fromBoard || 'Mainboard'}</span>
          <span class="version-arrow">➔</span>
          <span style="color: #38bdf8; font-weight: 700;">${item.toBoard}</span>
          ${printingInfo}
        `;
      } else if (item.action === 'modify' && (item.changeType === 'version' || item.changeType === 'finish')) {
        const fromFoil = item.fromModifier && item.fromModifier !== 'Normal' ? ` <span class="foil-sparkle">✨${item.fromModifier}</span>` : '';
        const toFoil = item.toModifier && item.toModifier !== 'Normal' ? ` <span class="foil-sparkle">✨${item.toModifier}</span>` : '';
        metaHtml = `
          <span>[${(item.fromSet || '').toUpperCase()}] #${item.fromCollector || '?'}${fromFoil}</span>
          <span class="version-arrow">➔</span>
          <span style="color: var(--text-main); font-weight: 600;">[${(item.toSet || '').toUpperCase()}] #${item.toCollector || '?'}${toFoil}</span>
        `;
      } else {
        const foilTag = item.modifier && item.modifier !== 'Normal' ? ` <span class="foil-sparkle">✨${item.modifier}</span>` : '';
        metaHtml = `${item.setId ? `[${item.setId.toUpperCase()}]` : ''} ${item.collectorNumber ? `#${item.collectorNumber}` : ''}${foilTag}`;
      }

      card.innerHTML = `
        <div>
          <input
            type="checkbox"
            style="cursor: pointer;"
            ${isChecked ? 'checked' : ''}
            ${isSync ? 'disabled' : ''}
          />
        </div>
        <div>
          <img src="${thumbUrl}" class="card-img" alt="${escapeHtml(item.name)}" loading="lazy" onerror="this.style.display='none'" />
        </div>
        <div class="card-info">
          <span class="card-name-text" title="${escapeHtml(item.name)}">
            ${boardBadgeHtml}${escapeHtml(item.name)}
          </span>
          <span class="card-meta-text">
            ${metaHtml}
          </span>
        </div>
        <div>
          <span class="badge-tag ${tagClass}">${tagLabel}</span>
        </div>
      `;

      const checkbox = card.querySelector('input[type="checkbox"]');
      if (checkbox && !isSync) {
        checkbox.addEventListener('change', (e) => {
          item.selected = e.target.checked;
        });
      }

      changesList.appendChild(card);
    });
  }

  // Filter tabs
  filterTabs.forEach(t => {
    t.addEventListener('click', () => {
      filterTabs.forEach(tab => tab.classList.remove('active'));
      t.classList.add('active');
      state.currentFilter = t.dataset.filter;
      renderChangesList();
    });
  });

  if (selectAllBtn) {
    selectAllBtn.addEventListener('click', () => {
      if (!state.comparison) return;
      const { added, removed, modified } = state.comparison.changes;
      [...added, ...removed, ...modified].forEach(i => i.selected = true);
      renderChangesList();
    });
  }

  if (deselectAllBtn) {
    deselectAllBtn.addEventListener('click', () => {
      if (!state.comparison) return;
      const { added, removed, modified } = state.comparison.changes;
      [...added, ...removed, ...modified].forEach(i => i.selected = false);
      renderChangesList();
    });
  }

  // -----------------------------------------------------------
  // Mass Edit Clipboard Copy
  // -----------------------------------------------------------

  if (copyMassEditBtn) {
    copyMassEditBtn.addEventListener('click', async () => {
      if (!state.comparison) return;
      const { added, modified } = state.comparison.changes;

      let text = '';
      const cmdr = [];
      const main = [];
      const side = [];
      const maybe = [];

      function formatLine(c) {
        const modSuffix = c.modifier === 'Foil' ? ' *F*' : (c.modifier === 'Etched' ? ' *E*' : '');
        if (c.setId && c.collectorNumber) {
          return `${c.targetQuantity} ${c.name} (${c.setId.toUpperCase()}) ${c.collectorNumber}${modSuffix}`;
        }
        return `${c.targetQuantity} ${c.name}${modSuffix}`;
      }

      function pushToBoard(c) {
        const line = formatLine(c);
        const b = c.toBoard || c.board;
        if (c.isCommander || b === 'Commander') cmdr.push(line);
        else if (b === 'Sideboard') side.push(line);
        else if (b === 'Maybeboard') maybe.push(line);
        else main.push(line);
      }

      for (const c of added) pushToBoard(c);
      for (const c of modified) {
        if (c.targetQuantity > 0) pushToBoard(c);
      }

      if (cmdr.length) text += '# Commander\n' + cmdr.join('\n') + '\n\n';
      if (main.length) text += '# Mainboard\n' + main.join('\n') + '\n\n';
      if (side.length) text += '# Sideboard\n' + side.join('\n') + '\n\n';
      if (maybe.length) text += '# Maybeboard\n' + maybe.join('\n') + '\n\n';

      await navigator.clipboard.writeText(text.trim());
      showToast('Copied Mass Edit text to clipboard!');
    });
  }

  // -----------------------------------------------------------
  // Direct Sync Execution
  // -----------------------------------------------------------

  if (applySyncBtn) {
    applySyncBtn.addEventListener('click', async () => {
      if (!state.comparison) return;

      if (!state.auth.authenticated || !state.auth.token) {
        showToast('Please log into Archidekt first.', false);
        updateAuthDialogUI();
        authDialog.showModal();
        return;
      }

      const { added, removed, modified } = state.comparison.changes;
      const selected = [...added, ...removed, ...modified].filter(i => i.selected !== false);

      if (selected.length === 0) {
        showToast('No changes selected to sync.', false);
        return;
      }

      const confirmed = confirm(`Apply ${selected.length} card changes directly to Archidekt?`);
      if (!confirmed) return;

      setSyncLoading(true);

      try {
        await executeSync(state.comparison.archidekt.id, selected, state.auth.token);
        showToast('Sync completed successfully!');

        // Check if active tab is on this Archidekt deck, and refresh it!
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url && tab.url.includes(`/decks/${state.comparison.archidekt.id}`)) {
          await chrome.tabs.reload(tab.id);
        }

        // Re-compare
        await triggerComparison();
      } catch (err) {
        console.error(err);
        showToast(`Sync failed: ${err.message}`, false);
      } finally {
        setSyncLoading(false);
      }
    });
  }

  function generateUuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  async function executeSync(deckId, selectedChanges, token) {
    const additions = selectedChanges.filter(c => c.action === 'add');
    const removals = selectedChanges.filter(c => c.action === 'remove');
    const modifications = selectedChanges.filter(c => c.action === 'modify');

    const versionModifications = modifications.filter(c => c.changeType === 'version' || c.changeType === 'finish' || c.isVersionChange);
    const qtyOrBoardModifications = modifications.filter(c => c.changeType !== 'version' && c.changeType !== 'finish' && !c.isVersionChange);

    // Cards that require card ID / edition resolution on Archidekt
    const cardsToResolve = [...additions, ...versionModifications];

    const resolvedMap = new Map();

    if (cardsToResolve.length > 0) {
      let editText = '';
      const cmdr = cardsToResolve.filter(c => c.board === 'Commander' || c.isCommander);
      const side = cardsToResolve.filter(c => c.board === 'Sideboard');
      const maybe = cardsToResolve.filter(c => c.board === 'Maybeboard');
      const main = cardsToResolve.filter(c => !c.isCommander && c.board !== 'Sideboard' && c.board !== 'Maybeboard');

      function formatCardLine(c) {
        const qty = c.targetQuantity || 1;
        const modSuffix = c.modifier === 'Foil' ? ' *F*' : (c.modifier === 'Etched' ? ' *E*' : '');
        if (c.setId && c.collectorNumber) {
          return `${qty} ${c.name} (${c.setId.toUpperCase()}) ${c.collectorNumber}${modSuffix}`;
        }
        return `${qty} ${c.name}${modSuffix}`;
      }

      if (cmdr.length) {
        editText += '# Commander\n';
        for (const c of cmdr) editText += formatCardLine(c) + '\n';
        editText += '\n';
      }

      if (side.length) {
        editText += '# Sideboard\n';
        for (const c of side) editText += formatCardLine(c) + '\n';
        editText += '\n';
      }

      if (maybe.length) {
        editText += '# Maybeboard\n';
        for (const c of maybe) editText += formatCardLine(c) + '\n';
        editText += '\n';
      }

      if (main.length) {
        editText += '# Mainboard\n';
        for (const c of main) editText += formatCardLine(c) + '\n';
      }

      const res = await fetch('https://archidekt.com/api/cards/massDeckEdit/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parser: 'archidekt', current: '', edit: editText.trim() })
      });

      if (!res.ok) throw new Error('Failed to resolve cards on Archidekt.');
      const data = await res.json();

      for (const item of (data.toAdd || [])) {
        const nameKey = normalizeCardName(item.name);
        const setCode = (item.card?.edition?.editioncode || '').toLowerCase().trim();
        const colNum = String(item.card?.collectorNumber || '').trim().toLowerCase();
        const mod = item.modifier || 'Normal';
        const isCmdr = Array.isArray(item.categories) && item.categories.includes('Commander');

        // Detailed key (name|set|collector|modifier|cmdr)
        const fullKey = `${nameKey}|${setCode}|${colNum}|${mod}|${isCmdr ? 'cmdr' : 'main'}`;
        if (!resolvedMap.has(fullKey)) resolvedMap.set(fullKey, []);
        resolvedMap.get(fullKey).push(item);

        // Printing key (name|set|collector|modifier)
        const printKey = `${nameKey}|${setCode}|${colNum}|${mod}`;
        if (!resolvedMap.has(printKey)) resolvedMap.set(printKey, []);
        resolvedMap.get(printKey).push(item);

        // Set/collector key (name|set|collector)
        const scKey = `${nameKey}|${setCode}|${colNum}`;
        if (!resolvedMap.has(scKey)) resolvedMap.set(scKey, []);
        resolvedMap.get(scKey).push(item);

        // Fallback key (name only)
        if (!resolvedMap.has(nameKey)) resolvedMap.set(nameKey, []);
        resolvedMap.get(nameKey).push(item);
      }
    }

    function getResolvedCard(c) {
      const nameKey = normalizeCardName(c.name);
      const setCode = (c.setId || '').toLowerCase().trim();
      const colNum = String(c.collectorNumber || '').trim().toLowerCase();
      const mod = c.modifier || 'Normal';
      const isCmdr = !!c.isCommander;

      const fullKey = `${nameKey}|${setCode}|${colNum}|${mod}|${isCmdr ? 'cmdr' : 'main'}`;
      if (resolvedMap.has(fullKey) && resolvedMap.get(fullKey).length > 0) {
        return resolvedMap.get(fullKey).shift();
      }

      const printKey = `${nameKey}|${setCode}|${colNum}|${mod}`;
      if (resolvedMap.has(printKey) && resolvedMap.get(printKey).length > 0) {
        return resolvedMap.get(printKey).shift();
      }

      const scKey = `${nameKey}|${setCode}|${colNum}`;
      if (resolvedMap.has(scKey) && resolvedMap.get(scKey).length > 0) {
        return resolvedMap.get(scKey).shift();
      }

      if (resolvedMap.has(nameKey) && resolvedMap.get(nameKey).length > 0) {
        return resolvedMap.get(nameKey).shift();
      }

      return null;
    }

    const mutations = [];

    // 1. Additions
    for (const add of additions) {
      const item = getResolvedCard(add);
      if (!item || !item.card?.id) {
        throw new Error(`Could not resolve card: "${add.name}"`);
      }

      const targetCategories = add.categories?.length ? add.categories : (add.board ? [add.board] : ['Mainboard']);

      mutations.push({
        action: 'add',
        cardid: item.card.id,
        customCardId: null,
        categories: targetCategories,
        patchId: generateUuid(),
        modifications: {
          quantity: add.targetQuantity,
          modifier: add.modifier || item.modifier || 'Normal',
          customCmc: null,
          companion: false,
          flippedDefault: false,
          label: ''
        }
      });
    }

    // 2. Version/Finish Modifications
    for (const mod of versionModifications) {
      if (!mod.archidektRelationId) continue;
      const item = getResolvedCard(mod);
      if (!item || !item.card?.id) {
        throw new Error(`Could not resolve new printing for: "${mod.name}"`);
      }

      const targetCategories = mod.toBoard ? [mod.toBoard] : (mod.categories?.length ? mod.categories : [mod.board || 'Mainboard']);

      mutations.push({
        action: 'modify',
        cardid: item.card.id,
        deckRelationId: mod.archidektRelationId,
        patchId: generateUuid(),
        categories: targetCategories,
        modifications: {
          quantity: mod.targetQuantity,
          modifier: mod.modifier || item.modifier || 'Normal',
          customCmc: null,
          companion: false,
          flippedDefault: false,
          label: ''
        }
      });
    }

    // 3. Quantity & Board Modifications
    for (const mod of qtyOrBoardModifications) {
      if (!mod.archidektRelationId) continue;

      const targetCategories = mod.toBoard ? [mod.toBoard] : (mod.categories?.length ? mod.categories : [mod.board || 'Mainboard']);

      mutations.push({
        action: 'modify',
        cardid: mod.archidektCardId,
        deckRelationId: mod.archidektRelationId,
        patchId: generateUuid(),
        categories: targetCategories,
        modifications: {
          quantity: mod.targetQuantity,
          modifier: mod.modifier || 'Normal',
          customCmc: null,
          companion: false,
          flippedDefault: false,
          label: ''
        }
      });
    }

    // 4. Removals
    for (const rem of removals) {
      if (!rem.archidektRelationId) continue;
      mutations.push({
        action: 'remove',
        cardid: rem.archidektCardId,
        deckRelationId: rem.archidektRelationId,
        patchId: generateUuid(),
        categories: rem.categories?.length ? rem.categories : [rem.board || 'Mainboard'],
        modifications: { quantity: 0 }
      });
    }

    const patchResp = await fetch(`https://archidekt.com/api/decks/${deckId}/modifyCards/v2/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `JWT ${token}`
      },
      body: JSON.stringify({ cards: mutations })
    });

    if (!patchResp.ok) {
      const errText = await patchResp.text();
      throw new Error(`Archidekt API error: ${errText}`);
    }

    return await patchResp.json();
  }

  function setSyncLoading(loading) {
    applySyncBtn.disabled = loading;
    if (loading) {
      syncIcon.className = 'spinner';
      syncIcon.textContent = '';
      syncText.textContent = 'Syncing...';
    } else {
      syncIcon.className = '';
      syncIcon.textContent = '🚀';
      syncText.textContent = 'Sync to Archidekt';
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // -----------------------------------------------------------
  // Backup & Restore Dialog Controller
  // -----------------------------------------------------------

  if (exportPairsBtn && backupDialog) {
    exportPairsBtn.addEventListener('click', () => {
      if (importJsonTextarea) {
        importJsonTextarea.value = JSON.stringify(state.pairings, null, 2);
      }
      backupDialog.showModal();
    });
  }

  if (copyBackupJsonBtn) {
    copyBackupJsonBtn.addEventListener('click', async () => {
      try {
        const jsonStr = JSON.stringify(state.pairings, null, 2);
        await navigator.clipboard.writeText(jsonStr);
        showToast('Pairings JSON copied to clipboard!');
      } catch (e) {
        showToast('Failed to copy to clipboard', false);
      }
    });
  }

  if (downloadBackupJsonBtn) {
    downloadBackupJsonBtn.addEventListener('click', () => {
      try {
        const jsonStr = JSON.stringify(state.pairings, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `deck-pairings-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Backup JSON file downloaded!');
      } catch (e) {
        showToast('Failed to download file', false);
      }
    });
  }

  if (importJsonBtn && importJsonTextarea) {
    importJsonBtn.addEventListener('click', async () => {
      const raw = importJsonTextarea.value.trim();
      if (!raw) {
        showToast('Please paste JSON text first', false);
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) throw new Error('Root JSON must be an array of decks');
        const validPairs = parsed.filter(p => p && p.name && (p.manaboxUrl || p.archidektUrl)).map(p => ({
          id: p.id || ('pair-' + Date.now() + Math.random().toString(36).slice(2, 6)),
          name: p.name,
          manaboxUrl: p.manaboxUrl || '',
          archidektUrl: p.archidektUrl || '',
          createdAt: typeof p.createdAt === 'number' ? p.createdAt : undefined
        }));
        if (!validPairs.length) {
          showToast('No valid deck pairs found in JSON', false);
          return;
        }

        const existingIds = new Set(state.pairings.map(p => p.id));
        const toAdd = validPairs.filter(p => !existingIds.has(p.id));
        state.pairings = [...toAdd, ...state.pairings];
        await persistPairings();

        renderPairings();
        backupDialog.close();
        showToast(`Successfully imported ${validPairs.length} deck pairs!`);
      } catch (err) {
        showToast(`Import error: ${err.message}`, false);
      }
    });
  }

  // -----------------------------------------------------------
  // Setup & Initial Loads
  // -----------------------------------------------------------

  setupDialogs();
  setupSortControl();
  setupSavedPairsAccordion();

  // 1. Immediately load and render existing deck pairs
  try {
    await loadPairings();
  } catch (err) {
    console.error('Failed to load pairings:', err);
  }

  // 2. Automatically detect Archidekt session from browser cookies
  try {
    await checkAuthSession();
  } catch (err) {
    console.warn('Auth check failed:', err);
  }

  // 3. Check active tab for open deck
  try {
    await detectActiveTabDeck();
  } catch (err) {
    console.warn('Detect active tab deck failed:', err);
  }
});
