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
  const compareBtn = document.getElementById('compareBtn');
  const compareIcon = document.getElementById('compareIcon');
  const compareText = document.getElementById('compareText');
  const savePairingBtn = document.getElementById('savePairingBtn');
  const pairingsBar = document.getElementById('pairingsBar');
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

  // Setup dialog backdrop dismiss
  setupDialogs();

  // Initial loads
  await checkAuthSession();
  await detectActiveTabDeck();
  await loadPairings();

  // -----------------------------------------------------------
  // Dialog & Toast Helpers
  // -----------------------------------------------------------

  function setupDialogs() {
    document.querySelectorAll('dialog').forEach(dialog => {
      dialog.querySelectorAll('[data-close-dialog]').forEach(btn => {
        btn.addEventListener('click', () => dialog.close());
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

  let toastTimer = null;
  function showToast(msg, isSuccess = true) {
    if (toastTimer) clearTimeout(toastTimer);
    toast.innerHTML = `
      <span>${escapeHtml(msg)}</span>
      <span style="opacity: 0.6; font-size: 1.1rem; line-height: 1; cursor: pointer; padding-left: 0.5rem;" title="Dismiss">&times;</span>
    `;
    toast.style.display = 'flex';
    toast.style.borderLeftColor = isSuccess ? 'var(--success)' : 'var(--danger)';
    toastTimer = setTimeout(() => {
      toast.style.display = 'none';
    }, 2200);
  }

  toast.addEventListener('click', () => {
    if (toastTimer) clearTimeout(toastTimer);
    toast.style.display = 'none';
  });

  // -----------------------------------------------------------
  // Archidekt Cookie & Session Auto-Detection
  // -----------------------------------------------------------

  authBtn.addEventListener('click', () => {
    updateAuthDialogUI();
    authDialog.showModal();
  });

  refreshAuthBtn.addEventListener('click', async () => {
    await checkAuthSession();
    updateAuthDialogUI();
    showToast('Session re-checked!');
  });

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

  useTabDeckBtn.addEventListener('click', async () => {
    await detectActiveTabDeck(true);
  });

  async function detectActiveTabDeck(showNotice = false) {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url) {
        const match = tab.url.match(/archidekt\.com\/decks\/(\d+)/i);
        if (match) {
          archidektInput.value = match[1];
          if (showNotice) showToast(`Detected Archidekt deck #${match[1]} from tab!`);
          return;
        }
      }
      if (showNotice) {
        showToast('Active tab is not an Archidekt deck page.', false);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // -----------------------------------------------------------
  // Pairings
  // -----------------------------------------------------------

  async function loadPairings() {
    const { pairings = [] } = await chrome.storage.local.get('pairings');
    state.pairings = pairings;
    renderPairings();
  }

  function renderPairings() {
    pairingsBar.innerHTML = '';
    if (!state.pairings.length) {
      pairingsBar.innerHTML = '<span style="font-size: 0.7rem; color: var(--text-subtle);">No saved pairs</span>';
      if (openBulkModalBtn) openBulkModalBtn.style.display = 'none';
      return;
    }
    if (openBulkModalBtn) openBulkModalBtn.style.display = 'inline-flex';

    state.pairings.forEach(p => {
      const chip = document.createElement('div');
      chip.className = 'pairing-chip';
      chip.innerHTML = `
        <span class="chip-label">⚔️ ${escapeHtml(p.name)}</span>
        <span class="chip-delete" title="Delete pairing">&times;</span>
      `;
      chip.querySelector('.chip-label').addEventListener('click', () => {
        manaboxInput.value = p.manaboxUrl;
        archidektInput.value = p.archidektUrl;
        triggerComparison();
      });
      chip.querySelector('.chip-delete').addEventListener('click', async (e) => {
        e.stopPropagation();
        await deletePairing(p);
      });
      pairingsBar.appendChild(chip);
    });
  }

  async function deletePairing(pairing) {
    const ok = confirm(`Remove "${pairing.name}" from your saved deck pairs?`);
    if (!ok) return;

    state.pairings = state.pairings.filter(p => p.id !== pairing.id);
    await chrome.storage.local.set({ pairings: state.pairings });
    renderPairings();
    showToast(`Removed "${pairing.name}"`);
  }

  savePairingBtn.addEventListener('click', async () => {
    const mbUrl = manaboxInput.value.trim();
    const adUrl = archidektInput.value.trim();
    if (!mbUrl || !adUrl) {
      showToast('Enter both deck links first', false);
      return;
    }

    const defaultName = state.comparison ? state.comparison.manabox.name : 'Deck Pair';
    const name = prompt('Enter a nickname for this deck pairing:', defaultName);
    if (!name) return;

    const newPair = {
      id: 'pair-' + Date.now(),
      name,
      manaboxUrl: mbUrl,
      archidektUrl: adUrl
    };

    state.pairings.unshift(newPair);
    await chrome.storage.local.set({ pairings: state.pairings });
    renderPairings();
    showToast(`Saved "${name}"!`);
  });

  // -----------------------------------------------------------
  // Bulk Deck Check & Sync Controller
  // -----------------------------------------------------------

  const bulkState = {
    pairs: [],
    isChecking: false,
    isSyncing: false
  };

  openBulkModalBtn.addEventListener('click', async () => {
    if (!state.pairings.length) {
      showToast('No saved deck pairs yet. Use 💾 Save to add pairings first.', false);
      return;
    }

    bulkState.pairs = state.pairings.map(p => ({
      ...p,
      status: 'idle',
      comparison: null,
      error: null,
      selected: false
    }));

    renderBulkPairsList();
    updateBulkSummaryBanner();
    bulkSyncDialog.showModal();

    // Automatically check all on open
    await runBulkCheck();
  });

  bulkCheckAllBtn.addEventListener('click', async () => {
    if (bulkState.isChecking || bulkState.isSyncing) return;
    await runBulkCheck();
  });

  bulkSelectAllBtn.addEventListener('click', () => {
    bulkState.pairs.forEach(p => {
      if (p.status === 'has_changes') p.selected = true;
    });
    renderBulkPairsList();
    updateBulkSyncButtonState();
  });

  bulkDeselectBtn.addEventListener('click', () => {
    bulkState.pairs.forEach(p => p.selected = false);
    renderBulkPairsList();
    updateBulkSyncButtonState();
  });

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

  bulkSyncSelectedBtn.addEventListener('click', async () => {
    await runBulkSync();
  });

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
      const isCommander = c.boardCategory === 0;
      const imageUrl = c.images && c.images[0] ? (c.images[0].imageUrlNormal || c.images[0].imageUrlSmall) : '';
      const modifier = normalizeModifier(c.variant);
      return {
        index: idx,
        name: c.name || 'Unknown',
        quantity: Number(c.quantity) || 1,
        boardCategory: c.boardCategory,
        category: isCommander ? 'Commander' : 'Mainboard',
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

    return {
      name: rawDeck.name || 'ManaBox Deck',
      format: rawDeck.format || 'Commander',
      totalCards: cards.reduce((sum, c) => sum + c.quantity, 0),
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
      const isCommander = categories.includes('Commander');
      const modifier = normalizeModifier(entry.modifier);

      return {
        relationId: entry.id,
        name: oracleObj.name || cardObj.displayName || 'Unknown',
        quantity: Number(entry.quantity) || 1,
        categories,
        category: isCommander ? 'Commander' : (categories[0] || 'Mainboard'),
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

    return {
      id: String(data.id || deckId),
      name: data.name || 'Archidekt Deck',
      owner: data.owner ? data.owner.username : 'Unknown',
      totalCards: cards.reduce((sum, c) => sum + c.quantity, 0),
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
        // Entire card name missing from Archidekt: ADD
        for (const mb of mbGroup.entries) {
          added.push({
            id: `add-${mb.name}-${mb.setId}-${mb.collectorNumber}-${mb.modifier}`,
            name: mb.name,
            action: 'add',
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

        // 1. Exact match on printing (setId + collectorNumber), modifier (finish), and commander role
        for (let i = remainingMb.length - 1; i >= 0; i--) {
          const mb = remainingMb[i];
          const matchIdx = remainingAd.findIndex(ad =>
            ad.setId === mb.setId &&
            ad.collectorNumber === mb.collectorNumber &&
            ad.modifier === mb.modifier &&
            ad.isCommander === mb.isCommander
          );

          if (matchIdx !== -1) {
            const ad = remainingAd.splice(matchIdx, 1)[0];
            remainingMb.splice(i, 1);

            if (mb.quantity === ad.quantity) {
              inSync.push({
                id: `sync-${mb.name}-${mb.setId}-${mb.collectorNumber}-${mb.modifier}`,
                name: mb.name,
                action: 'sync',
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
                delta: mb.quantity - ad.quantity,
                targetQuantity: mb.quantity,
                manaboxQty: mb.quantity,
                archidektQty: ad.quantity,
                isCommander: mb.isCommander,
                archidektCardId: ad.cardId,
                archidektRelationId: ad.relationId,
                categories: ad.categories,
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

        // 2. Match remaining entries of same card name (Version, collector number, or finish/foil changes)
        while (remainingMb.length > 0 && remainingAd.length > 0) {
          const mb = remainingMb.shift();
          const ad = remainingAd.shift();

          const isVersionChange = mb.setId !== ad.setId || mb.collectorNumber !== ad.collectorNumber;
          const isFinishChange = mb.modifier !== ad.modifier;
          const changeType = isVersionChange ? 'version' : (isFinishChange ? 'finish' : 'version');

          modified.push({
            id: `mod-ver-${ad.relationId}`,
            name: mb.name,
            action: 'modify',
            changeType,
            delta: mb.quantity - ad.quantity,
            targetQuantity: mb.quantity,
            manaboxQty: mb.quantity,
            archidektQty: ad.quantity,
            isCommander: mb.isCommander,
            archidektCardId: ad.cardId,
            archidektRelationId: ad.relationId,
            categories: ad.categories,
            // Target printing & finish:
            setId: mb.setId,
            collectorNumber: mb.collectorNumber,
            modifier: mb.modifier,
            isFoil: mb.isFoil,
            // Previous printing & finish:
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

        // 3. Any leftovers in ManaBox are extra additions
        for (const mb of remainingMb) {
          added.push({
            id: `add-${mb.name}-${mb.setId}-${mb.collectorNumber}-${mb.modifier}`,
            name: mb.name,
            action: 'add',
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

        // 4. Any leftovers in Archidekt are removals
        for (const ad of remainingAd) {
          removed.push({
            id: `rem-${ad.relationId}`,
            name: ad.name,
            action: 'remove',
            delta: -ad.quantity,
            targetQuantity: 0,
            manaboxQty: 0,
            archidektQty: ad.quantity,
            isCommander: ad.isCommander,
            archidektCardId: ad.cardId,
            archidektRelationId: ad.relationId,
            categories: ad.categories,
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
            delta: -ad.quantity,
            targetQuantity: 0,
            manaboxQty: 0,
            archidektQty: ad.quantity,
            isCommander: ad.isCommander,
            archidektCardId: ad.cardId,
            archidektRelationId: ad.relationId,
            categories: ad.categories,
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

  compareBtn.addEventListener('click', async () => {
    await triggerComparison();
  });

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

      if (item.action === 'add') {
        tagLabel = `+${item.targetQuantity}`;
      } else if (item.action === 'remove') {
        tagLabel = `-${item.archidektQty}`;
      } else if (item.action === 'modify') {
        if (item.changeType === 'version') {
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
      if (item.action === 'modify' && (item.changeType === 'version' || item.changeType === 'finish')) {
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
            ${item.isCommander ? '👑 ' : ''}${escapeHtml(item.name)}
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

  selectAllBtn.addEventListener('click', () => {
    if (!state.comparison) return;
    const { added, removed, modified } = state.comparison.changes;
    [...added, ...removed, ...modified].forEach(i => i.selected = true);
    renderChangesList();
  });

  deselectAllBtn.addEventListener('click', () => {
    if (!state.comparison) return;
    const { added, removed, modified } = state.comparison.changes;
    [...added, ...removed, ...modified].forEach(i => i.selected = false);
    renderChangesList();
  });

  // -----------------------------------------------------------
  // Mass Edit Clipboard Copy
  // -----------------------------------------------------------

  copyMassEditBtn.addEventListener('click', async () => {
    if (!state.comparison) return;
    const { added, modified } = state.comparison.changes;

    let text = '';
    const cmdr = [];
    const main = [];

    function formatLine(c) {
      const modSuffix = c.modifier === 'Foil' ? ' *F*' : (c.modifier === 'Etched' ? ' *E*' : '');
      if (c.setId && c.collectorNumber) {
        return `${c.targetQuantity} ${c.name} (${c.setId.toUpperCase()}) ${c.collectorNumber}${modSuffix}`;
      }
      return `${c.targetQuantity} ${c.name}${modSuffix}`;
    }

    for (const c of added) {
      const line = formatLine(c);
      if (c.isCommander) cmdr.push(line);
      else main.push(line);
    }

    for (const c of modified) {
      if (c.targetQuantity > 0) {
        const line = formatLine(c);
        if (c.isCommander) cmdr.push(line);
        else main.push(line);
      }
    }

    if (cmdr.length) text += '# Commander\n' + cmdr.join('\n') + '\n\n';
    if (main.length) text += '# Mainboard\n' + main.join('\n') + '\n';

    await navigator.clipboard.writeText(text.trim());
    showToast('Copied Mass Edit text to clipboard!');
  });

  // -----------------------------------------------------------
  // Direct Sync Execution
  // -----------------------------------------------------------

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

    const versionModifications = modifications.filter(c => c.changeType === 'version' || c.changeType === 'finish');
    const qtyModifications = modifications.filter(c => c.changeType !== 'version' && c.changeType !== 'finish');

    // Cards that require card ID / edition resolution on Archidekt
    const cardsToResolve = [...additions, ...versionModifications];

    const resolvedMap = new Map();

    if (cardsToResolve.length > 0) {
      let editText = '';
      const cmdr = cardsToResolve.filter(c => c.isCommander);
      const main = cardsToResolve.filter(c => !c.isCommander);

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

      mutations.push({
        action: 'add',
        cardid: item.card.id,
        customCardId: null,
        categories: add.isCommander ? ['Commander'] : ['Mainboard'],
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

      mutations.push({
        action: 'modify',
        cardid: item.card.id,
        deckRelationId: mod.archidektRelationId,
        patchId: generateUuid(),
        categories: mod.isCommander ? ['Commander'] : (mod.categories?.length ? mod.categories : ['Mainboard']),
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

    // 3. Quantity Modifications (same printing)
    for (const mod of qtyModifications) {
      if (!mod.archidektRelationId) continue;
      mutations.push({
        action: 'modify',
        cardid: mod.archidektCardId,
        deckRelationId: mod.archidektRelationId,
        patchId: generateUuid(),
        categories: mod.isCommander ? ['Commander'] : (mod.categories?.length ? mod.categories : ['Mainboard']),
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
        categories: ['Mainboard'],
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
});
