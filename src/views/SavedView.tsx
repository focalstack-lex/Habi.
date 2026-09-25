import React, { useState } from 'react';
import { ProductGrid } from '../components/feed/ProductGrid';
import { DropCard } from '../components/drops/DropCard';
import type { Product } from '../types/fashion';
import { fashionService } from '../services/fashionService';
import { storageService } from '../services/storageService';
import { userPrefsService } from '../services/userPrefsService';
import { useCatalogVersion } from '../hooks/useCatalogVersion';
import { usePrefsVersion } from '../hooks/usePrefsVersion';
import { SavedIcon, DashboardIcon, DropsIcon } from '../components/common/CustomIcons';
import { Bell, BellRing, Layers, UserRound } from 'lucide-react';
import { AlertsList } from '../components/saved/AlertsList';
import { BoardsTab } from '../components/saved/BoardsTab';
import { BuyerProfileTab } from '../components/saved/BuyerProfileTab';
import { useI18n } from '../i18n';

export type SavedTab = 'products' | 'sellers' | 'drops' | 'boards' | 'alerts' | 'profile';

interface SavedViewProps {
  onSelectProduct: (product: Product) => void;
  onSelectSeller: (sellerId: string) => void;
  onExploreDrop?: (dropId: string) => void;
  initialTab?: SavedTab;
}

