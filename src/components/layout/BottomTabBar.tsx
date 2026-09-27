import React from 'react';
import {
  FeedIcon,
  DiscoverIcon,
  DropsIcon,
  MapIcon,
  SavedIcon,
} from '../common/CustomIcons';
import { NAV_TABS, PORTAL_LABELS, PORTAL_TAB_ID, PortalIcon, type PortalRole } from './NavigationHeader';
import { useI18n, type StringKey } from '../../i18n';

const BOTTOM_TAB_IDS: string[] = ['feed', 'discover', 'drops', 'map', 'saved'];

const TAB_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  feed: FeedIcon,
  discover: DiscoverIcon,
  drops: DropsIcon,
  map: MapIcon,
  saved: SavedIcon,
};

interface BottomTabBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  savedCount?: number;
  isHidden?: boolean;
  portalRole: PortalRole;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  setActiveTab,
  savedCount = 0,
  isHidden = false,
  portalRole,
}) => {
  const { t } = useI18n();
  if (isHidden) return null;

  const tabs: { id: string; labelKey: StringKey }[] = [
    ...NAV_TABS.filter((tab) => BOTTOM_TAB_IDS.includes(tab.id)),
    { id: PORTAL_TAB_ID, labelKey: PORTAL_LABELS[portalRole].short },
  ];

  return (
    <div className="lg:hidden fixed bottom-3 left-3 right-3 z-40 flex justify-center pointer-events-none tabbar-safe">
      <nav
        aria-label="Primary Mobile Navigation"
        className="pointer-events-auto bg-[#1A2225]/95 backdrop-blur-xl border border-[#39464A]/80 shadow-2xl rounded-full px-2 py-1.5 flex items-center gap-0.5 max-w-md w-full"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = TAB_ICONS[tab.id];
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex-1 min-w-0 flex flex-col items-center justify-center py-1.5 px-1 rounded-full transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-[#FFF9E9] text-[#1A2225] shadow-md font-bold'
                  : 'text-[#C8CBB4] hover:text-[#FFF9E9] hover:bg-[#252E31]'
              }`}
            >
              {Icon ? <Icon className="w-4 h-4" /> : <PortalIcon role={portalRole} className="w-4 h-4" />}
              <span className="text-[10px] font-semibold mt-0.5 truncate w-full text-center">{t(tab.labelKey)}</span>
              {tab.id === 'saved' && savedCount > 0 && (
                <span className={`absolute top-0 right-1 min-w-[15px] h-[15px] px-1 rounded-full text-[8px] flex items-center justify-center font-bold ${
                  isActive ? 'bg-[#1A2225] text-[#FFF9E9]' : 'bg-[#FFF9E9] text-[#1A2225]'
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
