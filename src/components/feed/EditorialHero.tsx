import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { MapIcon, CustomTagIcon, CustomStoreIcon } from '../common/CustomIcons';
import type { Drop } from '../../types/fashion';

interface EditorialHeroProps {
  featuredDrop?: Drop;
  onExploreDrop: (dropId: string) => void;
  onSelectBrand: (brandId: string) => void;
}

interface LookbookItem {
  id: string;
  title: string;
  sellerId: string;
  sellerName: string;
  sellerHandle: string;
  sellerAvatar: string;
  sellerFollowers: string;
  location: string;
  price: number;
  tag: string;
  size: string;
  imageUrl: string;
}

const MOCK_LOOKBOOK_ITEMS: LookbookItem[] = [
  {
    id: 'lookbook-1',
    title: 'Monochrome Acid Wash French Terry Hoodie',
    sellerId: 'seller-1',
    sellerName: 'Void Archive Studio',
    sellerHandle: 'voidarchive',
    sellerAvatar:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
    sellerFollowers: '4.2k Followers',
    location: 'Poblacion, Davao City',
    price: 2400,
    tag: '1 of 1 Vault',
    size: 'Large',
    imageUrl:
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'lookbook-2',
    title: 'Reconstructed Distressed Vintage Denim Jacket',
    sellerId: 'seller-2',
    sellerName: 'Tagum Thrift Lab',
    sellerHandle: 'tagum.thrift.lab',
    sellerAvatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    sellerFollowers: '3.8k Followers',
    location: 'Tagum City',
    price: 1850,
    tag: 'Thrift Grail',
    size: 'Medium',
    imageUrl:
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'lookbook-3',
    title: 'Tactical Multi-Pocket Gorpcore Utility Vest',
    sellerId: 'seller-3',
    sellerName: 'Davao Atelier',
    sellerHandle: 'davao.atelier',
    sellerAvatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    sellerFollowers: '5.1k Followers',
    location: 'Digos City',
    price: 2100,
    tag: 'New Drop',
    size: 'XL',
    imageUrl:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
  },
];

