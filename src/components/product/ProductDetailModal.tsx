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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-black/75 backdrop-blur-md animate-fade-in font-sans overflow-y-auto">
        <div
          className="fixed inset-0"
          onClick={onClose}
        />

        <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden z-10 my-auto">
          {/* Close Floating Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2.5 bg-white/90 backdrop-blur-md text-zinc-900 rounded-full hover:bg-white border border-zinc-200 transition-all shadow-md"
            aria-label="Close detail modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12 max-h-[90vh] overflow-y-auto">
            {/* Left Column: Image Carousel / Main Photo */}
            <div className="md:col-span-6 bg-zinc-100 p-6 flex flex-col justify-between space-y-4">
              <div className="relative aspect-[3/4] bg-white rounded-2xl overflow-hidden border border-zinc-200">
                <img
                  src={product.images[selectedImageIndex] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />

                {product.isOneOfOne && (
                  <div className="absolute top-3 left-3 bg-zinc-950 text-white font-mono text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-md shadow-sm flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    <span>1-of-1 Thrift Archive</span>
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
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                        selectedImageIndex === idx ? 'border-zinc-950 scale-95' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Product Specifications & Direct Inquiry */}
            <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6 font-sans">
              <div className="space-y-4">
                {/* Category & Condition Metadata Badges */}
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="px-2.5 py-1 bg-zinc-100 text-zinc-900 font-bold rounded-md uppercase tracking-wider text-[10px] border border-zinc-200">
                    {product.category}
                  </span>
                  <span className="px-2.5 py-1 bg-zinc-100 text-zinc-800 font-bold rounded-md uppercase tracking-wider text-[10px] border border-zinc-200">
                    Condition: {product.condition}
                  </span>
                </div>

                <div>
                  <h1 className="font-mono text-2xl font-black text-zinc-950 tracking-tight leading-tight">
                    {product.name}
                  </h1>
                  <div className="text-2xl font-black text-zinc-950 font-mono mt-1">
                    ₱{product.price.toLocaleString()}
                  </div>
                </div>

                {/* Size & Location Specification Grid */}
                <div className="grid grid-cols-2 gap-3 py-3 border-y border-zinc-200 font-mono text-xs">
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-bold">Size</span>
                    <span className="font-bold text-zinc-900 text-sm">{product.size}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-bold">Location</span>
                    <span className="font-bold text-zinc-900 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{product.location}</span>
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Piece Description
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
                    className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 flex items-center justify-between cursor-pointer hover:border-zinc-900 transition-all font-mono group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={seller.logoUrl}
                        alt={seller.name}
                        className="w-10 h-10 rounded-full object-cover border border-zinc-200"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-zinc-900 group-hover:underline">
                            {seller.name}
                          </span>
                          <ShieldCheck className="w-3.5 h-3.5 text-zinc-900" />
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
                  className="w-full py-3.5 px-6 bg-zinc-950 hover:bg-zinc-800 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Inquire / Reserve via Instant Message</span>
                </button>

                <button
                  onClick={handleToggleSave}
                  className={`w-full py-3 px-6 rounded-full text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                    isSaved
                      ? 'bg-zinc-950 text-white border-zinc-950'
                      : 'bg-white text-zinc-900 border-zinc-300 hover:border-zinc-900'
                  }`}
                >
                  <Bookmark className="w-4 h-4 fill-current" />
                  <span>{isSaved ? 'Saved to Wishlist' : 'Save to Wishlist'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-modal for formatted instant message inquiry */}
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
