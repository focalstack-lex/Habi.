import React from 'react';
import { MapIcon } from '../common/CustomIcons';
import { X, ArrowRight, LogOut, Moon, Sun, MonitorSmartphone, Languages } from 'lucide-react';
import {
  DAVAO_CITIES,
  NAV_TABS,
  PORTAL_LABELS,
  PORTAL_TAB_ID,
  PortalIcon,
  type PortalRole,
} from './NavigationHeader';
import { useI18n } from '../../i18n';
import { userPrefsService, type ThemePreference } from '../../services/userPrefsService';
import { usePrefsVersion } from '../../hooks/usePrefsVersion';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  savedCount: number;
  portalRole: PortalRole;
  accountName: string | null;
  onSignOut: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  selectedCity,
  setSelectedCity,
  savedCount,
  portalRole,
  accountName,
  onSignOut,
}) => {
  const { t, lang, setLang } = useI18n();
  usePrefsVersion();

  if (!isOpen) return null;

  const isPortalActive = activeTab === PORTAL_TAB_ID;
  const theme = userPrefsService.getThemePreference();
  const themeOptions: { id: ThemePreference; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
    { id: 'light', icon: Sun, label: t('theme.light') },
    { id: 'dark', icon: Moon, label: t('theme.dark') },
    { id: 'system', icon: MonitorSmartphone, label: t('theme.system') },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden font-sans">
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-xs w-[85%] bg-white shadow-2xl p-5 flex flex-col justify-between gap-5 z-10 rounded-l-3xl overflow-y-auto">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
            <div>
              <span className="font-cooper text-2xl font-bold tracking-tight text-zinc-950 block">
                Habi
              </span>
              <span className="text-xs text-zinc-500 block">
                {t('nav.tagline')}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-zinc-500 hover:text-zinc-900 rounded-full hover:bg-zinc-100 transition-colors"
              aria-label={t('common.close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Location Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              {t('nav.region')}
            </label>
            <div className="flex items-center gap-2 bg-zinc-100 px-3.5 py-2 rounded-full border border-zinc-200/80 text-xs">
              <MapIcon className="w-4 h-4 text-zinc-600 shrink-0" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent text-zinc-900 font-medium cursor-pointer focus:outline-none border-none w-full text-xs"
              >
                {DAVAO_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-2">
              {t('nav.menu')}
            </div>
            {NAV_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-zinc-950 text-white shadow-sm'
                      : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950'
                  }`}
                >
                  <span>{t(tab.labelKey)}</span>
                  {tab.id === 'saved' && savedCount > 0 ? (
                    <span className="px-2 py-0.5 text-xs bg-white text-zinc-950 rounded-full font-bold">
                      {savedCount}
                    </span>
                  ) : (
                    <ArrowRight className="w-4 h-4 opacity-40" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Appearance & Language */}
          <div className="space-y-2.5 pt-1">
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-2">{t('profile.theme')}</div>
            <div className="grid grid-cols-3 gap-1.5">
              {themeOptions.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => userPrefsService.setThemePreference(id)}
                  aria-pressed={theme === id}
                  className={`flex flex-col items-center gap-1 py-2 rounded-2xl border text-[11px] font-semibold ${
                    theme === id ? 'bg-zinc-950 text-white border-zinc-950' : 'bg-zinc-50 text-zinc-700 border-zinc-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 px-1">
              <Languages className="w-4 h-4 text-zinc-500 shrink-0" />
              <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-full flex-1">
                {(['en', 'bis'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setLang(option)}
                    className={`flex-1 px-3 py-1.5 rounded-full text-xs font-semibold ${
                      lang === option ? 'bg-zinc-950 text-white' : 'text-zinc-600'
                    }`}
                  >
                    {option === 'en' ? 'English' : 'Bisaya'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Account / Portal Footer */}
        <div className="pt-4 border-t border-zinc-100 space-y-2">
          {accountName && (
            <div className="px-1 pb-1">
              <div className="text-[11px] font-avantgarde font-bold tracking-wider uppercase text-zinc-500">
                {portalRole === 'admin' ? t('nav.signedInAdmin') : t('nav.signedInSeller')}
              </div>
              <div className="text-sm font-semibold text-zinc-950 truncate">{accountName}</div>
            </div>
          )}

          <button
            onClick={() => {
              setActiveTab(PORTAL_TAB_ID);
              onClose();
            }}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-full text-xs font-semibold shadow-md transition-all ${
              isPortalActive ? 'bg-zinc-800 text-white ring-2 ring-zinc-300' : 'bg-zinc-950 hover:bg-zinc-800 text-white'
            }`}
          >
            <PortalIcon role={portalRole} className="w-4 h-4" />
            <span>
              {portalRole === 'guest'
                ? t('nav.portalGuest')
                : t('nav.openPortal', { label: t(PORTAL_LABELS[portalRole].long) })}
            </span>
          </button>

          {accountName && (
            <button
              onClick={() => {
                onSignOut();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-semibold text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('nav.signOut')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
