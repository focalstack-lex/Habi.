import React, { useState, useEffect } from 'react';
import { ProductGrid } from '../components/feed/ProductGrid';
import { DropCard } from '../components/drops/DropCard';
import type { Product, Seller, Drop, Moodboard } from '../types/fashion';
import { fashionService } from '../services/fashionService';
import { storageService } from '../services/storageService';
import { SavedIcon, DashboardIcon, DropsIcon, CustomPinIcon } from '../components/common/CustomIcons';
import { Bell, Plus, ArrowLeft, Trash2 } from 'lucide-react';

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
  const [moodboards, setMoodboards] = useState<Moodboard[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'moodboards' | 'sellers' | 'drops'>('products');
  const [selectedBoard, setSelectedBoard] = useState<Moodboard | null>(null);

  const [isCreatingBoard, setIsCreatingBoard] = useState<boolean>(false);
  const [newBoardName, setNewBoardName] = useState<string>('');
  const [newBoardDesc, setNewBoardDesc] = useState<string>('');

  const refreshData = () => {
    const savedIds = storageService.getSavedProducts();
    const allProducts = fashionService.getProducts();
    setSavedProducts(allProducts.filter((p) => savedIds.includes(p.id)));

    const followedIds = storageService.getFollowedSellers();
    const allSellers = fashionService.getSellers();
    setFollowedSellers(allSellers.filter((s) => followedIds.includes(s.id)));

    const reminderIds = storageService.getDropReminders();
    const allDrops = fashionService.getDrops();
    setRemindedDrops(allDrops.filter((d) => reminderIds.includes(d.id)));

    setMoodboards(storageService.getMoodboards());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    storageService.createMoodboard(newBoardName.trim(), newBoardDesc.trim());
    setNewBoardName('');
    setNewBoardDesc('');
    setIsCreatingBoard(false);
    refreshData();
  };

  const handleDeleteBoard = (e: React.MouseEvent, boardId: string) => {
    e.stopPropagation();
    storageService.deleteMoodboard(boardId);
    if (selectedBoard?.id === boardId) setSelectedBoard(null);
    refreshData();
  };

  const allProductsMap = React.useMemo(() => {
    const map = new Map<string, Product>();
    fashionService.getProducts().forEach((p) => map.set(p.id, p));
    return map;
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-[#1A2225] text-[#FFF9E9] p-6 sm:p-8 md:p-10 rounded-3xl border border-[#1A2225]/20 shadow-xl space-y-3">
        <div className="font-avantgarde text-[11px] tracking-widest uppercase text-[#E0DFC8] font-semibold">
          PERSONAL CLOSET & CURATION
        </div>

        <h1 className="font-outfit text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
          Saved & Moodboards
        </h1>

        <p className="text-[#E0DFC8] text-sm sm:text-base max-w-2xl font-sans leading-relaxed">
          Your saved 1-of-1 thrift pieces, curated Davao Moodboards, followed creators, and drop reminders.
        </p>
      </div>

      {/* Capsule Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#F3ECD8] rounded-full w-fit">
        <button
          onClick={() => {
            setActiveTab('products');
            setSelectedBoard(null);
          }}
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
          onClick={() => {
            setActiveTab('moodboards');
            setSelectedBoard(null);
          }}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
            activeTab === 'moodboards'
              ? 'bg-[#1A2225] text-[#FFF9E9] shadow-sm'
              : 'text-[#55615D] hover:text-[#1A2225] hover:bg-[#F3ECD8]/80'
          }`}
        >
          <CustomPinIcon className="w-3.5 h-3.5" />
          <span>Davao Moodboards ({moodboards.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('sellers');
            setSelectedBoard(null);
          }}
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
          onClick={() => {
            setActiveTab('drops');
            setSelectedBoard(null);
          }}
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

      {/* Tab 2: Custom Style Moodboards */}
      {activeTab === 'moodboards' && (
        <div className="space-y-6">
          {!selectedBoard ? (
            <>
              {/* Moodboard Controls Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-outfit text-xl font-bold text-[#1A2225]">
                    Your Davao Moodboards
                  </h2>
                  <p className="text-xs text-[#55615D] font-sans">
                    Theme-based visual lookbooks & curated streetwear grails
                  </p>
                </div>

                <button
                  onClick={() => setIsCreatingBoard(true)}
                  className="px-4 py-2 bg-[#1A2225] text-[#FFF9E9] font-semibold text-xs rounded-full hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Moodboard</span>
                </button>
              </div>

              {/* Create Board Inline Modal */}
              {isCreatingBoard && (
                <form
                  onSubmit={handleCreateBoard}
                  className="p-6 bg-[#FFF9E9] border border-[#1A2225] rounded-3xl space-y-4 shadow-md max-w-lg"
                >
                  <div className="font-outfit text-base font-bold text-[#1A2225]">
                    New Moodboard Title
                  </div>

                  <input
                    type="text"
                    placeholder="e.g. Davao Rainwear & Gorpcore"
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs bg-[#F8F9EA] border border-[#E6DCC0] rounded-xl text-[#1A2225] focus:outline-none focus:border-[#1A2225]"
                    autoFocus
                    required
                  />

                  <input
                    type="text"
                    placeholder="Short description..."
                    value={newBoardDesc}
                    onChange={(e) => setNewBoardDesc(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs bg-[#F8F9EA] border border-[#E6DCC0] rounded-xl text-[#1A2225] focus:outline-none focus:border-[#1A2225]"
                  />

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#1A2225] text-[#FFF9E9] text-xs font-semibold rounded-full hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      Save Board
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCreatingBoard(false)}
                      className="px-4 py-2 text-xs font-semibold text-[#55615D] hover:text-[#1A2225] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Moodboard Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {moodboards.map((board) => {
                  const pinnedProducts = board.productIds
                    .map((id) => allProductsMap.get(id))
                    .filter((p): p is Product => Boolean(p));

                  const collageImages = pinnedProducts.map((p) => p.images[0]);

                  return (
                    <div
                      key={board.id}
                      onClick={() => setSelectedBoard(board)}
                      className="bg-[#FFF9E9] border border-[#E6DCC0] rounded-3xl p-5 space-y-4 cursor-pointer hover:border-[#1A2225]/50 hover:shadow-lg transition-all group shadow-sm flex flex-col justify-between"
                    >
                      {/* 3-Photo Collage Preview */}
                      <div className="aspect-[16/9] bg-[#F3ECD8] rounded-2xl overflow-hidden grid grid-cols-3 gap-1 p-1">
                        {collageImages.slice(0, 3).map((img, idx) => (
                          <div key={idx} className="h-full bg-[#1A2225] overflow-hidden rounded-xl">
                            <img
                              src={img}
                              alt={board.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                            />
                          </div>
                        ))}
                        {collageImages.length === 0 && (
                          <div className="col-span-3 h-full flex flex-col items-center justify-center text-[#55615D] text-xs font-mono">
                            <CustomPinIcon className="w-5 h-5 mb-1 opacity-50" />
                            <span>Empty Board</span>
                          </div>
                        )}
                      </div>

                      {/* Board Meta */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-outfit text-base font-bold text-[#1A2225] group-hover:text-[#39464A] transition-colors truncate">
                            {board.name}
                          </h3>
                          <span className="text-[10px] uppercase font-avantgarde font-semibold px-2 py-0.5 bg-[#F3ECD8] text-[#1A2225] rounded-full border border-[#E6DCC0]">
                            Public
                          </span>
                        </div>
                        <p className="text-xs text-[#55615D] font-sans line-clamp-2 leading-relaxed">
                          {board.description || 'Curated Davao streetwear moodboard.'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#E6DCC0] flex items-center justify-between text-xs text-[#55615D]">
                        <span className="flex items-center gap-1 font-semibold text-[#1A2225]">
                          <CustomPinIcon className="w-3.5 h-3.5 text-[#1A2225]" />
                          <span>{board.productIds.length} Pinned Items</span>
                        </span>

                        <button
                          onClick={(e) => handleDeleteBoard(e, board.id)}
                          title="Delete Moodboard"
                          className="p-1 text-[#55615D] hover:text-[#1A2225] hover:bg-[#F3ECD8] rounded-full transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Selected Moodboard Detail View */
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-[#FFF9E9] border border-[#E6DCC0] p-6 rounded-3xl shadow-sm">
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedBoard(null)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#1A2225] hover:underline mb-2 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Moodboards</span>
                  </button>
                  <h2 className="font-outfit text-2xl font-bold text-[#1A2225]">
                    {selectedBoard.name}
                  </h2>
                  <p className="text-xs text-[#55615D]">
                    {selectedBoard.description}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-[#1A2225] px-3 py-1.5 bg-[#F3ECD8] rounded-full border border-[#E6DCC0]">
                    {selectedBoard.productIds.length} Items
                  </span>
                </div>
              </div>

              {selectedBoard.productIds.length > 0 ? (
                <ProductGrid
                  products={selectedBoard.productIds
                    .map((id) => allProductsMap.get(id))
                    .filter((p): p is Product => Boolean(p))}
                  onSelectProduct={onSelectProduct}
                  onSelectSeller={onSelectSeller}
                />
              ) : (
                <div className="p-12 bg-[#FFF9E9] border border-[#E6DCC0] rounded-3xl text-center space-y-3">
                  <CustomPinIcon className="w-8 h-8 text-[#1A2225] mx-auto opacity-50" />
                  <div className="font-outfit text-base font-bold text-[#1A2225]">
                    No Items Pinned to this Board
                  </div>
                  <p className="text-xs text-[#55615D]">
                    Browse products in the feed and tap the pin button to add them here.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Followed Sellers */}
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

      {/* Tab 4: Drop Reminders */}
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

