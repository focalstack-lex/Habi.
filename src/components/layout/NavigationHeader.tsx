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
      {/* Top Utility Bar */}
      <div className="bg-zinc-900 text-white text-xs py-1.5 px-4 text-center tracking-widest font-mono uppercase">
        Discover Local Fashion | Davao Region, Philippines
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('feed')}
              className="text-left focus:outline-none group"
            >
              <span className="font-mono text-2xl font-black tracking-tighter text-zinc-900 block group-hover:opacity-80 transition-opacity">
                HABI
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 block -mt-1">
                Davao Fashion
              </span>
            </button>

            {/* Davao Location Picker Dropdown */}
            <div className="hidden sm:flex items-center gap-1.5 bg-zinc-100 px-3 py-1.5 rounded-full border border-zinc-200 text-xs font-mono">
              <MapPin className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent text-zinc-900 font-medium cursor-pointer focus:outline-none border-none pr-1 text-xs"
              >
                {DAVAO_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Davao brands, vintage denim, streetwear..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-full pl-10 pr-4 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Actions & Navigation Links */}
          <div className="flex items-center gap-3">
            {/* Desktop Navigation Tabs */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-mono tracking-tight transition-colors relative ${
                      isActive
                        ? 'bg-zinc-900 text-white font-medium'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                    }`}
                  >
                    {tab.label}
                    {tab.id === 'saved' && savedCount > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full bg-zinc-200 text-zinc-900 font-bold">
                        {savedCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Saved Wishlist Button (Mobile/Tablet View) */}
            <button
              onClick={() => setActiveTab('saved')}
              className="lg:hidden p-2 text-zinc-700 hover:text-zinc-900 relative rounded-full hover:bg-zinc-100"
              aria-label="Saved items"
            >
              <Bookmark className="w-5 h-5" />
              {savedCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-zinc-900 text-white text-[10px] flex items-center justify-center font-bold">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Seller Dashboard Quick Link */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white rounded-full text-xs font-mono tracking-tight transition-all"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Seller Portal</span>
            </button>

            {/* Mobile Menu Drawer Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-zinc-700 hover:text-zinc-900 rounded-lg focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Row */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Davao brands, vintage denim..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-full pl-10 pr-4 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
