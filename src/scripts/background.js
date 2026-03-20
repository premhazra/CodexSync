// ─── Background Service Worker (Manifest V3) ─────────
// All GitHub API calls MUST go through here (content scripts can't due to CORS).

import GithubHandler from '../handlers/githubHandler.js';

const github = new GithubHandler();

/* ─── Listen for tab URL submissions (LeetCode) ───── */
chrome.webNavigation?.onCompleted?.addListener(
  (details) => {
    if (details.url.includes('/submissions/')) {
      chrome.tabs.sendMessage(details.tabId, {
        type: 'submission-url-detected',
        url: details.url,
      }).catch(() => {});
    }
  },
  { url: [{ urlContains: 'leetcode.com/problems/' }] }
);

/* ─── Cookie change listener (LeetCode session) ───── */
chrome.cookies?.onChanged?.addListener((changeInfo) => {
  if (
    changeInfo.cookie.domain.includes('leetcode.com') &&
    changeInfo.cookie.name === 'LEETCODE_SESSION' &&
    !changeInfo.removed
  ) {
    chrome.storage.sync.set({ leetcode_authenticated: true });
  }
});

/* ─── Push submission to GitHub (called by content scripts) ── */
async function pushToGithub(submission, source) {
  try {
    const ready = await github.ensureCredentials();
    if (!ready) {
      console.warn('[CodexSync BG] GitHub credentials not set.');
      return { ok: false, error: 'No credentials' };
    }

    console.log('[CodexSync BG] Pushing:', submission.title, '(', source, ')');
    const result = await github.submit(submission, source);
    const success = !!result?.content;

    console.log('[CodexSync BG]', success ? 'Success:' : 'Failed:', result?.content?.html_url || JSON.stringify(result));

    // Track solved problems for streak counting
    const data = await chrome.storage.local.get(['problems_solved']);
    const problems = data.problems_solved || [];
    problems.push({ title: submission.title, timestamp: submission.timestamp || Date.now() });
    await chrome.storage.local.set({ problems_solved: problems });

    // Notify popup
    chrome.runtime.sendMessage({
      type: 'sync-status-update',
      data: { title: submission.title, status: success ? 'success' : 'failed' },
    }).catch(() => {});

    return { ok: success, url: result?.content?.html_url };
  } catch (err) {
    console.error('[CodexSync BG] Push failed:', err);
    return { ok: false, error: err.message };
  }
}

/* ─── Message handler ──────────────────────────────── */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Content scripts send submissions here for GitHub push
  if (message.type === 'push-to-github') {
    (async () => {
      try {
        const result = await pushToGithub(message.submission, message.source);
        sendResponse(result);
      } catch (err) {
        console.error('[CodexSync BG] push-to-github handler error:', err);
        sendResponse({ ok: false, error: err.message });
      }
    })();
    return true; // keep channel open for async sendResponse
  }

  if (message.type === 'sync-complete') {
    chrome.runtime.sendMessage({ type: 'sync-status-update', data: message.data }).catch(() => {});
    sendResponse({ ok: true });
    return false;
  }

  if (message.type === 'get-cookie') {
    chrome.cookies.get(
      { url: message.url, name: message.name },
      (cookie) => sendResponse({ value: cookie?.value || null })
    );
    return true; // async
  }

  if (message.type === 'open-tab') {
    chrome.tabs.create({ url: message.url });
    sendResponse({ ok: true });
    return false;
  }

  // Unhandled message type — do NOT return true
  return false;
});

/* ─── Install / Update notification ────────────────── */
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[CodexSync] Extension installed.');
  } else if (details.reason === 'update') {
    console.log('[CodexSync] Extension updated to', chrome.runtime.getManifest().version);
  }
});
