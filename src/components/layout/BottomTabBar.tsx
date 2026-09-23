import React from 'react';
import { LayoutGrid, Timer, MapPin, Bookmark } from 'lucide-react';
import { NAV_TABS } from './NavigationHeader';

const BOTTOM_TAB_IDS: string[] = ['feed', 'drops', 'map', 'saved'];

const TAB_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  feed: LayoutGrid,
  drops: Timer,
  map: MapPin,
  saved: Bookmark,
};

interface BottomTabBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  savedCount?: number;
  isHidden?: boolean;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  setActiveTab,
  savedCount = 0,
  isHidden = false,
}) => {
  if (isHidden) return null;

  const tabs = NAV_TABS.filter((tab) => BOTTOM_TAB_IDS.includes(tab.id));

  return (
    <nav
      aria-label="Primary"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-200 tabbar-safe"
    >
      <div className="grid grid-cols-4">
        {tabs.map((tab) => {
          const Icon = TAB_ICONS[tab.id];
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center gap-1 min-h-[56px] py-2 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors duration-150 ${
                isActive
                  ? 'text-zinc-950 font-bold'
                  : 'text-zinc-400 hover:text-zinc-950 font-medium'
              }`}
            >
              {isActive && (
                <span
                  className="absolute top-0 left-0 right-0 h-0.5 bg-zinc-950"
                  aria-hidden="true"
                />
              )}
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
              {tab.id === 'saved' && savedCount > 0 && (
                <span className="absolute top-1.5 right-1/4 min-w-[16px] bg-zinc-950 text-white font-mono text-[9px] font-bold text-center">
                  {savedCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
