import React from 'react';
import { Search, MapPin, Bookmark, Store, Menu, X } from 'lucide-react';

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

export const NAV_TABS = [
  { id: 'feed', label: 'Feed' },
  { id: 'discover', label: 'Discover' },
  { id: 'drops', label: 'Drops' },
  { id: 'map', label: 'Map' },
  { id: 'brands', label: 'Brands' },
  { id: 'community', label: 'Community' },
  { id: 'saved', label: 'Saved' },
  { id: 'dashboard', label: 'Dashboard' },
];

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
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-100 font-sans transition-all">
      {/* Top Ticker Bar */}
      <div className="bg-zinc-950 text-white text-[11px] py-1.5 px-4 text-center tracking-wide font-medium">
        Discover Local Fashion • Davao Region, Philippines
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4 sm:gap-6">
          {/* Brand Logo & Region Picker */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => setActiveTab('feed')}
              className="text-left focus:outline-none group flex items-center gap-2"
            >
              <span className="font-outfit text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 group-hover:opacity-80 transition-opacity">
                Habi
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-[10px] font-semibold tracking-wide">
                Davao
              </span>
            </button>

            {/* Davao Location Selector Capsule */}
            <div className="hidden sm:flex items-center gap-1.5 bg-zinc-100/80 hover:bg-zinc-200/80 px-3.5 py-1.5 rounded-full border border-zinc-200/60 text-xs font-medium transition-colors">
              <MapPin className="w-3.5 h-3.5 text-zinc-800 shrink-0" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent text-zinc-900 font-semibold cursor-pointer focus:outline-none border-none pr-1 text-xs"
              >
                {DAVAO_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Center Navigation Capsule Links */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-zinc-100/70 p-1.5 rounded-full border border-zinc-200/50">
            {NAV_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-zinc-950 text-white shadow-sm'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.id === 'saved' && savedCount > 0 && (
                    <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white text-zinc-950' : 'bg-zinc-900 text-white'
                    }`}>
                      {savedCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Search Input & Seller Portal Link */}
          <div className="flex items-center gap-3">
            {/* Search Input Bar */}
            <div className="hidden md:flex relative w-52 lg:w-60">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search pieces, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-100/90 border border-transparent focus:border-zinc-300 focus:bg-white rounded-full pl-9 pr-7 py-2 text-xs font-sans text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-950"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Saved Wishlist Button (Mobile) */}
            <button
              onClick={() => setActiveTab('saved')}
              className="lg:hidden p-2 text-zinc-800 hover:text-zinc-950 relative rounded-full hover:bg-zinc-100 transition-colors"
              aria-label="Saved items"
            >
              <Bookmark className="w-5 h-5" />
              {savedCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-zinc-950 text-white text-[9px] flex items-center justify-center font-bold">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Seller Portal Link */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-zinc-950 text-white hover:bg-zinc-800 rounded-full text-xs font-semibold transition-all shadow-sm"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Seller Portal</span>
            </button>

            {/* Mobile Drawer Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-zinc-950 rounded-full hover:bg-zinc-100 transition-colors focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search pieces, brands, hoodies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-100 rounded-full pl-9 pr-4 py-2 text-xs font-sans text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-zinc-300 border border-transparent"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
