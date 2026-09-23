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
    <header className="sticky top-0 z-40 bg-white border-b border-zinc-200">
      {/* Top Ticker Bar */}
      <div className="bg-zinc-950 text-white text-[10px] py-1.5 px-4 text-center tracking-[0.2em] font-mono uppercase border-b border-zinc-900">
        DISCOVER LOCAL FASHION • DAVAO REGION, PHILIPPINES
      </div>

      {/* Main Editorial Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-6">
          {/* Brand Logo & Region Indicator */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('feed')}
              className="text-left focus:outline-none group"
            >
              <span className="font-syne text-3xl font-extrabold tracking-[0.2em] text-zinc-950 block group-hover:opacity-75 transition-opacity">
                HABI
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-zinc-400 block -mt-1">
                Davao Fashion
              </span>
            </button>

            {/* Davao Location Selector */}
            <div className="hidden sm:flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-none border border-zinc-300 text-xs font-mono">
              <MapPin className="w-3.5 h-3.5 text-zinc-950 shrink-0" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent text-zinc-950 font-bold cursor-pointer focus:outline-none border-none pr-1 text-xs"
              >
                {DAVAO_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Center Navigation Links (Clean Text with Hairline Active Underline, NO Pills) */}
          <nav className="hidden lg:flex items-center gap-6 font-mono text-xs">
            {NAV_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-6 uppercase tracking-wider transition-all relative ${
                    isActive
                      ? 'text-zinc-950 font-bold border-b-2 border-zinc-950'
                      : 'text-zinc-500 hover:text-zinc-950 font-medium'
                  }`}
                >
                  {tab.label}
                  {tab.id === 'saved' && savedCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 bg-zinc-950 text-white font-mono text-[9px] font-bold">
                      {savedCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Search Input & Seller Portal Link */}
          <div className="flex items-center gap-4">
            {/* Search Input Bar */}
            <div className="hidden md:flex relative w-56 lg:w-64">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search brands, denim..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-none pl-9 pr-7 py-1.5 text-xs font-mono text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-950"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Saved Wishlist Button (Mobile View) */}
            <button
              onClick={() => setActiveTab('saved')}
              className="lg:hidden p-2 text-zinc-800 hover:text-zinc-950 relative"
              aria-label="Saved items"
            >
              <Bookmark className="w-5 h-5" />
              {savedCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-zinc-950 text-white text-[9px] flex items-center justify-center font-bold font-mono">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Seller Portal Link */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-zinc-950 text-white hover:bg-zinc-800 rounded-none text-xs font-mono font-bold tracking-wider uppercase transition-all"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Seller Portal</span>
            </button>

            {/* Mobile Drawer Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-zinc-950 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Row */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search brands, denim..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-300 rounded-none pl-9 pr-4 py-2 text-xs font-mono text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
