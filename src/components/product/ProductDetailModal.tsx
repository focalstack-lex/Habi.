import React, { useState, useEffect } from 'react';
import { ArrowLeft, Share2, Bookmark, MapPin, Tag, MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react';
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
  const [shareNote, setShareNote] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>(product?.sizes?.[0] ?? product?.size ?? '');
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);

  useEffect(() => {
    setSelectedImageIndex(0);
    setSelectedSize(product?.sizes?.[0] ?? product?.size ?? '');
    setSelectedQuantity(1);
    setShareNote('');
    setIsSaved(product ? storageService.isProductSaved(product.id) : false);
  }, [product?.id]);

  if (!isOpen || !product) return null;

  const isSingle = product.isOneOfOne;
  const sizes = product.sizes ?? [product.size];
  const canSelectSize = !isSingle && sizes.length > 1;
  const canSetQuantity = !isSingle && product.availableQuantity > 1;
  const colourways = product.colourways ?? [];

  const handleToggleSave = () => {
    const updated = storageService.toggleSaveProduct(product.id);
    setIsSaved(updated);
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Found on Habi: ${product.name}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // The user dismissed the native share sheet. Not an error, so nothing is reported.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareNote('Link copied');
      window.setTimeout(() => setShareNote(''), 2000);
    } catch {
      setShareNote('Copy failed');
      window.setTimeout(() => setShareNote(''), 2000);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-stretch md:items-center justify-center p-0 md:p-6 lg:p-10 bg-black/80 backdrop-blur-md font-sans md:overflow-y-auto">
        <div
          className="fixed inset-0"
          onClick={onClose}
        />

        <div className="relative w-full max-w-4xl bg-white rounded-3xl md:border md:border-zinc-200 md:shadow-2xl overflow-hidden z-10 flex flex-col h-full md:h-auto md:my-auto md:max-h-[90vh]">
          {/* Header Action Row: Back, Share, Save */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-start justify-between p-3 sm:p-4 pointer-events-none">
            <button
              type="button"
              onClick={onClose}
              className="pointer-events-auto w-10 h-10 rounded-full bg-white/95 backdrop-blur-md text-zinc-950 border border-zinc-200/80 shadow-md flex items-center justify-center hover:scale-105 transition-all"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="pointer-events-auto w-10 h-10 rounded-full bg-white/95 backdrop-blur-md text-zinc-950 border border-zinc-200/80 shadow-md flex items-center justify-center hover:scale-105 transition-all"
                aria-label="Share this piece"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleToggleSave}
                className={`pointer-events-auto w-10 h-10 rounded-full flex items-center justify-center border shadow-md transition-all hover:scale-105 ${
                  isSaved
                    ? 'bg-zinc-950 text-white border-zinc-950'
                    : 'bg-white/95 text-zinc-950 border-zinc-200/80'
                }`}
                aria-label={isSaved ? 'Remove from saved' : 'Save this piece'}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {shareNote && (
            <div
              role="status"
              className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-zinc-950 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg"
            >
              {shareNote}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-12 overflow-y-auto flex-1">
            {/* Left Column: Image Carousel */}
            <div className="md:col-span-6 bg-zinc-950 p-6 flex flex-col justify-between space-y-4 border-r border-zinc-900">
              <div className="relative aspect-[3/4] bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800">
                <img
                  src={product.images[selectedImageIndex] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />

                {product.isOneOfOne && (
                  <div className="absolute top-3 left-3 bg-zinc-950/90 backdrop-blur-md text-white text-[10px] font-semibold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5 border border-white/20">
                    <Tag className="w-3 h-3 text-white" />
                    <span>1 of 1 Thrift Archive</span>
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
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                        selectedImageIndex === idx ? 'border-white scale-95 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
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
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-zinc-100 text-zinc-900 font-semibold rounded-full text-xs">
                    {product.category}
                  </span>
                  <span className="px-3 py-1 bg-zinc-100 text-zinc-700 font-semibold rounded-full text-xs">
                    {product.condition}
                  </span>
                </div>

                <div>
                  <h1 className="font-outfit text-2xl sm:text-3xl font-bold text-zinc-950 tracking-tight leading-snug">
                    {product.name}
                  </h1>
                  <div className="text-2xl font-bold text-zinc-950 mt-1">
                    ₱{product.price.toLocaleString()}
                  </div>
                </div>

                {/* Size & Location Specification Grid */}
                <div className="grid grid-cols-2 gap-4 py-3.5 border-y border-zinc-100 text-xs">
                  <div>
                    <span className="text-zinc-400 block text-[11px] font-medium">Standard Size</span>
                    <span className="font-bold text-zinc-900 text-sm mt-0.5 block">{product.size}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[11px] font-medium">Location</span>
                    <span className="font-semibold text-zinc-900 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{product.location}</span>
                    </span>
                  </div>
                </div>

                {/* Conditional Variant Block */}
                {isSingle ? (
                  <div className="flex items-center gap-2.5 py-2">
                    <span className="px-3 py-1 bg-zinc-950 text-white text-xs font-semibold rounded-full">
                      1 of 1
                    </span>
                    <span className="text-xs text-zinc-500">
                      Single piece archive
                    </span>
                  </div>
                ) : (
                  <div className="space-y-4 py-2 border-b border-zinc-100 font-sans">
                    {canSelectSize && (
                      <div className="space-y-2">
                        <span className="text-xs text-zinc-500 font-medium block">
                          Select Size:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {sizes.map((sizeOption) => {
                            const isSelected = selectedSize === sizeOption;
                            return (
                              <button
                                key={sizeOption}
                                type="button"
                                onClick={() => setSelectedSize(sizeOption)}
                                className={`w-10 h-10 rounded-full text-xs font-semibold border flex items-center justify-center transition-all ${
                                  isSelected
                                    ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm'
                                    : 'bg-zinc-50 text-zinc-800 border-zinc-200 hover:border-zinc-400'
                                }`}
                              >
                                {sizeOption}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {colourways.length > 1 && (
                      <div className="space-y-2">
                        <span className="text-xs text-zinc-500 font-medium block">
                          Colourways:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {colourways.map((colourway) => (
                            <span
                              key={colourway.name}
                              title={colourway.name}
                              className="w-7 h-7 rounded-full border-2 border-white shadow-sm"
                              style={{ backgroundColor: colourway.hex ?? '#f4f4f5' }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {canSetQuantity && (
                      <div className="space-y-2">
                        <span className="text-xs text-zinc-500 font-medium block">
                          Quantity:
                        </span>
                        <div className="inline-flex items-center bg-zinc-100 rounded-full px-2 py-1">
                          <button
                            type="button"
                            onClick={() => setSelectedQuantity((q) => Math.max(1, q - 1))}
                            disabled={selectedQuantity <= 1}
                            aria-label="Decrease quantity"
                            className="w-7 h-7 rounded-full bg-white flex items-center justify-center font-bold text-zinc-950 disabled:text-zinc-300 shadow-xs"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-zinc-950">
                            {selectedQuantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedQuantity((q) => Math.min(product.availableQuantity, q + 1))
                            }
                            disabled={selectedQuantity >= product.availableQuantity}
                            aria-label="Increase quantity"
                            className="w-7 h-7 rounded-full bg-white flex items-center justify-center font-bold text-zinc-950 disabled:text-zinc-300 shadow-xs"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-xs text-zinc-400 ml-2 inline-block">
                          ({product.availableQuantity} available)
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Description */}
                <div>
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1">
                    Description
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed font-sans">
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
                    className="p-3.5 bg-zinc-50/80 rounded-2xl border border-zinc-200/80 flex items-center justify-between cursor-pointer hover:bg-zinc-100/80 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={seller.logoUrl}
                        alt={seller.name}
                        className="w-10 h-10 rounded-full object-cover border border-zinc-200"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-outfit font-bold text-xs text-zinc-950 group-hover:underline">
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
            </div>
          </div>

          {/* Pinned Primary Action */}
          <div className="border-t border-zinc-100 bg-white p-4 sheet-safe shrink-0 font-sans">
            <button
              type="button"
              onClick={() => setIsInquiryOpen(true)}
              disabled={product.status !== 'Available'}
              className={`w-full py-3.5 px-6 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-[1.01] ${
                product.status === 'Available'
                  ? 'bg-zinc-950 hover:bg-zinc-800 text-white'
                  : 'bg-zinc-300 text-zinc-600 cursor-not-allowed'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>
                {product.status === 'Available'
                  ? 'Inquire & Reserve via Message'
                  : product.status}
              </span>
            </button>
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