export const EditorialHero: React.FC<EditorialHeroProps> = ({
  featuredDrop,
  onExploreDrop,
  onSelectBrand,
}) => {
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showSellerPopover, setShowSellerPopover] = useState<boolean>(false);

  const activeItem = MOCK_LOOKBOOK_ITEMS[activeCardIndex];

  // Auto-advance progress timer (6 seconds per slide)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setActiveCardIndex((prev) => (prev + 1) % MOCK_LOOKBOOK_ITEMS.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [isPaused, activeCardIndex]);

  const handleNextCard = () => {
    setActiveCardIndex((prev) => (prev + 1) % MOCK_LOOKBOOK_ITEMS.length);
  };

  const handlePrevCard = () => {
    setActiveCardIndex(
      (prev) => (prev - 1 + MOCK_LOOKBOOK_ITEMS.length) % MOCK_LOOKBOOK_ITEMS.length
    );
  };

  return (
    <section className="bg-[#FFF9E9] border border-[#E6DCC0] rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-12 my-3 sm:my-6 font-sans shadow-sm relative overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-14 items-center">
        {/* Left Column: Clean Editorial Copy & Primary Action */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6 order-2 lg:order-1">
          <div className="space-y-2">
            <h1 className="font-cooper text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1A2225] leading-[1.08]">
              Local finds. Your style.
            </h1>
            <p className="text-xs sm:text-sm font-semibold tracking-wider text-[#55615D] uppercase font-sans">
              Davao Region Fashion Archive
            </p>
          </div>

          <p className="text-[#39464A] text-xs sm:text-sm font-sans leading-relaxed max-w-md">
            Independent Davao clothing creators, artisan denim reworkers, and authenticated vintage archives across Davao City, Tagum, Digos, Panabo, and Mati.
          </p>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1">
            <button
              onClick={() => onExploreDrop(featuredDrop?.id || 'drop-1')}
              className="px-5 py-3 sm:px-6 sm:py-3.5 bg-[#1A2225] hover:bg-[#252E31] text-[#FFF9E9] text-xs sm:text-sm font-semibold rounded-full transition-all flex items-center gap-2 shadow-md hover:scale-[1.02] cursor-pointer"
            >
              <span>Explore Featured Drop</span>
              <ArrowUpRight className="w-4 h-4 text-[#FFF9E9]" />
            </button>

            <button
              onClick={() => onSelectBrand('seller-1')}
              className="text-xs sm:text-sm font-semibold text-[#1A2225] hover:text-[#4A575B] transition-colors flex items-center gap-1.5 cursor-pointer underline underline-offset-4 py-2"
            >
              <MapIcon className="w-4 h-4 text-[#1A2225]" />
              <span>Davao Brand Directory</span>
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Photography with Progress Rail */}
        <div className="lg:col-span-7 order-1 lg:order-2">
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => {
              setIsPaused(false);
              setShowSellerPopover(false);
            }}
            className="relative aspect-[16/10] sm:aspect-[4/3] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-[#F3ECD8] border border-[#E6DCC0] shadow-sm group"
          >
            {/* Main Photography with Smooth Crossfade */}
            <AnimatePresence mode="wait">
              <motion.img
                key={activeItem.id}
                src={activeItem.imageUrl}
                alt={activeItem.title}
                initial={{ opacity: 0, scale: 1.01 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
              />
            </AnimatePresence>

            {/* Top Auto-Advancing 6-Second Progress Bars Rail */}
            <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 z-20 flex items-center gap-1.5 sm:gap-2">
              {MOCK_LOOKBOOK_ITEMS.map((item, idx) => {
                const isActive = idx === activeCardIndex;
                const isPast = idx < activeCardIndex;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveCardIndex(idx)}
                    className="flex-1 h-1 bg-[#1A2225]/40 backdrop-blur-md rounded-full overflow-hidden cursor-pointer"
                    aria-label={`Go to slide ${idx + 1}`}
                  >
                    {isActive ? (
                      <motion.div
                        key={`progress-${idx}-${isPaused ? 'paused' : 'running'}`}
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{
                          duration: isPaused ? 0 : 6,
                          ease: 'linear',
                        }}
                        className="h-full bg-[#FFF9E9] rounded-full"
                      />
                    ) : (
                      <div
                        className={`h-full rounded-full ${
                          isPast ? 'bg-[#FFF9E9]' : 'bg-transparent'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Top Tag & Prev/Next Controls Capsule */}
            <div className="absolute top-6 left-3 right-3 sm:top-8 sm:left-4 sm:right-4 flex items-center justify-between z-10">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1 bg-[#1A2225]/90 backdrop-blur-md text-[#FFF9E9] text-[11px] sm:text-xs font-semibold rounded-full shadow-sm">
                <CustomTagIcon className="w-3.5 h-3.5 text-[#FFF9E9]" />
                <span>{activeItem.tag}</span>
              </span>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={handlePrevCard}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1A2225]/70 backdrop-blur-md text-[#FFF9E9] hover:bg-[#1A2225] flex items-center justify-center transition-colors border border-[#FFF9E9]/20 cursor-pointer"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextCard}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1A2225]/70 backdrop-blur-md text-[#FFF9E9] hover:bg-[#1A2225] flex items-center justify-center transition-colors border border-[#FFF9E9]/20 cursor-pointer"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bottom Floating Details Pill */}
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 z-20 bg-[#FBF4E4]/95 backdrop-blur-md p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-[#E6DCC0] shadow-lg flex items-center justify-between gap-2.5 sm:gap-3">
              <div className="truncate max-w-[62%] relative">
                <h3 className="font-cooper text-xs sm:text-base font-bold text-[#1A2225] truncate">
                  {activeItem.title}
                </h3>
                <div className="flex items-center gap-1 text-[10px] sm:text-xs text-[#55615D] font-sans mt-0.5 truncate">
                  <button
                    onMouseEnter={() => setShowSellerPopover(true)}
                    onClick={() => onSelectBrand(activeItem.sellerId)}
                    className="font-bold text-[#1A2225] hover:underline cursor-pointer truncate"
                  >
                    @{activeItem.sellerHandle}
                  </button>
                  <span className="hidden xs:inline">• {activeItem.location}</span>
                </div>

                {/* Interactive Seller Profile Popover */}
                <AnimatePresence>
                  {showSellerPopover && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute bottom-full left-0 mb-3 w-64 bg-[#1A2225]/95 text-[#FFF9E9] p-4 rounded-2xl shadow-2xl z-30 border border-[#FFF9E9]/20 space-y-3 font-sans"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={activeItem.sellerAvatar}
                          alt={activeItem.sellerName}
                          className="w-10 h-10 rounded-full object-cover border border-[#FFF9E9]/30"
                        />
                        <div>
                          <div className="font-outfit font-bold text-sm text-[#FFF9E9] flex items-center gap-1">
                            <span>{activeItem.sellerName}</span>
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#FFF9E9]" />
                          </div>
                          <div className="text-[11px] text-[#E0DFC8]">
                            @{activeItem.sellerHandle} • {activeItem.sellerFollowers}
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-[#E0DFC8] border-t border-[#FFF9E9]/15 pt-2 flex items-center justify-between">
                        <span className="text-[11px] text-[#E0DFC8]">{activeItem.location}</span>
                        <button
                          onClick={() => onSelectBrand(activeItem.sellerId)}
                          className="px-3 py-1 bg-[#FFF9E9] text-[#1A2225] rounded-full text-[11px] font-bold flex items-center gap-1 hover:bg-[#F3ECD8] transition-colors cursor-pointer"
                        >
                          <span>Storefront</span>
                          <CustomStoreIcon className="w-3 h-3" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <span className="font-cooper text-sm sm:text-lg font-bold text-[#1A2225]">
                  ₱{activeItem.price.toLocaleString()}
                </span>
                <button
                  onClick={() => onSelectBrand(activeItem.sellerId)}
                  className="px-3 py-1.5 sm:px-3.5 sm:py-1.5 bg-[#1A2225] hover:bg-[#1A2225]/90 text-[#FFF9E9] rounded-full text-[11px] sm:text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Inspect</span>
                  <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
