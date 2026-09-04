import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './InstallPrompt.css';

const DISMISS_KEY = 'pwaInstallPromptDismissedAt';
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // don't re-nag for a week
const NATIVE_PROMPT_WAIT_MS = 4000; // give the browser a chance to fire beforeinstallprompt

const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches ||
  window.navigator.standalone === true;

const ua = () => window.navigator.userAgent || '';
const isIos = () => /iphone|ipad|ipod/i.test(ua());
const isBrave = () => !!navigator.brave;
const isEdge = () => /edg\//i.test(ua());
const isFirefox = () => /firefox/i.test(ua());
const isSafari = () => /safari/i.test(ua()) && !/chrome|chromium|crios/i.test(ua());

// Chromium-based browsers (Chrome, Brave, Edge...) sometimes never fire
// `beforeinstallprompt` — e.g. Brave disables it by default unless the user
// flips "Shortcuts not Apps" off in brave://flags. When that happens we fall
// back to per-browser manual instructions instead of leaving no way to install.
const getManualInstructions = () => {
  if (isIos()) return { steps: ['Tap the Share icon in the toolbar.', 'Choose "Add to Home Screen".'] };
  if (isBrave()) {
    return {
      steps: [
        'Open the Brave menu (☰) in the toolbar.',
        'Choose "Install [app name]…" (or enable it via brave://flags → "Shortcuts not Apps" → Disabled, then relaunch).',
      ],
    };
  }
  if (isFirefox()) {
    return { steps: ["Firefox desktop doesn't support installing this app — try Chrome, Edge, or your phone's browser."] };
  }
  if (isSafari()) {
    return { steps: ['Open the File menu and choose "Add to Dock" (Safari 17+), or use Share > Add to Home Screen on iPhone/iPad.'] };
  }
  if (isEdge()) return { steps: ['Click the "•••" menu in the toolbar, then choose "Apps" > "Install this site as an app".'] };
  return { steps: ['Step 1: Click on the 3 dots (⋮) menu in the top right.', 'Step 2: Select the "Install or Add shortcut" option.'] };
};

/**
 * Custom "Install app" banner (replaces the default browser install UI).
 * - Chrome/Edge/Android: captures `beforeinstallprompt` and triggers the
 *   real native install flow from our own button.
 * - iOS Safari / Brave (when its "Shortcuts not Apps" flag blocks the event)
 *   / other browsers without the API: shows the same banner with manual,
 *   per-browser "how to install" steps instead.
 */
function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [manualSteps, setManualSteps] = useState(null);

  useEffect(() => {
    if (isStandalone()) return; // already installed

    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (Date.now() - dismissedAt < DISMISS_COOLDOWN_MS) return;

    if (isIos()) {
      setVisible(true);
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setManualSteps(null);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleInstalled = () => {
      setVisible(false);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', handleInstalled);

    // No native prompt after a few seconds -> browser doesn't support/allow
    // it right now, so still offer the banner with manual instructions.
    const fallbackTimer = setTimeout(() => {
      // Still show the banner with the normal "Install app" button even if no
      // native prompt arrived — instructions only appear if the button click
      // itself can't trigger a real install (see handleInstallClick).
      setVisible(true);
    }, NATIVE_PROMPT_WAIT_MS);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setManualSteps(getManualInstructions());
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted' || outcome === 'dismissed') {
      setDeferredPrompt(null);
      setVisible(false);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="install-prompt"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-label="Install app"
        >
          <div className="install-prompt-row">
            <img src="/pwa-512x512.png" alt="Room 305" className="install-prompt-icon" />

            <div className="install-prompt-text">
              <h3>Install Room 305</h3>
              <p>Add Room 305 to your device for faster access and a full-screen app experience.</p>
            </div>
          </div>

          {manualSteps ? (
            <div className="install-prompt-manual-steps">
              <ol>
                {manualSteps.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <button type="button" className="install-prompt-dismiss-btn" onClick={dismiss}>
                Got it
              </button>
            </div>
          ) : (
            <div className="install-prompt-actions">
              <button type="button" className="install-prompt-install-btn" onClick={handleInstallClick}>
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Install app
              </button>
              <button type="button" className="install-prompt-dismiss-btn" onClick={dismiss}>
                Dismiss
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default InstallPrompt;
