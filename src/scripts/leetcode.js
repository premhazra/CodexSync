// ─── LeetCode Content Script ──────────────────────────
// Injected on https://leetcode.com/problems/*
// Detects accepted submissions → sends to background for GitHub push.

import LeetCodeHandler from '../handlers/leetcodeHandler.js';

const leetcode = new LeetCodeHandler();
let lastProcessedUrl = '';
let observer = null;
let urlPollId = null;

console.log('[CodexSync] LeetCode content script loaded on', window.location.href);

/* ─── Show sync toast notification ─────────────────── */
function showSyncToast(title, success = true) {
  // Remove any existing toast
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

  // Inject animation keyframes
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

  // Auto-remove after 4 seconds with slide-out
  setTimeout(() => {
    const inner = toast.firstElementChild;
    if (inner) inner.style.animation = 'codexsync-slide-out 0.4s cubic-bezier(0.16,1,0.3,1) forwards';
    setTimeout(() => toast.remove(), 450);
  }, 4000);
}

/* ─── Guard: is the extension context still valid? ─── */
function isContextValid() {
  try {
    return !!chrome.runtime?.id;
  } catch {
    return false;
  }
}

/* ─── Safe sendMessage wrapper ─────────────────────── */
function safeSendMessage(msg) {
  return new Promise((resolve) => {
    if (!isContextValid()) {
      cleanup();
      resolve(null);
      return;
    }
    try {
      chrome.runtime.sendMessage(msg, (response) => {
        if (chrome.runtime.lastError) {
          console.warn('[CodexSync] sendMessage error:', chrome.runtime.lastError.message);
          resolve(null);
        } else {
          resolve(response);
        }
      });
    } catch (err) {
      console.warn('[CodexSync] sendMessage threw:', err.message);
      cleanup();
      resolve(null);
    }
  });
}

/* ─── Cleanup when context is invalidated ──────────── */
function cleanup() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  if (urlPollId) {
    clearInterval(urlPollId);
    urlPollId = null;
  }
  console.log('[CodexSync] Cleaned up observers.');
}

/* ─── Listen for navigation events from background ─── */
if (isContextValid()) {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!isContextValid()) return;
    if (message.type === 'submission-url-detected') {
      handleSubmission(message.url);
      sendResponse({ ok: true });
    }
  });
}

/* ─── Observe DOM for submission success indicators ── */
function observeResults() {
  if (observer) observer.disconnect();

  observer = new MutationObserver(() => {
    if (!isContextValid()) {
      cleanup();
      return;
    }
    checkForAccepted();
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

/* ─── Check DOM for accepted result ────────────────── */
function isAcceptedVisible() {
  // Method 1: data-e2e-locator (most reliable)
  const successEls = document.querySelectorAll('[data-e2e-locator="submission-result"]');
  for (const el of successEls) {
    if (/accepted/i.test(el.textContent)) return true;
  }

  // Method 2: class-based selectors
  const resultEls = document.querySelectorAll('[class*="success"], [class*="accepted"]');
  for (const el of resultEls) {
    if (/accepted/i.test(el.textContent) && el.closest('[class*="result"], [class*="submission"], [id*="result"]')) return true;
  }

  // Method 3: broad scan for "Accepted" near runtime/memory info
  const allSpans = document.querySelectorAll('span, div');
  for (const el of allSpans) {
    const text = el.textContent.trim();
    if (text === 'Accepted' && el.offsetHeight > 0) return true;
  }

  return false;
}

function checkForAccepted() {
  if (!isAcceptedVisible()) return;
  // Use a composite key: URL + timestamp rounded to 10s to allow re-processing different submissions on same URL
  const key = window.location.href + '::' + Math.floor(Date.now() / 30000);
  if (key === lastProcessedUrl) return;
  lastProcessedUrl = key;
  handleSubmission(window.location.href);
}

/* ─── URL polling for SPA navigation detection ─────── */
function startUrlPolling() {
  let lastUrl = window.location.href;

  urlPollId = setInterval(() => {
    if (!isContextValid()) {
      cleanup();
      return;
    }

    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      console.log('[CodexSync] URL changed:', currentUrl);
      // Check for accepted result after URL changes (with delays)
      setTimeout(() => checkForAccepted(), 2000);
      setTimeout(() => checkForAccepted(), 4000);
      setTimeout(() => checkForAccepted(), 7000);
    }
  }, 1000);
}

/* ─── Process a submission ─────────────────────────── */
async function handleSubmission(url) {
  if (!isContextValid()) return;

  try {
    const settings = await chrome.storage.sync.get(['auto_sync_enabled']);
    if (settings.auto_sync_enabled === false) return;
  } catch (err) {
    console.warn('[CodexSync] Cannot read storage:', err.message);
    return;
  }

  // Strategy 1: get submission ID from URL
  let submissionId = LeetCodeHandler.parseSubmissionId(url);
  if (!submissionId) {
    submissionId = LeetCodeHandler.parseSubmissionId(window.location.href);
  }

  // Strategy 2: get problem slug for fallback lookup
  const slug = LeetCodeHandler.parseProblemSlug(url) || LeetCodeHandler.parseProblemSlug(window.location.href);

  try {
    // Wait for LeetCode to finish rendering
    await new Promise((r) => setTimeout(r, 2000));
    if (!isContextValid()) return;

    let submission = null;

    if (submissionId) {
      console.log('[CodexSync] Fetching by submission ID:', submissionId);
      submission = await leetcode.getSubmission(submissionId);
    }

    // Fallback: query latest accepted submission by slug
    if (!submission && slug) {
      console.log('[CodexSync] No ID in URL, fetching latest accepted for slug:', slug);
      submission = await leetcode.getSubmissionBySlug(slug);
    }

    if (!submission) {
      console.warn('[CodexSync] Could not fetch submission details.');
      return;
    }

    if (!isContextValid()) return;

    console.log('[CodexSync] Sending submission to background:', submission.title);

    const result = await safeSendMessage({
      type: 'push-to-github',
      submission,
      source: 'LeetCode',
    });

    console.log('[CodexSync] Background response:', result);

    // Show toast notification
    if (result?.ok) {
      showSyncToast(submission.title, true);
    } else {
      showSyncToast(submission.title + ' — ' + (result?.error || 'Unknown error'), false);
    }
  } catch (err) {
    if (!isContextValid()) return;
    console.error('[CodexSync] Sync failed:', err);
  }
}

/* ─── Initialize ───────────────────────────────────── */
if (isContextValid()) {
  observeResults();
  startUrlPolling();

  // Check immediately if already on a problem page
  if (window.location.href.includes('/problems/')) {
    setTimeout(() => {
      if (isContextValid()) checkForAccepted();
    }, 3000);
    setTimeout(() => {
      if (isContextValid()) checkForAccepted();
    }, 6000);
  }
}
