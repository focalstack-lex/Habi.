import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Bookmark,
  BookmarkPlus,
  Flag,
  ImageDown,
  Info,
  MapPin,
  MessageSquare,
  Share2,
  ShieldCheck,
} from 'lucide-react';
import type { Product, Seller } from '../../types/fashion';
import { storageService } from '../../services/storageService';
import { catalogService } from '../../services/catalogService';
import { userPrefsService } from '../../services/userPrefsService';
import { useCatalogVersion } from '../../hooks/useCatalogVersion';
import { usePrefsVersion } from '../../hooks/usePrefsVersion';
import { shareProductImage } from '../../utils/shareCard';
import { InstantInquiryModal } from './InstantInquiryModal';
import { PinToMoodboardModal } from './PinToMoodboardModal';
import { CustomPinIcon } from '../common/CustomIcons';
import { ZoomableGallery } from './ZoomableGallery';
import { ZoomOverlay } from './ZoomOverlay';
import { MeasurementsTable } from './MeasurementsTable';
import { ConditionGuideSheet } from './ConditionGuideSheet';
import { SimilarPiecesRow } from './SimilarPiecesRow';
import { ReportListingModal } from './ReportListingModal';
import { AddToBoardSheet } from './AddToBoardSheet';

interface ProductDetailModalProps {
  product: Product | null;
  seller: Seller | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectSeller?: (sellerId: string) => void;
  /** Swaps the open piece for another one, e.g. from the similar pieces row. */
  onSwitchProduct?: (product: Product) => void;
}

interface ZoomTarget {
  images: string[];
  index: number;
}

const headerButtonClass =
  'pointer-events-auto w-10 h-10 rounded-full border shadow-md flex items-center justify-center hover:scale-105 transition-all cursor-pointer';
