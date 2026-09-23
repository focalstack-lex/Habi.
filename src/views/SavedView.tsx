import React, { useState, useEffect } from 'react';
import { ProductGrid } from '../components/feed/ProductGrid';
import { DropCard } from '../components/drops/DropCard';
import type { Product, Seller, Drop } from '../types/fashion';
import { fashionService } from '../services/fashionService';
import { storageService } from '../services/storageService';
import { Bookmark, Users, Bell } from 'lucide-react';

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
      <div className="bg-zinc-950 text-white p-8 sm:p-12 rounded-none border border-zinc-800 space-y-4 font-mono">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-700 rounded-none text-xs text-zinc-300">
          <Bookmark className="w-3.5 h-3.5 text-white" />
          <span className="uppercase tracking-widest text-[10px] font-bold">Personal Closet</span>
        </div>

        <h1 className="font-syne text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter uppercase">
          Saved Fashion
        </h1>

        <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl font-sans leading-relaxed">
          Your saved 1-of-1 thrift pieces, followed Davao creators, and drop reminders stored in your browser.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 font-mono">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-5 py-3 text-xs uppercase font-bold tracking-wider transition-all border-b-2 -mb-px ${
            activeTab === 'products'
              ? 'border-zinc-950 text-zinc-950'
              : 'border-transparent text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Saved Items ({savedProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sellers')}
          className={`flex items-center gap-2 px-5 py-3 text-xs uppercase font-bold tracking-wider transition-all border-b-2 -mb-px ${
            activeTab === 'sellers'
              ? 'border-zinc-950 text-zinc-950'
              : 'border-transparent text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Followed Brands ({followedSellers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('drops')}
          className={`flex items-center gap-2 px-5 py-3 text-xs uppercase font-bold tracking-wider transition-all border-b-2 -mb-px ${
            activeTab === 'drops'
              ? 'border-zinc-950 text-zinc-950'
              : 'border-transparent text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
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
            <div className="p-12 bg-zinc-50 border border-zinc-200 rounded-none text-center space-y-3 font-mono">
              <Bookmark className="w-8 h-8 text-zinc-400 mx-auto" />
              <div className="font-syne text-base font-bold text-zinc-900">No Saved Items Yet</div>
              <p className="text-xs text-zinc-500 font-sans max-w-sm mx-auto">
                Explore the feed and tap the bookmark icon on any item to save it here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Followed Sellers */}
      {activeTab === 'sellers' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-mono">
          {followedSellers.length > 0 ? (
            followedSellers.map((seller) => (
              <div
                key={seller.id}
                onClick={() => onSelectSeller(seller.id)}
                className="bg-white border border-zinc-200 rounded-none p-6 space-y-4 cursor-pointer hover:border-zinc-950 transition-all shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={seller.logoUrl}
                    alt={seller.name}
                    className="w-12 h-12 rounded-none object-cover border border-zinc-300 shrink-0"
                  />
                  <div>
                    <h3 className="font-syne font-bold text-sm text-zinc-950">{seller.name}</h3>
                    <div className="text-xs text-zinc-500 font-mono">@{seller.handle} • {seller.location.district}</div>
                  </div>
                </div>
                <p className="text-xs font-sans text-zinc-600 line-clamp-2">{seller.description}</p>
              </div>
            ))
          ) : (
            <div className="col-span-full p-12 bg-zinc-50 border border-zinc-200 rounded-none text-center space-y-3 font-mono">
              <Users className="w-8 h-8 text-zinc-400 mx-auto" />
              <div className="font-syne text-base font-bold text-zinc-900">No Followed Brands</div>
              <p className="text-xs text-zinc-500 font-sans max-w-sm mx-auto">
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
            <div className="p-12 bg-zinc-50 border border-zinc-200 rounded-none text-center space-y-3 font-mono">
              <Bell className="w-8 h-8 text-zinc-400 mx-auto" />
              <div className="font-syne text-base font-bold text-zinc-900">No Active Drop Reminders</div>
              <p className="text-xs text-zinc-500 font-sans max-w-sm mx-auto">
                Tap 'Remind Me' on upcoming Davao collection drops to get notified before launch.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
