import { useEffect, useState } from 'react';

const preference = 'the_eyes_install_invite_dismissed';
const standalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

export default function InstallInvite() {
  const [installed, setInstalled] = useState(standalone);
  const [expanded, setExpanded] = useState(() => !localStorage.getItem(preference));
  const [prompt, setPrompt] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    function onPrompt(event) {
      event.preventDefault();
      setPrompt(event);
      setShowHelp(false);
    }
    function onInstall() {
      localStorage.setItem(preference, '1');
      setInstalled(true);
      setPrompt(null);
    }
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstall);
    };
  }, []);

  function dismiss() {
    localStorage.setItem(preference, '1');
    setExpanded(false);
    setShowHelp(false);
  }

  async function install() {
    if (!prompt) {
      setExpanded(true);
      setShowHelp(true);
      return;
    }
    setPrompt(null);
    try {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') setInstalled(true);
      dismiss();
    } catch {
      setExpanded(true);
      setShowHelp(true);
    }
  }

  if (installed) return null;
  if (!expanded) return <button onClick={install} className="mb-2 text-xs underline font-bold">Install The Eyes</button>;

  const appleMobile = /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  return (
    <aside aria-label="Install The Eyes" className="mx-auto mb-4 max-w-4xl flex flex-wrap items-center gap-3 rounded-lg border-2 border-black bg-white p-3 text-black dark:border-white dark:bg-black dark:text-white">
      <p className="flex-1 min-w-44 text-sm font-bold">{showHelp
        ? (appleMobile ? 'In Safari, tap Share, then Add to Home Screen.' :
          'Open your browser menu and look for Install app or Add to Home Screen. Availability depends on your browser.')
        : 'Add The Eyes to your home screen for quick access.'}</p>
      {!showHelp && <button onClick={install} className="rounded border-2 border-black bg-[#FFE600] px-3 py-2 text-sm font-bold text-black">Install The Eyes</button>}
      <button onClick={dismiss} className="px-2 py-2 text-sm underline">{showHelp ? 'Got it' : 'Not now'}</button>
    </aside>
  );
}
