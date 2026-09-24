import React, { useState, useEffect } from 'react';
import { ProductGrid } from '../components/feed/ProductGrid';
import { DropCard } from '../components/drops/DropCard';
import type { Product, Seller, Drop } from '../types/fashion';
import { fashionService } from '../services/fashionService';
import { storageService } from '../services/storageService';
import { SavedIcon, DashboardIcon, DropsIcon } from '../components/common/CustomIcons';
import { Bell } from 'lucide-react';

interface SavedViewProps {
  onSelectProduct: (product: Product) => void;
  onSelectSeller: (sellerId: string) => void;
  onExploreDrop?: (dropId: string) => void;
}

export const SavedView: React.FC<SavedViewProps> = ({
  onSelectProduct,
  onSelectSeller,
  onExploreDrop,
}) => {
  const [savedProducts, setSavedProducts] = useState<Product[]>([]);
  const [followedSellers, setFollowedSellers] = useState<Seller[]>([]);
  const [remindedDrops, setRemindedDrops] = useState<Drop[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'sellers' | 'drops'>('products');

  useEffect(() => {
    const savedIds = storageService.getSavedProducts();
    const allProducts = fashionService.getProducts();
    setSavedProducts(allProducts.filter((p) => savedIds.includes(p.id)));

    const followedIds = storageService.getFollowedSellers();
    const allSellers = fashionService.getSellers();
    setFollowedSellers(allSellers.filter((s) => followedIds.includes(s.id)));

    const reminderIds = storageService.getDropReminders();
    const allDrops = fashionService.getDrops();
    setRemindedDrops(allDrops.filter((d) => reminderIds.includes(d.id)));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-[#1A2225] text-[#FFF9E9] p-8 sm:p-12 rounded-3xl border border-[#1A2225]/20 shadow-xl space-y-3">
        <div className="font-avantgarde text-[11px] tracking-widest uppercase text-[#E0DFC8] font-semibold">
          PERSONAL CLOSET
        </div>

        <h1 className="font-outfit text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
          Saved Fashion
        </h1>

        <p className="text-[#E0DFC8] text-sm sm:text-base max-w-2xl font-sans leading-relaxed">
          Your saved 1-of-1 thrift pieces, followed Davao creators, and drop reminders stored in your browser.
        </p>
      </div>

      {/* Capsule Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#F3ECD8] rounded-full w-fit">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
            activeTab === 'products'
              ? 'bg-[#1A2225] text-[#FFF9E9] shadow-sm'
              : 'text-[#55615D] hover:text-[#1A2225] hover:bg-[#F3ECD8]/80'
          }`}
        >
          <SavedIcon className="w-3.5 h-3.5" />
          <span>Saved Items ({savedProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sellers')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
            activeTab === 'sellers'
              ? 'bg-[#1A2225] text-[#FFF9E9] shadow-sm'
              : 'text-[#55615D] hover:text-[#1A2225] hover:bg-[#F3ECD8]/80'
          }`}
        >
          <DashboardIcon className="w-3.5 h-3.5" />
          <span>Followed Brands ({followedSellers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('drops')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
            activeTab === 'drops'
              ? 'bg-[#1A2225] text-[#FFF9E9] shadow-sm'
              : 'text-[#55615D] hover:text-[#1A2225] hover:bg-[#F3ECD8]/80'
          }`}
        >
          <DropsIcon className="w-3.5 h-3.5" />
          <span>Drop Reminders ({remindedDrops.length})</span>
        </button>
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
            <div className="p-12 bg-[#FFF9E9] border border-[#E6DCC0] rounded-3xl text-center space-y-3 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-[#F3ECD8] flex items-center justify-center mx-auto text-[#1A2225]">
                <SavedIcon className="w-6 h-6" />
              </div>
              <div className="font-outfit text-lg font-bold text-[#1A2225]">No Saved Items Yet</div>
              <p className="text-sm text-[#55615D] font-sans max-w-sm mx-auto">
                Explore the feed and tap the bookmark icon on any item to save it here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Followed Sellers */}
      {activeTab === 'sellers' && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {followedSellers.length > 0 ? (
            followedSellers.map((seller) => (
              <div
                key={seller.id}
                onClick={() => onSelectSeller(seller.id)}
                className="bg-[#FFF9E9] border border-[#E6DCC0] rounded-3xl p-6 space-y-4 cursor-pointer hover:border-[#1A2225]/40 hover:shadow-md transition-all shadow-sm group"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={seller.logoUrl}
                    alt={seller.name}
                    className="w-12 h-12 rounded-full object-cover border border-[#E6DCC0] shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div>
                    <h3 className="font-outfit font-bold text-base text-[#1A2225]">{seller.name}</h3>
                    <div className="text-xs text-[#55615D] font-sans">@{seller.handle} • {seller.location.district}</div>
                  </div>
                </div>
                <p className="text-sm font-sans text-[#55615D] line-clamp-2 leading-relaxed">{seller.description}</p>
              </div>
            ))
          ) : (
            <div className="col-span-full p-12 bg-[#FFF9E9] border border-[#E6DCC0] rounded-3xl text-center space-y-3 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-[#F3ECD8] flex items-center justify-center mx-auto text-[#1A2225]">
                <DashboardIcon className="w-6 h-6" />
              </div>
              <div className="font-outfit text-lg font-bold text-[#1A2225]">No Followed Brands</div>
              <p className="text-sm text-[#55615D] font-sans max-w-sm mx-auto">
                Follow local Davao streetwear creators and thrift accounts to prioritize their drops in your feed.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Drop Reminders */}
      {activeTab === 'drops' && (
        <div className="space-y-6 max-w-4xl">
          {remindedDrops.length > 0 ? (
            remindedDrops.map((drop) => (
              <DropCard key={drop.id} drop={drop} onExploreDrop={onExploreDrop} />
            ))
          ) : (
            <div className="p-12 bg-[#FFF9E9] border border-[#E6DCC0] rounded-3xl text-center space-y-3 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-[#F3ECD8] flex items-center justify-center mx-auto text-[#1A2225]">
                <Bell className="w-6 h-6" />
              </div>
              <div className="font-outfit text-lg font-bold text-[#1A2225]">No Active Drop Reminders</div>
              <p className="text-sm text-[#55615D] font-sans max-w-sm mx-auto">
                Tap 'Remind Me' on upcoming Davao collection drops to get notified before launch.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
