// ─── GeeksforGeeks DOM-based Handler ──────────────────

export default class GeeksforGeeksHandler {
  /**
   * Extract the problem slug from the current URL.
   */
  getProblemSlug() {
    const match = window.location.pathname.match(/\/problems\/([^/]+)/);
    return match ? match[1] : '';
  }

  /**
   * Get the problem title from the DOM.
   */
  getTitle() {
    // Try various GFG title selectors (class names change often)
    const selectors = [
      '.problems_header_content__title__L2cB2',
      '[class*="problems_header"] [class*="title"]',
      'h3.problem-tab-title',
      '.problem-statement h2',
      '.problem-tab-title',
      'h2',
      'h3',
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && el.textContent.trim().length > 1) return el.textContent.trim();
    }
    // Fallback: prettify slug
    const slug = this.getProblemSlug();
    return slug.replace(/[-_]+/g, ' ').replace(/\d+$/, '').trim() || slug;
  }

  /**
   * Get the difficulty badge text.
   */
  getDifficulty() {
    const selectors = [
      '[class*="problems_header"] [class*="badge"]',
      '.problems_header_description__t_8PB .badge',
      '.problem-tab-difficulty',
      '.difficulty-badge',
      '[class*="difficulty"]',
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        const text = el.textContent.trim();
        if (/easy|medium|hard|basic/i.test(text)) return text;
      }
    }
    // Broad scan: look for difficulty keywords in any small badge-like element
    const allEls = document.querySelectorAll('span, div, p');
    for (const el of allEls) {
      const t = el.textContent.trim();
      if (t.length < 12 && /^(Easy|Medium|Hard|Basic|School)$/i.test(t)) return t;
    }
    return 'Unknown';
  }

  /**
   * Get the currently selected language from the editor dropdown.
   */
  getSelectedLanguage() {
    const selectors = [
      '.ant-select-selection-item',
      '[class*="language"] .ant-select-selection-item',
      '.language-selector .selected',
      '[class*="languageDropdown"]',
      'select[class*="lang"]',
      '[class*="lang"] [class*="select"]',
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && el.textContent.trim().length > 0) return el.textContent.trim();
    }
    // Fallback: check for common language buttons/tabs with active state
    const tabs = document.querySelectorAll('[class*="active"], [class*="selected"]');
    for (const tab of tabs) {
      const t = tab.textContent.trim();
      if (/^(C\+\+|Java|Python|Python3|C|C#|JavaScript|Go|Kotlin|PHP|Ruby)$/i.test(t)) return t;
    }
    return 'Unknown';
  }

  /**
   * Get the code from the CodeMirror / Monaco editor.
   */
  getCode() {
    // Try CodeMirror 5
    const cm = document.querySelector('.CodeMirror');
    if (cm && cm.CodeMirror) return cm.CodeMirror.getValue();

    // Try Monaco editor
    if (window.monaco?.editor) {
      const models = window.monaco.editor.getModels();
      if (models && models.length > 0) return models[0].getValue();
    }
    const monacoEl = document.querySelector('.monaco-editor');
    if (monacoEl) {
      const lines = monacoEl.querySelectorAll('.view-line');
      if (lines.length > 0) return Array.from(lines).map((l) => l.textContent).join('\n');
    }

    // Try CodeMirror 6
    const cm6 = document.querySelector('.cm-editor .cm-content');
    if (cm6) return cm6.textContent;

    // Try Ace editor
    const ace = document.querySelector('.ace_content');
    if (ace) {
      const aceLines = ace.querySelectorAll('.ace_line');
      if (aceLines.length > 0) return Array.from(aceLines).map((l) => l.textContent).join('\n');
    }

    // Fallback: any visible code lines
    const lines = document.querySelectorAll('.view-line');
    if (lines.length > 0) return Array.from(lines).map((l) => l.textContent).join('\n');

    return '';
  }

  /**
   * Check if the visible result indicates accepted / correct.
   */
  isSubmissionAccepted() {
    // Broad text scan: look for "Problem Solved Successfully" or "Correct" anywhere visible
    const body = document.body.innerText || '';
    if (/problem solved successfully/i.test(body)) return true;

    // Check specific containers
    const selectors = [
      '[class*="problems_content"] [class*="result"]',
      '[class*="correct"]',
      '.problems_content__2xxaQ .result',
      '.status-column .text-success',
      '.compile_output__hzDkz',
      '[class*="compile_output"]',
      '[class*="success"]',
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && /correct|accepted|success|solved/i.test(el.textContent)) return true;
    }

    return false;
  }

  /**
   * Build a normalized submission object.
   */
  getSubmission() {
    if (!this.isSubmissionAccepted()) return null;

    return {
      title: this.getTitle(),
      titleSlug: this.getProblemSlug(),
      difficulty: this.getDifficulty(),
      language: this.getSelectedLanguage(),
      code: this.getCode(),
      timestamp: Date.now(),
    };
  }
}
