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
        className="fixed inset-0 bg-[#1A1A00]/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-[#F8F9EA] border-l border-[#E1E6B6] shadow-2xl p-6 flex flex-col justify-between z-10 rounded-l-3xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-[#E1E6B6]">
            <div>
              <span className="font-outfit text-2xl font-bold tracking-tight text-[#1A1A00] block">
                Habi
              </span>
              <span className="text-xs text-[#565C38] block">
                Davao Fashion Discovery
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#565C38] hover:text-[#1A1A00] rounded-full hover:bg-[#EFF2D2] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Location Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#565C38] uppercase tracking-wider">
              Region Location
            </label>
            <div className="flex items-center gap-2 bg-[#FFFFCC] px-3.5 py-2.5 rounded-full border border-[#E1E6B6] text-xs">
              <MapIcon className="w-4 h-4 text-[#1A1A00] shrink-0" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent text-[#1A1A00] font-medium cursor-pointer focus:outline-none border-none w-full text-xs"
              >
                {DAVAO_CITIES.map((city) => (
                  <option key={city} value={city} className="bg-[#FFFFCC] text-[#1A1A00]">
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-[#565C38] uppercase tracking-wider mb-2 px-2">
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
                      ? 'bg-[#1A1A00] text-[#FFFFCC] shadow-sm'
                      : 'text-[#1A1A00]/80 hover:bg-[#EFF2D2] hover:text-[#1A1A00]'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.id === 'saved' && savedCount > 0 ? (
                    <span className="px-2 py-0.5 text-xs bg-[#FFFFCC] text-[#1A1A00] rounded-full font-bold">
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
        <div className="pt-6 border-t border-[#E1E6B6]">
          <button
            onClick={() => {
              setActiveTab('dashboard');
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1A1A00] hover:bg-[#1A1A00]/90 text-[#FFFFCC] rounded-full text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <CustomStoreIcon className="w-4 h-4" />
            <span>Open Seller Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
