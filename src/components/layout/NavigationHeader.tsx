import React, { useEffect, useRef, useState } from 'react';
import {
  MapIcon,
  CustomSearchIcon,
  SavedIcon,
  DashboardIcon,
} from '../common/CustomIcons';
import { Menu, X, UserRound, ShieldCheck, History, Store, Tag, LayoutGrid } from 'lucide-react';
import { useI18n, type StringKey } from '../../i18n';
import { userPrefsService } from '../../services/userPrefsService';
import { usePrefsVersion } from '../../hooks/usePrefsVersion';
import { fashionService } from '../../services/fashionService';
import { getSuggestions, type SearchSuggestion } from '../../utils/search';

export type PortalRole = 'guest' | 'seller' | 'admin';

interface NavigationHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  savedCount: number;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  portalRole: PortalRole;
  onSelectSeller: (sellerId: string) => void;
}

export const DAVAO_CITIES = [
  'All Davao Region',
  'Davao City',
  'Tagum City',
  'Digos City',
  'Panabo City',
  'Mati City',
  'Samal Island',
];

export const NAV_TABS: { id: string; labelKey: StringKey }[] = [
  { id: 'feed', labelKey: 'nav.feed' },
  { id: 'discover', labelKey: 'nav.discover' },
  { id: 'drops', labelKey: 'nav.drops' },
  { id: 'map', labelKey: 'nav.map' },
  { id: 'brands', labelKey: 'nav.brands' },
  { id: 'community', labelKey: 'nav.community' },
  { id: 'saved', labelKey: 'nav.saved' },
  { id: 'dashboard', labelKey: 'nav.dashboard' },
];

/** The portal tab id is shared by the sign-in view, seller dashboard, and admin panel. */
export const PORTAL_TAB_ID = 'dashboard';

export const PORTAL_LABELS: Record<PortalRole, { short: StringKey; long: StringKey }> = {
  guest: { short: 'nav.signIn', long: 'nav.signIn' },
  seller: { short: 'nav.store', long: 'nav.myDashboard' },
  admin: { short: 'nav.admin', long: 'nav.adminPanel' },
};

export const PortalIcon: React.FC<{ role: PortalRole; className?: string }> = ({ role, className = 'w-4 h-4' }) => {
  if (role === 'admin') return <ShieldCheck className={className} />;
  if (role === 'seller') return <DashboardIcon className={className} />;
  return <UserRound className={className} />;
};

const SUGGESTION_ICONS: Record<SearchSuggestion['type'], React.ComponentType<{ className?: string }>> = {
  recent: History,
  seller: Store,
  tag: Tag,
  category: LayoutGrid,
};

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className: string;
  onSelectSeller: (sellerId: string) => void;
  onCommit: () => void;
}

