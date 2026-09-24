import React from 'react';
import { MapIcon, CustomStoreIcon } from '../common/CustomIcons';
import { X, ArrowRight } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 lg:hidden font-sans">
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl p-6 flex flex-col justify-between z-10 rounded-l-3xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-zinc-100">
            <div>
              <span className="font-outfit text-2xl font-bold tracking-tight text-zinc-950 block">
                Habi
              </span>
              <span className="text-xs text-zinc-500 block">
                Davao Fashion Discovery
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-zinc-500 hover:text-zinc-900 rounded-full hover:bg-zinc-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Location Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Region Location
            </label>
            <div className="flex items-center gap-2 bg-zinc-100 px-3.5 py-2.5 rounded-full border border-zinc-200/80 text-xs">
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
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 px-2">
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
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-full text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-zinc-950 text-white shadow-sm'
                      : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950'
                  }`}
                >
                  <span>{tab.label}</span>
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
        </div>

        {/* Footer CTA */}
        <div className="pt-6 border-t border-zinc-100">
          <button
            onClick={() => {
              setActiveTab('dashboard');
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-full text-xs font-semibold shadow-md transition-all"
          >
            <CustomStoreIcon className="w-4 h-4" />
            <span>Open Seller Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
