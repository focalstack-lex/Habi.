import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
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

const NOTE_MS = 2000;

const headerButtonClass =
  'pointer-events-auto w-10 h-10 rounded-full flex items-center justify-center border shadow-md transition-all hover:scale-105 disabled:opacity-60 disabled:hover:scale-100';
const headerIdleClass = 'bg-white/95 backdrop-blur-md text-zinc-950 border-zinc-200/80';
const headerActiveClass = 'bg-zinc-950 text-white border-zinc-950';
const eyebrowClass = 'font-avantgarde text-[11px] tracking-wider uppercase font-semibold text-zinc-500';

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product: selectedProduct,
  seller,
  isOpen,
  onClose,
  onSelectSeller,
  onSwitchProduct,
}) => {
  useCatalogVersion();
  usePrefsVersion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const noteTimerRef = useRef<number | null>(null);
  const [isInquiryOpen, setIsInquiryOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isBoardsOpen, setIsBoardsOpen] = useState<boolean>(false);
  const [zoom, setZoom] = useState<ZoomTarget | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(() =>
    selectedProduct ? storageService.isProductSaved(selectedProduct.id) : false
  );
  const [shareNote, setShareNote] = useState<string>('');
  const [isBuildingImage, setIsBuildingImage] = useState<boolean>(false);
  const [selectedSize, setSelectedSize] = useState<string>(() => selectedProduct?.sizes?.[0] ?? selectedProduct?.size ?? '');
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);

  const productId = selectedProduct?.id;
  const defaultSize = selectedProduct?.sizes?.[0] ?? selectedProduct?.size ?? '';

  useEffect(() => {
    setSelectedSize(defaultSize);
    setSelectedQuantity(1);
    setShareNote('');
    setIsInquiryOpen(false);
    setIsGuideOpen(false);
    setIsReportOpen(false);
    setIsBoardsOpen(false);
    setZoom(null);
    setIsSaved(productId ? storageService.isProductSaved(productId) : false);
    scrollRef.current?.scrollTo({ top: 0 });
    if (productId && isOpen) {
      catalogService.recordProductView(productId);
      userPrefsService.addRecentView(productId);
    }
  }, [productId, isOpen, defaultSize]);

  useEffect(
    () => () => {
      if (noteTimerRef.current !== null) window.clearTimeout(noteTimerRef.current);
    },
    []
  );

  if (!isOpen || !selectedProduct) return null;

  // Read the live record so reservation, price, and stock changes show without reopening.
  const product = catalogService.getProductById(selectedProduct.id) ?? selectedProduct;
  const isSingle = product.isOneOfOne;
  const sizes = product.sizes ?? [product.size];
  const canSelectSize = !isSingle && sizes.length > 1;
  const canSetQuantity = !isSingle && product.availableQuantity > 1;
  const colourways = product.colourways ?? [];
  const flawPhotos = product.flawPhotos ?? [];
  const conditionNotes = product.conditionNotes?.trim() ?? '';
  const isReservedByMe = catalogService.isReservedByMe(product.id);
  const canInquire = product.status === 'Available' || isReservedByMe;
  const isOnBoard = userPrefsService.boardsContaining(product.id).length > 0;

  const showNote = (text: string) => {
    setShareNote(text);
    if (noteTimerRef.current !== null) window.clearTimeout(noteTimerRef.current);
    noteTimerRef.current = window.setTimeout(() => setShareNote(''), NOTE_MS);
  };

  const handleToggleSave = () => {
    const updated = storageService.toggleSaveProduct(product.id);
    setIsSaved(updated);
    catalogService.recordProductSave(product.id, updated ? 1 : -1);
    if (updated) userPrefsService.snapshotSaved(product);
    else userPrefsService.removeSnapshot(product.id);
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
      showNote('Link copied');
    } catch {
      showNote('Copy failed');
    }
  };

  const handleShareImage = async () => {
    if (isBuildingImage) return;
    setIsBuildingImage(true);
    try {
      await shareProductImage(product, seller);
      showNote('Image ready');
    } catch (error) {
      // Dismissing the native share sheet rejects with an AbortError; that is not a failure.
      if (!(error instanceof Error && error.name === 'AbortError')) showNote('Could not build image');
    } finally {
      setIsBuildingImage(false);
    }
  };

  const handleSwitchProduct = (next: Product) => {
    if (onSwitchProduct) onSwitchProduct(next);
  };

  const openFlawPhoto = (index: number) => {
    setZoom({ images: flawPhotos.map((flaw) => flaw.imageUrl), index });
  };

  const inquiryLabel = product.status === 'Available'
    ? 'Inquire & Reserve via Message'
    : isReservedByMe
      ? 'Message Seller to Arrange Payment'
      : product.status;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-stretch md:items-center justify-center p-0 md:p-6 lg:p-10 bg-black/80 backdrop-blur-md font-sans md:overflow-y-auto">
        <div
          className="fixed inset-0"
          onClick={onClose}
        />

        <div className="relative w-full max-w-4xl bg-white rounded-none md:rounded-3xl md:border md:border-zinc-200 md:shadow-2xl overflow-hidden z-10 flex flex-col h-full md:h-auto md:my-auto md:max-h-[90vh]">
          {/* Header Action Row: Back, Share, Share as image, Boards, Save */}
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
              className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-zinc-950 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg whitespace-nowrap"
            >
              {shareNote}
            </div>
          )}

          <div ref={scrollRef} className="grid grid-cols-1 md:grid-cols-12 overflow-y-auto flex-1">
            {/* Left Column: Swipe Gallery */}
            <div className="md:col-span-6 bg-zinc-950 p-3 sm:p-6 flex flex-col justify-between space-y-4 border-r border-zinc-900">
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
                  <span className="px-3 py-1 bg-zinc-100 text-zinc-900 font-semibold rounded-full text-xs">
                    {product.category}
                  </span>
                  <span className="px-3 py-1 bg-zinc-100 text-zinc-700 font-semibold rounded-full text-xs">
                    {product.condition}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsGuideOpen(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-500 hover:text-zinc-950 underline underline-offset-2 transition-colors"
                  >
                    <Info className="w-3 h-3" />
                    Condition guide
                  </button>
                </div>

                <div>
                  <h1 className="font-outfit text-xl sm:text-2xl lg:text-3xl font-bold text-zinc-950 tracking-tight leading-snug">
                    {product.name}
                  </h1>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl sm:text-2xl font-bold text-zinc-950">
                      ₱{product.price.toLocaleString()}
                    </span>
                    <span className="text-[11px] sm:text-xs text-zinc-400 font-medium">
                      (Inclusive of regional processing)
                    </span>
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

                {/* Garment Measurements */}
                <MeasurementsTable measurements={product.measurements} />
                {/* Consumer Protection & Return Policy Disclaimer (P2 & P3 Fix) */}
                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/70 space-y-1.5 text-xs text-zinc-600">
                  <div className="flex items-center gap-1.5 text-zinc-900 font-semibold text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Consumer Terms & Pre-Owned Sanitization</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-zinc-500">
                    1-of-1 curated vintage items are final sale. Pre-owned garments are sanitized by local Davao sellers prior to fulfillment. Independent reseller catalog listing.
                  </p>
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

                {/* Condition & Flaws */}
                <div className="space-y-2">
                  <h3 className={eyebrowClass}>Condition &amp; flaws</h3>
                  {conditionNotes ? (
                    <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed">{conditionNotes}</p>
                  ) : flawPhotos.length === 0 ? (
                    <p className="text-xs text-zinc-500">No flaws noted by the seller. Ask before reserving if condition matters to you.</p>
                  ) : null}
                  {flawPhotos.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                      {flawPhotos.map((flaw, idx) => (
                        <button
                          key={`${idx}-${flaw.imageUrl}`}
                          type="button"
                          onClick={() => openFlawPhoto(idx)}
                          aria-label={flaw.note ? `View flaw photo: ${flaw.note}` : `View flaw photo ${idx + 1}`}
                          className="shrink-0 w-20 text-left space-y-1"
                        >
                          <div className="w-20 h-20 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100">
                            <img src={flaw.imageUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                          {flaw.note && <span className="block text-[11px] text-zinc-500 truncate">{flaw.note}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Seller Mini Storefront Card */}
                {seller && (
                  <div className="space-y-2">
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
                    <button
                      type="button"
                      onClick={() => setIsReportOpen(true)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 hover:text-red-600 transition-colors"
                    >
                      <Flag className="w-3.5 h-3.5" />
                      Report listing
                    </button>
                  </div>
                )}

                {/* Similar Pieces */}
                <SimilarPiecesRow product={product} onSelect={handleSwitchProduct} />
              </div>
            </div>
          </div>

          {/* Pinned Primary Action */}
          <div className="border-t border-zinc-100 bg-white p-3 sm:p-4 sheet-safe shrink-0 font-sans space-y-3">
            {isReservedByMe && (
              <div
                role="status"
                className="flex items-start justify-between gap-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl px-3.5 py-3"
              >
                <p className="text-xs leading-relaxed">
                  Reserved by you during the drop. Message the seller to arrange payment.
                </p>
                <button
                  type="button"
                  onClick={() => catalogService.cancelReservation(product.id)}
                  className="text-xs font-semibold underline underline-offset-2 shrink-0 hover:text-emerald-800"
                >
                  Cancel reservation
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsInquiryOpen(true)}
              disabled={!canInquire}
              className={`w-full py-3.5 px-6 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-[1.01] ${
                canInquire
                  ? 'bg-zinc-950 hover:bg-zinc-800 text-white'
                  : 'bg-zinc-300 text-zinc-600 cursor-not-allowed'
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