export const SavedView: React.FC<SavedViewProps> = ({
  onSelectProduct,
  onSelectSeller,
  onExploreDrop,
  initialTab = 'products',
}) => {
  const { t } = useI18n();
  useCatalogVersion();
  usePrefsVersion();
  const [activeTab, setActiveTab] = useState<SavedTab>(initialTab);

  const savedIds = storageService.getSavedProducts();
  const allProducts = fashionService.getProducts();
  const savedProducts = allProducts.filter((p) => savedIds.includes(p.id));

  const followedIds = storageService.getFollowedSellers();
  const followedSellers = fashionService.getSellers().filter((s) => followedIds.includes(s.id));

  const reminderIds = storageService.getDropReminders();
  const remindedDrops = fashionService.getDrops().filter((d) => reminderIds.includes(d.id));

  const boards = userPrefsService.getBoards();
  const alerts = userPrefsService.getAlerts(savedProducts);

  const tabs: { id: SavedTab; label: string; icon: React.ComponentType<{ className?: string }>; count?: number }[] = [
    { id: 'products', label: t('saved.items'), icon: SavedIcon, count: savedProducts.length },
    { id: 'alerts', label: t('saved.alerts'), icon: BellRing, count: alerts.length },
    { id: 'boards', label: t('saved.boards'), icon: Layers, count: boards.length },
    { id: 'sellers', label: t('saved.brands'), icon: DashboardIcon, count: followedSellers.length },
    { id: 'drops', label: t('saved.drops'), icon: DropsIcon, count: remindedDrops.length },
    { id: 'profile', label: t('saved.profile'), icon: UserRound },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 font-sans space-y-4 sm:space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 text-white p-5 sm:p-8 lg:p-12 rounded-2xl sm:rounded-3xl border border-zinc-800/80 shadow-xl space-y-2 sm:space-y-3">
        <div className="font-avantgarde text-[11px] tracking-wider uppercase text-zinc-400 font-semibold">
          {t('saved.eyebrow')}
        </div>

        <h1 className="font-cooper text-2xl sm:text-3xl lg:text-5xl font-bold tracking-tight">
          {t('saved.title')}
        </h1>

        <p className="text-zinc-300 text-xs sm:text-sm lg:text-base max-w-2xl leading-relaxed">
          {t('saved.body')}
        </p>
      </div>

      {/* Capsule Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 bg-zinc-100 rounded-full w-full sm:w-fit overflow-x-auto scrollbar-none">
        {tabs.map(({ id, label, icon: Icon, count }) => {
          const isActive = activeTab === id;
          const showBadge = id === 'alerts' && (count ?? 0) > 0;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-3.5 py-2 sm:px-5 sm:py-2.5 text-xs font-semibold rounded-full transition-all shrink-0 whitespace-nowrap ${
                isActive
                  ? 'bg-zinc-950 text-white shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>
                {label}
                {count !== undefined && !showBadge ? ` (${count})` : ''}
              </span>
              {showBadge && (
                <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${isActive ? 'bg-white text-zinc-950' : 'bg-emerald-500 text-white'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Saved Products */}
      {activeTab === 'products' && (
        <div>
          {savedProducts.length > 0 ? (
            <ProductGrid
              products={savedProducts}
              onSelectProduct={onSelectProduct}
              onSelectSeller={onSelectSeller}
            />
          ) : (
            <div className="p-6 sm:p-12 bg-white border border-zinc-200/80 rounded-2xl sm:rounded-3xl text-center space-y-3 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-500">
                <SavedIcon className="w-6 h-6" />
              </div>
              <div className="font-cooper text-lg font-bold text-zinc-900">{t('saved.emptyItems')}</div>
              <p className="text-sm text-zinc-500 font-sans max-w-sm mx-auto">
                {t('saved.emptyItemsBody')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Alerts */}
      {activeTab === 'alerts' && (
        <AlertsList alerts={alerts} products={savedProducts} onSelectProduct={onSelectProduct} />
      )}

      {/* Tab 3: Outfit boards */}
      {activeTab === 'boards' && <BoardsTab boards={boards} onSelectProduct={onSelectProduct} />}

      {/* Tab 4: Followed Sellers */}
      {activeTab === 'sellers' && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {followedSellers.length > 0 ? (
            followedSellers.map((seller) => (
              <div
                key={seller.id}
                onClick={() => onSelectSeller(seller.id)}
                className="bg-white border border-zinc-200/80 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 space-y-3 sm:space-y-4 cursor-pointer hover:border-zinc-400 hover:shadow-md transition-all shadow-sm group"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={seller.logoUrl}
                    alt={seller.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-zinc-200 shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="min-w-0">
                    <h3 className="font-cooper font-bold text-sm sm:text-base text-zinc-950 truncate">{seller.name}</h3>
                    <div className="text-xs text-zinc-500 font-sans truncate">@{seller.handle} • {seller.location.district}</div>
                  </div>
                </div>
                <p className="text-xs sm:text-sm font-sans text-zinc-600 line-clamp-2 leading-relaxed">{seller.description}</p>
              </div>
            ))
          ) : (
            <div className="col-span-full p-6 sm:p-12 bg-white border border-zinc-200/80 rounded-2xl sm:rounded-3xl text-center space-y-3 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-500">
                <DashboardIcon className="w-6 h-6" />
              </div>
              <div className="font-cooper text-lg font-bold text-zinc-900">{t('saved.emptyBrands')}</div>
              <p className="text-sm text-zinc-500 font-sans max-w-sm mx-auto">
                {t('saved.emptyBrandsBody')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Drop Reminders */}
      {activeTab === 'drops' && (
        <div className="space-y-4 sm:space-y-6 max-w-4xl">
          {remindedDrops.length > 0 ? (
            remindedDrops.map((drop) => (
              <DropCard key={drop.id} drop={drop} onExploreDrop={onExploreDrop} />
            ))
          ) : (
            <div className="p-6 sm:p-12 bg-white border border-zinc-200/80 rounded-2xl sm:rounded-3xl text-center space-y-3 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-500">
                <Bell className="w-6 h-6" />
              </div>
              <div className="font-cooper text-lg font-bold text-zinc-900">{t('saved.emptyDrops')}</div>
              <p className="text-sm text-zinc-500 font-sans max-w-sm mx-auto">
                {t('saved.emptyDropsBody')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Buyer profile & preferences */}
      {activeTab === 'profile' && <BuyerProfileTab savedProductIds={savedIds} />}
    </div>
  );
};
