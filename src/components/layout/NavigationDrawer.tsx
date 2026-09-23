import React from 'react';
import { MapPin, X, Store, ArrowRight } from 'lucide-react';
import { DAVAO_CITIES, NAV_TABS } from './NavigationHeader';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  savedCount: number;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  selectedCity,
  setSelectedCity,
  savedCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl p-6 flex flex-col justify-between z-10 font-mono">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-zinc-200">
            <div>
              <span className="font-mono text-xl font-black tracking-tighter text-zinc-900 block">
                HABI
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 block">
                Davao Fashion
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-zinc-500 hover:text-zinc-900 rounded-full hover:bg-zinc-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Location Selector */}
          <div className="py-4 border-b border-zinc-200">
            <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
              Region Location
            </label>
            <div className="flex items-center gap-2 bg-zinc-100 px-3 py-2 rounded-lg border border-zinc-200 text-xs">
              <MapPin className="w-4 h-4 text-zinc-600 shrink-0" />
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
          <div className="py-6 space-y-1">
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3 px-2">
              Navigation
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
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-zinc-900 text-white font-medium'
                      : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.id === 'saved' && savedCount > 0 ? (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-zinc-200 text-zinc-900 font-bold">
                      {savedCount}
                    </span>
                  ) : (
                    <ArrowRight className="w-4 h-4 opacity-40" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="pt-6 border-t border-zinc-200">
          <button
            onClick={() => {
              setActiveTab('dashboard');
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-900 text-white rounded-lg text-xs font-mono font-medium hover:bg-zinc-800 transition-colors"
          >
            <Store className="w-4 h-4" />
            <span>Open Seller Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
