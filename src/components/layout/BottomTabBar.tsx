import React from 'react';
import {
  FeedIcon,
  DiscoverIcon,
  DropsIcon,
  MapIcon,
  SavedIcon,
  DashboardIcon,
} from '../common/CustomIcons';
import { NAV_TABS } from './NavigationHeader';

const BOTTOM_TAB_IDS: string[] = ['feed', 'discover', 'drops', 'map', 'saved', 'dashboard'];

const TAB_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  feed: FeedIcon,
  discover: DiscoverIcon,
  drops: DropsIcon,
  map: MapIcon,
  saved: SavedIcon,
  dashboard: DashboardIcon,
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
    <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40 flex justify-center pointer-events-none">
      <nav
        aria-label="Primary Mobile Navigation"
        className="pointer-events-auto bg-white/95 backdrop-blur-xl border border-zinc-200/80 shadow-2xl rounded-full px-3 py-1.5 flex items-center justify-between gap-1 max-w-md w-full"
      >
        {tabs.map((tab) => {
          const Icon = TAB_ICONS[tab.id] || FeedIcon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center py-1.5 px-2.5 rounded-full transition-all duration-200 ${
                isActive
                  ? 'bg-zinc-950 text-white shadow-md'
                  : 'text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[9px] font-semibold mt-0.5">{tab.label}</span>
              {tab.id === 'saved' && savedCount > 0 && (
                <span className={`absolute -top-1 -right-1 min-w-[15px] h-[15px] rounded-full text-[8px] flex items-center justify-center font-bold ${
                  isActive ? 'bg-white text-zinc-950' : 'bg-zinc-950 text-white'
                }`}>
                  {savedCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
