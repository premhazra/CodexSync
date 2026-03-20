// ─── Popup (main page — state machine) ────────────────

import { useState, useEffect } from 'react';
import WelcomeScreen from '../components/WelcomeScreen.jsx';
import AuthGithub from '../components/AuthGithub.jsx';
import AuthLeetCode from '../components/AuthLeetCode.jsx';
import SelectRepo from '../components/SelectRepo.jsx';
import Dashboard from '../components/Dashboard.jsx';
import SettingsPanel from '../components/SettingsPanel.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const VIEWS = {
  LOADING: 'loading',
  WELCOME: 'welcome',
  AUTH_GITHUB: 'auth_github',
  AUTH_LEETCODE: 'auth_leetcode',
  SELECT_REPO: 'select_repo',
  DASHBOARD: 'dashboard',
  SETTINGS: 'settings',
};

export default function Popup() {
  const [view, setView] = useState(VIEWS.LOADING);
  const [error, setError] = useState('');

  useEffect(() => {
    determineInitialView();
  }, []);

  async function determineInitialView() {
    try {
      const data = await chrome.storage.sync.get([
        'github_codexsync_token',
        'github_codexsync_repo',
        'onboarding_complete',
      ]);

      if (data.onboarding_complete && data.github_codexsync_token && data.github_codexsync_repo) {
        setView(VIEWS.DASHBOARD);
      } else if (data.github_codexsync_token && !data.github_codexsync_repo) {
        setView(VIEWS.SELECT_REPO);
      } else if (data.github_codexsync_token) {
        setView(VIEWS.AUTH_LEETCODE);
      } else {
        setView(VIEWS.WELCOME);
      }
    } catch (err) {
      setError('Failed to load settings.');
      setView(VIEWS.WELCOME);
    }
  }

  function finishOnboarding() {
    chrome.storage.sync.set({ onboarding_complete: true });
    setView(VIEWS.DASHBOARD);
  }

  function handleReset() {
    setView(VIEWS.WELCOME);
  }

  // ─── Loading spinner ───────────────────────────────
  if (view === VIEWS.LOADING) {
    return (
      <div className="flex items-center justify-center min-h-[520px]">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative">
      <ErrorMessage message={error} onDismiss={() => setError('')} />

      {view === VIEWS.WELCOME && (
        <WelcomeScreen onGetStarted={() => setView(VIEWS.AUTH_GITHUB)} />
      )}

      {view === VIEWS.AUTH_GITHUB && (
        <AuthGithub onComplete={() => setView(VIEWS.AUTH_LEETCODE)} />
      )}

      {view === VIEWS.AUTH_LEETCODE && (
        <AuthLeetCode onComplete={() => setView(VIEWS.SELECT_REPO)} />
      )}

      {view === VIEWS.SELECT_REPO && (
        <SelectRepo onComplete={finishOnboarding} />
      )}

      {view === VIEWS.DASHBOARD && (
        <Dashboard onOpenSettings={() => setView(VIEWS.SETTINGS)} />
      )}

      {view === VIEWS.SETTINGS && (
        <SettingsPanel
          onClose={() => setView(VIEWS.DASHBOARD)}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
