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
        className="fixed inset-0 bg-[#1A2225]/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-xs w-[85%] bg-[#FBF4E4] border-l border-[#E6DCC0] shadow-2xl p-5 flex flex-col justify-between gap-5 z-10 rounded-l-3xl overflow-y-auto">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E6DCC0]">
            <div>
              <span className="font-outfit text-2xl font-bold tracking-tight text-[#1A2225] block">
                Habi
              </span>
              <span className="text-xs text-[#55615D] block">
                {t('nav.tagline')}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#55615D] hover:text-[#1A2225] rounded-full hover:bg-[#F3ECD8] transition-colors"
              aria-label={t('common.close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Location Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#55615D] uppercase tracking-wider">
              {t('nav.region')}
            </label>
            <div className="flex items-center gap-2 bg-[#FFF9E9] px-3.5 py-2 rounded-full border border-[#E6DCC0] text-xs">
              <MapIcon className="w-4 h-4 text-[#1A2225] shrink-0" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent text-[#1A2225] font-medium cursor-pointer focus:outline-none border-none w-full text-xs"
              >
                {DAVAO_CITIES.map((city) => (
                  <option key={city} value={city} className="bg-[#FFF9E9] text-[#1A2225]">
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <div className="text-xs font-semibold text-[#55615D] uppercase tracking-wider mb-2 px-2">
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
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1A2225] text-[#FFF9E9] shadow-sm'
                      : 'text-[#1A2225]/80 hover:bg-[#F3ECD8] hover:text-[#1A2225]'
                  }`}
                >
                  <span>{t(tab.labelKey)}</span>
                  {tab.id === 'saved' && savedCount > 0 ? (
                    <span className="px-2 py-0.5 text-xs bg-[#FFF9E9] text-[#1A2225] rounded-full font-bold">
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
            <div className="text-xs font-semibold text-[#55615D] uppercase tracking-wider px-2">{t('profile.theme')}</div>
            <div className="grid grid-cols-3 gap-1.5">
              {themeOptions.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => userPrefsService.setThemePreference(id)}
                  aria-pressed={theme === id}
                  className={`flex flex-col items-center gap-1 py-2 rounded-2xl border text-[11px] font-semibold cursor-pointer ${
                    theme === id ? 'bg-[#1A2225] text-[#FFF9E9] border-[#1A2225]' : 'bg-[#FFF9E9] text-[#1A2225] border-[#E6DCC0]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 px-1">
              <Languages className="w-4 h-4 text-[#55615D] shrink-0" />
              <div className="flex items-center gap-1 p-1 bg-[#F3ECD8] rounded-full flex-1 border border-[#E6DCC0]">
                {(['en', 'bis'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setLang(option)}
                    className={`flex-1 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${
                      lang === option ? 'bg-[#1A2225] text-[#FFF9E9]' : 'text-[#55615D]'
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
        <div className="pt-4 border-t border-[#E6DCC0] space-y-2">
          {accountName && (
            <div className="px-1 pb-1">
              <div className="text-[11px] font-avantgarde font-bold tracking-wider uppercase text-[#55615D]">
                {portalRole === 'admin' ? t('nav.signedInAdmin') : t('nav.signedInSeller')}
              </div>
              <div className="text-sm font-semibold text-[#1A2225] truncate">{accountName}</div>
            </div>
          )}

          <button
            onClick={() => {
              setActiveTab(PORTAL_TAB_ID);
              onClose();
            }}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-full text-xs font-semibold shadow-md transition-all cursor-pointer ${
              isPortalActive ? 'bg-[#252E31] text-[#FFF9E9] ring-2 ring-[#E6DCC0]' : 'bg-[#1A2225] hover:bg-[#252E31] text-[#FFF9E9]'
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
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-semibold text-[#55615D] hover:text-[#1A2225] hover:bg-[#F3ECD8] transition-all cursor-pointer"
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
