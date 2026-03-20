// ─── GitHub OAuth Configuration ───────────────────────
// Read credentials from Vite environment variables.
// Keep real values in .env.local (gitignored).

export const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || '';
export const GITHUB_CLIENT_SECRET = import.meta.env.VITE_GITHUB_CLIENT_SECRET || '';
export const GITHUB_REDIRECT_URI = import.meta.env.VITE_GITHUB_REDIRECT_URI || 'https://github.com/?referrer=codexsync';
export const APP_NAME = 'CodexSync';
export const VERSION = '1.0.0';