const headerIdleClass = 'bg-[#FFF9E9] text-[#1A2225] border-[#E6DCC0]';
const headerActiveClass = 'bg-[#1A2225] text-[#FFF9E9] border-[#1A2225]';

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  seller,
  isOpen,
  onClose,
  onSelectSeller,
  onSwitchProduct,
}) => {
  useCatalogVersion();
  usePrefsVersion();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState<boolean>(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isBoardsOpen, setIsBoardsOpen] = useState<boolean>(false);
  const [zoom, setZoom] = useState<ZoomTarget | null>(null);
  const [shareNote, setShareNote] = useState<string | null>(null);
  const [isBuildingImage, setIsBuildingImage] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (product) {
      setSelectedSize(product.size);
      setIsSaved(storageService.isProductSaved(product.id));
      catalogService.recordProductView(product.id);
    }
  }, [product]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const sizes: string[] = (product as unknown as { sizeOptions?: string[] }).sizeOptions || [product.size];
  const isSingle = sizes.length <= 1;
  const canSelectSize = sizes.length > 1;

  const handleToggleSave = () => {
    const updated = storageService.toggleSaveProduct(product.id);
    setIsSaved(updated);
  };

  const handleShare = async () => {
    const shareData = {
      title: `${product.name} | Habi Davao`,
      text: `Check out this ${product.condition} ${product.name} listed by @${product.sellerHandle} on Habi Davao.`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareNote('Link copied to clipboard');
        setTimeout(() => setShareNote(null), 2500);
      }
    } catch {
      // User cancelled share sheet
    }
  };

  const handleShareImage = async () => {
    setIsBuildingImage(true);
    setShareNote('Preparing image card...');
    try {
      await shareProductImage(product, seller);
      setShareNote(null);
    } catch (err) {
      setShareNote(err instanceof Error ? err.message : 'Could not export card');
      setTimeout(() => setShareNote(null), 3000);
    } finally {
      setIsBuildingImage(false);
    }
  };

  const openFlawPhoto = (index: number) => {
    setZoom({ images: product.images.length > 0 ? product.images : [], index });
  };

  const handleSwitchProduct = (next: Product) => {
    if (onSwitchProduct) {
      onSwitchProduct(next);
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }
  };

  const isOnBoard = userPrefsService.boardsContaining(product.id).length > 0;
  const isReservedByMe = catalogService.isReservedByMe(product.id);
  const canInquire = product.status === 'Available' || isReservedByMe;
  const inquiryLabel = isReservedByMe
    ? 'Message seller about your reservation'
    : product.status === 'Available'
    ? 'Inquire directly with seller'
    : product.status === 'Reserved'
    ? 'Reserved by another buyer'
    : 'Sold Out';

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-stretch md:items-center justify-center p-0 md:p-6 lg:p-10 bg-[#1A2225]/80 backdrop-blur-md font-sans md:overflow-y-auto">
        <div
          className="fixed inset-0"
          onClick={onClose}
        />

        <div className="relative w-full max-w-4xl bg-[#FBF4E4] rounded-none md:rounded-3xl md:border md:border-[#E6DCC0] md:shadow-2xl overflow-hidden z-10 flex flex-col h-full md:h-auto md:my-auto md:max-h-[90vh]">
          {/* Header Action Row */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-start justify-between p-3 sm:p-4 pointer-events-none">
            <button
              type="button"
              onClick={onClose}
              className={`${headerButtonClass} ${headerIdleClass}`}
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPinModalOpen(true)}
                className={`${headerButtonClass} ${headerIdleClass}`}
                aria-label="Pin to moodboard"
                title="Pin to Moodboard"
              >
                <CustomPinIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleShare}
                className={`${headerButtonClass} ${headerIdleClass}`}
                aria-label="Share this piece"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleShareImage}
                disabled={isBuildingImage}
                aria-busy={isBuildingImage}
                className={`${headerButtonClass} ${headerIdleClass}`}
                aria-label="Share as image"
              >
                <ImageDown className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsBoardsOpen(true)}
                className={`${headerButtonClass} ${isOnBoard ? headerActiveClass : headerIdleClass}`}
                aria-label="Add to a board"
              >
                <BookmarkPlus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleToggleSave}
                className={`${headerButtonClass} ${isSaved ? headerActiveClass : headerIdleClass}`}
                aria-label={isSaved ? 'Remove from saved' : 'Save this piece'}
                aria-pressed={isSaved}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {shareNote && (
            <div
              role="status"
              className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-[#1A2225] text-[#FFF9E9] text-xs font-semibold px-4 py-2 rounded-full shadow-lg whitespace-nowrap"
            >
              {shareNote}
            </div>
          )}

          <div ref={scrollRef} className="grid grid-cols-1 md:grid-cols-12 overflow-y-auto flex-1">
            {/* Left Column: Swipe Gallery */}
            <div className="md:col-span-6 bg-[#1A2225] p-3 sm:p-6 flex flex-col justify-between space-y-4 border-r border-[#1A2225]/20">
              <ZoomableGallery
                key={product.id}
                images={product.images}
                alt={product.name}
                isOneOfOne={product.isOneOfOne}
                onOpenZoom={(index) => setZoom({ images: product.images, index })}
              />
            </div>

            {/* Right Column: Specs & Inquiry CTAs */}
            <div className="md:col-span-6 p-4 sm:p-6 lg:p-8 flex flex-col justify-between space-y-4 sm:space-y-6 font-sans">
              <div className="space-y-4 sm:space-y-5">
                {/* Category & Condition Metadata Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-[#F3ECD8] text-[#1A2225] font-semibold rounded-full text-xs">
                    {product.category}
                  </span>
                  <span className="px-3 py-1 bg-[#F3ECD8] text-[#55615D] font-semibold rounded-full text-xs">
                    {product.condition}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsGuideOpen(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#55615D] hover:text-[#1A2225] underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    <Info className="w-3 h-3" />
                    Condition guide
                  </button>
                </div>

                <div>
                  <h1 className="font-outfit text-xl sm:text-2xl lg:text-3xl font-bold text-[#1A2225] tracking-tight leading-snug">
                    {product.name}
                  </h1>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl sm:text-2xl font-bold text-[#1A2225]">
                      ₱{product.price.toLocaleString()}
                    </span>
                    <span className="text-[11px] sm:text-xs text-[#55615D] font-medium">
                      (Inclusive of regional processing)
                    </span>
                  </div>
                </div>

                {/* Size & Location Specification Grid */}
                <div className="grid grid-cols-2 gap-4 py-3.5 border-y border-[#E6DCC0] text-xs">
                  <div>
                    <span className="text-[#55615D] block text-[11px] font-medium">Standard Size</span>
                    <span className="font-bold text-[#1A2225] text-sm mt-0.5 block">{product.size}</span>
                  </div>
                  <div>
                    <span className="text-[#55615D] block text-[11px] font-medium">Location</span>
                    <span className="font-semibold text-[#1A2225] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#55615D]" />
                      <span>{product.location}</span>
                    </span>
                  </div>
                </div>

                {/* Garment Measurements */}
                <MeasurementsTable measurements={product.measurements} />

                {/* Consumer Protection & Return Policy Disclaimer */}
                <div className="p-3.5 rounded-2xl bg-[#F3ECD8] border border-[#E6DCC0] space-y-1.5 text-xs text-[#55615D]">
                  <div className="flex items-center gap-1.5 text-[#1A2225] font-semibold text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#1A2225] shrink-0" />
                    <span>Consumer Terms & Pre-Owned Sanitization</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-[#55615D]">
                    1-of-1 curated vintage items are final sale. Pre-owned garments are sanitized by local Davao sellers prior to fulfillment. Independent reseller catalog listing.
                  </p>
                </div>

                {/* Conditional Variant Block */}
                {isSingle ? (
                  <div className="flex items-center gap-2.5 py-2">
                    <span className="px-3 py-1 bg-[#1A2225] text-[#FFF9E9] text-xs font-semibold rounded-full">
                      1 of 1
                    </span>
                    <span className="text-xs text-[#55615D]">
                      Single piece archive
                    </span>
                  </div>
                ) : (
                  <div className="space-y-4 py-2 border-b border-[#E6DCC0] font-sans">
                    {canSelectSize && (
                      <div className="space-y-2">
                        <span className="text-xs text-[#55615D] font-medium block">
                          Select Size:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {sizes.map((sizeOption: string) => {
                            const isSelected = selectedSize === sizeOption;
                            return (
                              <button
                                key={sizeOption}
                                type="button"
                                onClick={() => setSelectedSize(sizeOption)}
                                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#1A2225] text-[#FFF9E9] border-[#1A2225] shadow-sm'
                                    : 'bg-[#F3ECD8] text-[#1A2225] border-[#E6DCC0] hover:border-[#1A2225]'
                                }`}
                              >
                                {sizeOption}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Seller Mini Storefront Card */}
                {seller && (
                  <div className="space-y-2">
                    <div
                      onClick={() => {
                        if (onSelectSeller) onSelectSeller(seller.id);
                        onClose();
                      }}
                      className="p-3.5 bg-[#F3ECD8] rounded-2xl border border-[#E6DCC0] flex items-center justify-between cursor-pointer hover:bg-[#F3ECD8]/80 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={seller.logoUrl}
                          alt={seller.name}
                          className="w-10 h-10 rounded-full object-cover border border-[#E6DCC0]"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-outfit font-bold text-xs text-[#1A2225] group-hover:underline">
                              {seller.name}
                            </span>
                            <ShieldCheck className="w-3.5 h-3.5 text-[#1A2225]" />
                          </div>
                          <span className="text-[11px] text-[#55615D] block">
                            @{seller.handle} • {seller.location.district}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsReportOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#55615D] hover:text-red-600 transition-colors cursor-pointer"
                      >
                        <Flag className="w-3.5 h-3.5" />
                        Report listing
                      </button>
                    </div>
                  </div>
                )}

                {/* Similar Pieces */}
                <SimilarPiecesRow product={product} onSelect={handleSwitchProduct} />
              </div>
            </div>
          </div>

          {/* Pinned Primary Action */}
          <div className="border-t border-[#E6DCC0] bg-[#FBF4E4] p-3 sm:p-4 sheet-safe shrink-0 font-sans space-y-3">
            {isReservedByMe && (
              <div
                role="status"
                className="flex items-start justify-between gap-3 bg-[#F3ECD8] border border-[#E6DCC0] text-[#1A2225] rounded-2xl px-3.5 py-3"
              >
                <p className="text-xs leading-relaxed">
                  Reserved by you during the drop. Message the seller to arrange payment.
                </p>
                <button
                  type="button"
                  onClick={() => catalogService.cancelReservation(product.id)}
                  className="text-xs font-semibold underline underline-offset-2 shrink-0 hover:text-[#1A2225]/80 cursor-pointer"
                >
                  Cancel reservation
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsInquiryOpen(true)}
              disabled={!canInquire}
              className={`w-full py-3.5 px-6 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-[1.01] cursor-pointer ${
                canInquire
                  ? 'bg-[#1A2225] hover:bg-[#1A2225]/90 text-[#FFF9E9]'
                  : 'bg-[#F3ECD8] text-[#55615D] cursor-not-allowed'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>{inquiryLabel}</span>
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

      {/* Pin to Moodboard Modal */}
      <PinToMoodboardModal
        product={product}
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
      />

      {isGuideOpen && (
        <ConditionGuideSheet
          product={product}
          onClose={() => setIsGuideOpen(false)}
          onOpenFlawPhoto={openFlawPhoto}
        />
      )}

      {isReportOpen && (
        <ReportListingModal product={product} onClose={() => setIsReportOpen(false)} />
      )}

      {isBoardsOpen && (
        <AddToBoardSheet product={product} onClose={() => setIsBoardsOpen(false)} />
      )}

      {zoom && zoom.images.length > 0 && (
        <ZoomOverlay
          images={zoom.images}
          initialIndex={zoom.index}
          alt={product.name}
          onClose={() => setZoom(null)}
        />
      )}
    </>
  );
};
