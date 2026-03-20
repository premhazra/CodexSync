// ─── GitHub REST API Handler ──────────────────────────
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_REDIRECT_URI } from '../constants.js';

const LANG_TO_EXT = {
  Python: '.py', Python3: '.py', 'C++': '.cpp', CPP: '.cpp', C: '.c',
  Java: '.java', 'C#': '.cs', JavaScript: '.js', Javascript: '.js',
  TypeScript: '.ts', Ruby: '.rb', Swift: '.swift', Go: '.go',
  Kotlin: '.kt', Scala: '.scala', Rust: '.rs', PHP: '.php',
  MySQL: '.sql', 'MS SQL Server': '.sql', Oracle: '.sql', PostgreSQL: '.sql',
  Dart: '.dart', Elixir: '.ex', Erlang: '.erl', Racket: '.rkt',
};

export default class GithubHandler {
  constructor() {
    this.baseUrl = 'https://api.github.com';
    this.accessToken = '';
    this.username = '';
    this.repo = '';
    this.subdirectory = '';
  }

  /* ─── Credential helpers ───────────────────────────── */

  async ensureCredentials() {
    if (this.accessToken && this.username && this.repo) return true;
    const data = await chrome.storage.sync.get([
      'github_codexsync_token',
      'github_username',
      'github_codexsync_repo',
      'github_codexsync_subdirectory',
    ]);
    this.accessToken = data.github_codexsync_token || '';
    this.username = data.github_username || '';
    this.repo = GithubHandler.parseRepoName(data.github_codexsync_repo || '');
    this.subdirectory = data.github_codexsync_subdirectory || '';
    return !!(this.accessToken && this.username && this.repo);
  }

  /**
   * Extract just the repo name from various formats:
   *   'DSA' → 'DSA'
   *   'https://github.com/user/DSA' → 'DSA'
   *   'https://github.com/user/DSA.git' → 'DSA'
   *   'user/DSA' → 'DSA'
   */
  static parseRepoName(raw) {
    if (!raw) return '';
    let name = raw.trim();
    // Strip .git suffix
    name = name.replace(/\.git$/i, '');
    // If it's a full URL, extract last path segment
    try {
      const url = new URL(name);
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length >= 2) return parts[parts.length - 1];
      if (parts.length === 1) return parts[0];
    } catch (_) { /* not a URL */ }
    // If it's 'user/repo' format
    if (name.includes('/')) {
      const parts = name.split('/').filter(Boolean);
      return parts[parts.length - 1] || name;
    }
    return name;
  }

  async loadTokenFromStorage() {
    const data = await chrome.storage.sync.get(['github_codexsync_token']);
    return data.github_codexsync_token || '';
  }

  /* ─── OAuth ────────────────────────────────────────── */

  async authorize(code) {
    const token = await this.fetchAccessToken(code);
    if (!token) return null;
    const user = await this.fetchGithubUser(token);
    if (!user) return null;
    this.accessToken = token;
    this.username = user.login;
    return token;
  }

  async fetchAccessToken(code) {
    const existing = await this.loadTokenFromStorage();
    if (existing) return existing;

    const res = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        code,
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        redirect_uri: GITHUB_REDIRECT_URI,
      }),
    });
    const json = await res.json();
    if (!json.access_token) { chrome.storage.sync.clear(); return null; }

    await chrome.storage.sync.set({ github_codexsync_token: json.access_token });
    return json.access_token;
  }

  async fetchGithubUser(token) {
    const res = await fetch(`${this.baseUrl}/user`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/json',
      },
    });
    const user = await res.json();
    if (!user || user.message === 'Bad credentials') {
      chrome.storage.sync.clear();
      return null;
    }
    await chrome.storage.sync.set({
      github_codexsync_token: token,
      github_username: user.login,
    });
    return user;
  }

  /* ─── Repo helpers ─────────────────────────────────── */

  async checkIfRepoExists(repoName) {
    await this.ensureCredentials();
    const res = await fetch(`${this.baseUrl}/repos/${this.username}/${repoName}`, {
      headers: { Authorization: `token ${this.accessToken}` },
    });
    return res.status === 200;
  }

  async createRepo(repoName) {
    await this.ensureCredentials();
    const res = await fetch(`${this.baseUrl}/user/repos`, {
      method: 'POST',
      headers: {
        Authorization: `token ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: repoName,
        private: false,
        description: 'Solutions synced by CodexSync',
        auto_init: true,
      }),
    });
    return res.json();
  }

  /* ─── Push files ───────────────────────────────────── */

  /**
   * Encode a file path for the GitHub Contents API.
   * Each segment is encoded individually so '/' stays as-is.
   */
  static encodePath(p) {
    return p.split('/').map(encodeURIComponent).join('/');
  }

  async upload(filePath, fileName, content, commitMsg) {
    await this.ensureCredentials();
    const fullPath = this.subdirectory
      ? `${this.subdirectory}/${filePath}/${fileName}`
      : `${filePath}/${fileName}`;

    const encodedPath = GithubHandler.encodePath(fullPath);
    const apiUrl = `${this.baseUrl}/repos/${this.username}/${this.repo}/contents/${encodedPath}`;

    console.log('[CodexSync] Upload URL:', apiUrl);

    // Check if file exists (for updating via SHA)
    let sha = null;
    const checkRes = await fetch(apiUrl, {
      headers: { Authorization: `token ${this.accessToken}` },
    });
    if (checkRes.ok) {
      const existing = await checkRes.json();
      sha = existing.sha;
    }

    const body = {
      message: commitMsg,
      content: btoa(unescape(encodeURIComponent(content))),
      ...(sha && { sha }),
    };

    const res = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        Authorization: `token ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  /* ─── Submit a solved problem ──────────────────────── */

  async submit(submission, source = 'LeetCode') {
    await this.ensureCredentials();
    if (!this.accessToken || !this.repo) {
      console.warn('[CodexSync] Missing credentials, skipping push.');
      return null;
    }

    const ext = LANG_TO_EXT[submission.language] || '.txt';
    const slug = submission.titleSlug || submission.title.toLowerCase().replace(/\s+/g, '-');
    const folderName = `${source}/${slug}`;
    const fileName = `solution${ext}`;
    const commitMsg = `[${source}] Add ${submission.title} (${submission.difficulty || 'Unknown'})`;

    const header = [
      `// Problem: ${submission.title}`,
      `// Difficulty: ${submission.difficulty || 'N/A'}`,
      `// Source: ${source}`,
      `// Language: ${submission.language}`,
      `// Synced by CodexSync`,
      '',
    ].join('\n');

    const content = header + (submission.code || '');

    const result = await this.upload(folderName, fileName, content, commitMsg);

    // Save to sync history
    await this.saveSyncHistory({
      title: submission.title,
      source,
      difficulty: submission.difficulty || 'Unknown',
      language: submission.language,
      timestamp: Date.now(),
      status: result?.content ? 'success' : 'failed',
    });

    return result;
  }

  /* ─── Sync history (chrome.storage.local) ──────────── */

  async saveSyncHistory(entry) {
    const data = await chrome.storage.local.get(['sync_history']);
    const history = data.sync_history || [];
    history.unshift(entry);
    if (history.length > 50) history.length = 50;
    await chrome.storage.local.set({ sync_history: history });
  }
}
