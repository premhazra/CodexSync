// ─── GitHub OAuth Callback Content Script ─────────────
// Injected on https://github.com/*
// Detects the OAuth redirect with ?code= and exchanges it for a token.

import GithubHandler from '../handlers/githubHandler.js';

const github = new GithubHandler();

(async function handleOAuthCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const referrer = params.get('referrer');

  // Only process if this is a CodexSync OAuth redirect
  if (!code || referrer !== 'codexsync') return;

  try {
    console.log('[CodexSync] OAuth callback detected, exchanging code…');
    const token = await github.authorize(code);

    if (token) {
      console.log('[CodexSync] GitHub connected successfully.');
      // Clean the URL so the code isn't visible
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      console.error('[CodexSync] Failed to exchange OAuth code.');
    }
  } catch (err) {
    console.error('[CodexSync] OAuth error:', err);
  }
})();
