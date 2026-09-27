import React, { useEffect, useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { userPrefsService } from '../../services/userPrefsService';
import { usePrefsVersion } from '../../hooks/usePrefsVersion';
import { useI18n } from '../../i18n';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isStandalone(): boolean {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/**
 * Add-to-home-screen prompt. Chrome and Edge hand us `beforeinstallprompt`;
 * iOS Safari has no API, so it gets the manual Share hint instead.
 */
export const InstallBanner: React.FC = () => {
  const { t } = useI18n();
  usePrefsVersion();
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    if (isStandalone() || userPrefsService.isInstallDismissed()) return;

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);

    // iOS never fires the event: show the hint after a short delay on the second visit or later.
    const visits = Number(sessionStorage.getItem('habi_visits') ?? '0') + 1;
    sessionStorage.setItem('habi_visits', String(visits));
    const timer = window.setTimeout(() => {
      if (isIos() && !isStandalone()) setShowIosHint(true);
    }, 6000);

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.clearTimeout(timer);
    };
  }, []);

  if (userPrefsService.isInstallDismissed() || isStandalone()) return null;
  if (!promptEvent && !showIosHint) return null;

  const dismiss = () => {
    userPrefsService.dismissInstall();
    setPromptEvent(null);
    setShowIosHint(false);
  };

  const install = async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === 'accepted') userPrefsService.dismissInstall();
    setPromptEvent(null);
  };

  return (
    <div className="fixed bottom-[84px] lg:bottom-6 left-3 right-3 lg:left-auto lg:right-6 lg:w-96 z-30 font-sans">
      <div className="bg-zinc-950 text-white rounded-2xl shadow-2xl border border-zinc-800 p-3.5 sm:p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-white text-zinc-950 flex items-center justify-center font-cooper font-bold text-lg shrink-0">
          H
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="text-sm font-semibold leading-tight">{t('pwa.title')}</div>
          <p className="text-[11px] text-zinc-400 leading-snug">{promptEvent ? t('pwa.body') : t('pwa.iosHint')}</p>
          <div className="flex items-center gap-2 pt-1.5">
            {promptEvent ? (
              <button type="button" onClick={install} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-zinc-950 rounded-full text-xs font-semibold hover:bg-zinc-200">
                <Download className="w-3.5 h-3.5" />
                <span>{t('pwa.install')}</span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-[11px] font-semibold">
                <Share className="w-3.5 h-3.5" />
                <span>Share, then Add to Home Screen</span>
              </span>
            )}
            <button type="button" onClick={dismiss} className="px-3 py-1.5 rounded-full text-xs font-semibold text-zinc-300 hover:text-white">
              {t('pwa.later')}
            </button>
          </div>
        </div>
        <button type="button" onClick={dismiss} aria-label={t('common.close')} className="p-1 text-zinc-400 hover:text-white shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
