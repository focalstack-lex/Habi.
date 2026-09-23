import React, { useState } from 'react';
import { X, Bookmark, MapPin, Tag, MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react';
import type { Product, Seller } from '../../types/fashion';
import { storageService } from '../../services/storageService';
import { InstantInquiryModal } from './InstantInquiryModal';

interface ProductDetailModalProps {
  product: Product | null;
  seller: Seller | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectSeller?: (sellerId: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  seller,
  isOpen,
  onClose,
  onSelectSeller,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isInquiryOpen, setIsInquiryOpen] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(() =>
    product ? storageService.isProductSaved(product.id) : false
  );

  if (!isOpen || !product) return null;

  const handleToggleSave = () => {
    const updated = storageService.toggleSaveProduct(product.id);
    setIsSaved(updated);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-black/80 backdrop-blur-md font-sans overflow-y-auto">
        <div
          className="fixed inset-0"
          onClick={onClose}
        />

        <div className="relative w-full max-w-4xl bg-white rounded-none border border-zinc-900 shadow-2xl overflow-hidden z-10 my-auto">
          {/* Close Floating Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2.5 bg-zinc-950 text-white rounded-none hover:bg-zinc-800 border border-zinc-800 transition-all"
            aria-label="Close detail modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12 max-h-[90vh] overflow-y-auto">
            {/* Left Column: Image Carousel */}
            <div className="md:col-span-6 bg-zinc-950 p-6 flex flex-col justify-between space-y-4 border-r border-zinc-900">
              <div className="relative aspect-[3/4] bg-zinc-900 overflow-hidden border border-zinc-800">
                <img
                  src={product.images[selectedImageIndex] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />

                {product.isOneOfOne && (
                  <div className="absolute top-0 left-0 bg-white text-zinc-950 font-mono text-[9px] uppercase font-bold tracking-[0.15em] px-3 py-1.5 border-b border-r border-zinc-300 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-zinc-950" />
                    <span>1-OF-1 THRIFT ARCHIVE</span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-16 h-16 rounded-none overflow-hidden border-2 transition-all shrink-0 ${
                        selectedImageIndex === idx ? 'border-white scale-95' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Specs & Inquiry CTAs */}
            <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6 font-sans">
              <div className="space-y-5">
                {/* Category & Condition Metadata Badges */}
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="px-3 py-1 bg-zinc-100 text-zinc-950 font-bold rounded-none uppercase tracking-wider text-[10px] border border-zinc-300">
                    {product.category}
                  </span>
                  <span className="px-3 py-1 bg-zinc-100 text-zinc-800 font-bold rounded-none uppercase tracking-wider text-[10px] border border-zinc-300">
                    CONDITION: {product.condition}
                  </span>
                </div>

                <div>
                  <h1 className="font-syne text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight leading-tight uppercase">
                    {product.name}
                  </h1>
                  <div className="text-2xl font-black text-zinc-950 font-mono mt-2">
                    ₱{product.price.toLocaleString()}
                  </div>
                </div>

                {/* Size & Location Specification Grid */}
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-zinc-200 font-mono text-xs">
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-bold tracking-widest">SIZE</span>
                    <span className="font-bold text-zinc-950 text-sm mt-0.5 block">{product.size}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-bold tracking-widest">LOCATION</span>
                    <span className="font-bold text-zinc-950 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{product.location}</span>
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1.5">
                    PIECE DESCRIPTION
                  </h3>
                  <p className="text-xs text-zinc-700 leading-relaxed font-sans">
                    {product.description}
                  </p>
                </div>

                {/* Seller Mini Storefront Card */}
                {seller && (
                  <div
                    onClick={() => {
                      if (onSelectSeller) onSelectSeller(seller.id);
                      onClose();
                    }}
                    className="p-4 bg-zinc-50 rounded-none border border-zinc-200 flex items-center justify-between cursor-pointer hover:border-zinc-950 transition-all font-mono group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={seller.logoUrl}
                        alt={seller.name}
                        className="w-10 h-10 rounded-none object-cover border border-zinc-300"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-syne font-bold text-xs text-zinc-950 group-hover:underline uppercase">
                            {seller.name}
                          </span>
                          <ShieldCheck className="w-3.5 h-3.5 text-zinc-950" />
                        </div>
                        <span className="text-[11px] text-zinc-500 block">
                          @{seller.handle} • {seller.location.district}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </div>

              {/* Bottom CTAs */}
              <div className="space-y-3 pt-4 border-t border-zinc-200 font-mono">
                <button
                  onClick={() => setIsInquiryOpen(true)}
                  className="w-full py-4 px-6 bg-zinc-950 hover:bg-zinc-800 text-white rounded-none text-xs font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>INQUIRE / RESERVE VIA MESSAGE</span>
                </button>

                <button
                  onClick={handleToggleSave}
                  className={`w-full py-3 px-6 rounded-none text-xs font-bold uppercase tracking-wider transition-all border flex items-center justify-center gap-2 ${
                    isSaved
                      ? 'bg-zinc-950 text-white border-zinc-950'
                      : 'bg-white text-zinc-950 border-zinc-300 hover:border-zinc-950'
                  }`}
                >
                  <Bookmark className="w-4 h-4 fill-current" />
                  <span>{isSaved ? 'SAVED TO WISHLIST' : 'SAVE TO WISHLIST'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instant Message Inquiry Modal */}
      {seller && (
        <InstantInquiryModal
          product={product}
          seller={seller}
          isOpen={isInquiryOpen}
          onClose={() => setIsInquiryOpen(false)}
        />
      )}
    </>
  );
};
