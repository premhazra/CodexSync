// ─── GeeksforGeeks Content Script ─────────────────────
// Injected on geeksforgeeks.org/problems/*
// Detects accepted submissions → sends to background for GitHub push.

import GeeksforGeeksHandler from '../handlers/geeksforgeeksHandler.js';

const gfg = new GeeksforGeeksHandler();
let lastProcessedSlug = '';

console.log('[CodexSync] GFG content script loaded on', window.location.href);

/* ─── Show sync toast notification ─────────────────── */
function showSyncToast(title, success = true) {
  const old = document.getElementById('codexsync-toast');
  if (old) old.remove();

  const toast = document.createElement('div');
  toast.id = 'codexsync-toast';
  toast.innerHTML = `
    <div style="
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 22px;
      border-radius: 12px;
      background: ${success ? 'linear-gradient(135deg, #065f46, #047857)' : 'linear-gradient(135deg, #7f1d1d, #991b1b)'};
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px ${success ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'};
      backdrop-filter: blur(8px);
      animation: codexsync-slide-in 0.4s cubic-bezier(0.16,1,0.3,1);
      pointer-events: none;
    ">
      <span style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: ${success ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'};
        flex-shrink: 0;
      ">
        ${success
          ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
          : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
        }
      </span>
      <div>
        <div style="font-weight: 600; margin-bottom: 2px;">
          ${success ? 'Synced to GitHub ✓' : 'Sync Failed ✗'}
        </div>
        <div style="font-size: 12px; opacity: 0.85;">${title}</div>
      </div>
      <img src="${chrome.runtime.getURL('logo192.png')}" style="width:22px;height:22px;border-radius:4px;margin-left:6px;" onerror="this.style.display='none'" />
    </div>
  `;

  if (!document.getElementById('codexsync-toast-style')) {
    const style = document.createElement('style');
    style.id = 'codexsync-toast-style';
    style.textContent = `
      @keyframes codexsync-slide-in {
        from { transform: translateX(120%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes codexsync-slide-out {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(120%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);

  setTimeout(() => {
    const inner = toast.firstElementChild;
    if (inner) inner.style.animation = 'codexsync-slide-out 0.4s cubic-bezier(0.16,1,0.3,1) forwards';
    setTimeout(() => toast.remove(), 450);
  }, 4000);
}

/* ─── Try to detect and sync an accepted submission ── */
function checkForAccepted() {
  if (gfg.isSubmissionAccepted()) {
    const slug = gfg.getProblemSlug();
    if (slug && slug !== lastProcessedSlug) {
      console.log('[CodexSync] Accepted submission detected:', slug);
      lastProcessedSlug = slug;
      handleSubmission();
    }
  }
}

/* ─── Observe DOM for submission results ───────────── */
function observeResults() {
  const observer = new MutationObserver(() => checkForAccepted());
  observer.observe(document.body, { childList: true, subtree: true });
}

/* ─── Hook into Submit button clicks ─────────────── */
function hookSubmitButton() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const text = btn.textContent.trim().toLowerCase();
    if (text.includes('submit') || text.includes('compile & run')) {
      console.log('[CodexSync] Submit button clicked, will check result...');
      setTimeout(checkForAccepted, 3000);
      setTimeout(checkForAccepted, 5000);
      setTimeout(checkForAccepted, 8000);
      setTimeout(checkForAccepted, 12000);
    }
  }, true);
}

/* ─── Process a submission ─────────────────────────── */
async function handleSubmission() {
  const settings = await chrome.storage.sync.get(['auto_sync_enabled']);
  if (settings.auto_sync_enabled === false) return;

  try {
    await new Promise((r) => setTimeout(r, 2000));

    const submission = gfg.getSubmission();
    if (!submission) {
      console.warn('[CodexSync] isSubmissionAccepted() was true but getSubmission() returned null');
      return;
    }

    console.log('[CodexSync] Sending to background:', submission.title, submission.language);

    // Send to background service worker (which has host_permissions for api.github.com)
    const result = await chrome.runtime.sendMessage({
      type: 'push-to-github',
      submission,
      source: 'GeeksforGeeks',
    });

    console.log('[CodexSync] Background response:', result);

    // Show toast notification
    if (result?.ok) {
      showSyncToast(submission.title, true);
    } else {
      showSyncToast(submission.title + ' — ' + (result?.error || 'Unknown error'), false);
    }
  } catch (err) {
    console.error('[CodexSync] GFG sync failed:', err);
  }
}

/* ─── Initialize ───────────────────────────────────── */
observeResults();
hookSubmitButton();
setTimeout(checkForAccepted, 1000);
setTimeout(checkForAccepted, 3000);