/** Search box with a type-ahead dropdown: recent searches, sellers, tags, and categories. */
const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, placeholder, className, onSelectSeller, onCommit }) => {
  const { t } = useI18n();
  usePrefsVersion();
  const [isFocused, setIsFocused] = useState(false);
  const blurTimer = useRef<number | null>(null);

  useEffect(() => () => { if (blurTimer.current) window.clearTimeout(blurTimer.current); }, []);

  const recent = userPrefsService.getRecentSearches();
  const suggestions = isFocused
    ? getSuggestions(value, fashionService.getProducts(), fashionService.getSellers(), recent)
    : [];

  const pick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'seller' && suggestion.sellerId) {
      userPrefsService.addRecentSearch(suggestion.label);
      onChange('');
      onSelectSeller(suggestion.sellerId);
    } else {
      onChange(suggestion.value);
      userPrefsService.addRecentSearch(suggestion.value);
      onCommit();
    }
    setIsFocused(false);
  };

  const grouped = (['recent', 'seller', 'category', 'tag'] as SearchSuggestion['type'][])
    .map((type) => ({ type, items: suggestions.filter((s) => s.type === type) }))
    .filter((group) => group.items.length > 0);

  const groupLabel: Record<SearchSuggestion['type'], string> = {
    recent: t('search.recent'),
    seller: t('search.sellers'),
    category: t('search.categories'),
    tag: t('search.tags'),
  };

  return (
    <div className="relative w-full">
      <CustomSearchIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#55615D] absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          if (blurTimer.current) window.clearTimeout(blurTimer.current);
          setIsFocused(true);
        }}
        onBlur={() => {
          blurTimer.current = window.setTimeout(() => setIsFocused(false), 150);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            userPrefsService.addRecentSearch(value);
            onCommit();
            setIsFocused(false);
            (e.target as HTMLInputElement).blur();
          }
          if (e.key === 'Escape') setIsFocused(false);
        }}
        aria-label="Search pieces and brands"
        autoComplete="off"
        className={`w-full bg-[#F3ECD8] border border-[#E6DCC0] rounded-full pl-8 sm:pl-9 pr-8 font-sans text-[#1A2225] placeholder:text-[#55615D] focus:outline-none focus:bg-[#FFF9E9] focus:border-[#55615D] transition-all ${className}`}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-[#55615D] hover:text-[#1A2225]"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {isFocused && grouped.length > 0 && (
        <div
          className="absolute left-0 right-0 top-full mt-1.5 bg-[#FFF9E9] border border-[#E6DCC0] rounded-2xl shadow-xl z-50 overflow-hidden max-h-72 overflow-y-auto font-sans"
          onMouseDown={(e) => e.preventDefault()}
        >
          {grouped.map((group) => (
            <div key={group.type} className="py-1.5">
              <div className="flex items-center justify-between px-3.5 pt-1 pb-0.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#55615D]">{groupLabel[group.type]}</span>
                {group.type === 'recent' && (
                  <button type="button" onClick={() => userPrefsService.clearRecentSearches()} className="text-[11px] font-semibold text-[#55615D] hover:text-[#1A2225]">
                    {t('search.clear')}
                  </button>
                )}
              </div>
              {group.items.map((suggestion) => {
                const Icon = SUGGESTION_ICONS[suggestion.type];
                return (
                  <button
                    key={`${suggestion.type}-${suggestion.value}`}
                    type="button"
                    onClick={() => pick(suggestion)}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-sm text-[#1A2225] hover:bg-[#F3ECD8] transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5 text-[#55615D] shrink-0" />
                    <span className="truncate">{suggestion.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedCity,
  setSelectedCity,
  searchQuery,
  setSearchQuery,
  savedCount,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  portalRole,
  onSelectSeller,
}) => {
  const { t } = useI18n();
  const isPortalActive = activeTab === PORTAL_TAB_ID;

  // Searching from a non-feed tab jumps to the feed so results are visible.
  const commitSearch = () => {
    if (activeTab !== 'feed' && activeTab !== 'discover') setActiveTab('feed');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FBF4E4]/95 backdrop-blur-md border-b border-[#E6DCC0] font-sans transition-all">
      {/* Top Ticker Bar (desktop only; phones need the vertical space) */}
      <div className="hidden sm:block bg-[#1A2225] text-[#FFF9E9] text-[11px] py-1.5 px-4 text-center tracking-wide font-medium">
        {t('nav.ticker')}
      </div>

      {/* Main Header: one compact row on phones, logo + nav + actions on larger screens */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center h-12 sm:h-16 lg:h-20 gap-2 sm:gap-6">
          {/* Brand Logo & Region Picker */}
          <div className="flex items-center gap-2 sm:gap-6 shrink-0">
            <button
              onClick={() => setActiveTab('feed')}
              className="text-left focus:outline-none group flex items-center gap-2 shrink-0 cursor-pointer"
              aria-label="Habi home"
            >
              <span className="font-cooper text-xl sm:text-3xl font-bold tracking-tight text-[#1A2225] group-hover:opacity-80 transition-opacity">
                Habi
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-[#FFF9E9] text-[#1A2225] text-[10px] font-avantgarde font-bold tracking-widest uppercase border border-[#E6DCC0]">
                Davao
              </span>
            </button>

            {/* Davao Location Selector Capsule */}
            <div className="hidden sm:flex lg:hidden xl:flex items-center gap-1.5 bg-[#F3ECD8] hover:bg-[#E8DFC6] px-3.5 py-1.5 rounded-full border border-[#E6DCC0] text-xs font-medium transition-colors">
              <MapIcon className="w-3.5 h-3.5 text-[#1A2225] shrink-0" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent text-[#1A2225] font-semibold cursor-pointer focus:outline-none border-none pr-1 text-xs"
              >
                {DAVAO_CITIES.map((city) => (
                  <option key={city} value={city} className="bg-[#FFF9E9] text-[#1A2225]">
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Phone Search: sits inline so the header stays a single 48px row */}
          <div className="flex-1 min-w-0 sm:hidden">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t('search.placeholder')}
              className="h-8 text-xs bg-[#F3ECD8] border-[#E6DCC0]"
              onSelectSeller={onSelectSeller}
              onCommit={commitSearch}
            />
          </div>

          {/* Center Navigation Capsule Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 bg-[#F3ECD8] p-1.5 rounded-full border border-[#E6DCC0] min-w-0 overflow-x-auto scrollbar-none mx-auto">
            {NAV_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 xl:px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#1A2225] text-[#FFF9E9] shadow-sm font-bold'
                      : 'text-[#55615D] hover:text-[#1A2225] hover:bg-[#E8DFC6]'
                  }`}
                >
                  <span>{t(tab.labelKey)}</span>
                  {tab.id === 'saved' && savedCount > 0 && (
                    <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-[#FFF9E9] text-[#1A2225]' : 'bg-[#1A2225] text-[#FFF9E9]'
                    }`}>
                      {savedCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Portal Link, Saved Wishlist */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 shrink-0 sm:ml-auto lg:ml-0">
            {/* Saved Wishlist Button (tablet; phones use the bottom bar) */}
            <button
              onClick={() => setActiveTab('saved')}
              className="hidden sm:flex lg:hidden p-2 text-[#1A2225] hover:text-[#1A2225] relative rounded-full hover:bg-[#F3ECD8] transition-colors cursor-pointer"
              aria-label={t('nav.saved')}
            >
              <SavedIcon className="w-5 h-5" />
              {savedCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#1A2225] text-[#FFF9E9] text-[9px] flex items-center justify-center font-bold">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Portal Link: Sign In / Seller Dashboard / Admin Panel */}
            <button
              onClick={() => setActiveTab(PORTAL_TAB_ID)}
              className={`hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all shadow-sm cursor-pointer ${
                isPortalActive
                  ? 'bg-[#252E31] text-[#FFF9E9] ring-2 ring-[#E6DCC0]'
                  : 'bg-[#1A2225] text-[#FFF9E9] hover:bg-[#252E31]'
              }`}
            >
              <PortalIcon role={portalRole} className="w-3.5 h-3.5" />
              <span>{t(PORTAL_LABELS[portalRole].long)}</span>
            </button>

            {/* Mobile Drawer Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 text-[#1A2225] rounded-full hover:bg-[#F3ECD8] transition-colors focus:outline-none cursor-pointer"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Search Row (tablet and up; kept off the top row so all nav tabs fit) */}
        <div className="hidden sm:block pb-2.5">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t('search.placeholderLong')}
            className="py-2 text-xs bg-[#F3ECD8] border-[#E6DCC0]"
            onSelectSeller={onSelectSeller}
            onCommit={commitSearch}
          />
        </div>
      </div>
    </header>
  );
};
