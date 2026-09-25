import React, { useState } from 'react';
import { CustomTagIcon, SavedIcon, MapIcon } from '../common/CustomIcons';
import type { Product } from '../../types/fashion';
import { storageService } from '../../services/storageService';
import { catalogService } from '../../services/catalogService';
import { userPrefsService } from '../../services/userPrefsService';
import { useI18n } from '../../i18n';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onSelectSeller?: (sellerId: string) => void;
  onToggleSave?: (productId: string) => void;
  /** Shows a "New" ribbon, used by the Following feed for pieces added since the last visit. */
  isNew?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onSelectSeller,
  onToggleSave,
  isNew = false,
}) => {
  const { t } = useI18n();
  const [isSaved, setIsSaved] = useState<boolean>(() =>
    storageService.isProductSaved(product.id)
  );
  const [imageFailed, setImageFailed] = useState<boolean>(false);

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = storageService.toggleSaveProduct(product.id);
    setIsSaved(newStatus);
    catalogService.recordProductSave(product.id, newStatus ? 1 : -1);
    if (newStatus) userPrefsService.snapshotSaved(product);
    else userPrefsService.removeSnapshot(product.id);
    if (onToggleSave) onToggleSave(product.id);
  };

  const isUnavailable = product.status !== 'Available';

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="group cursor-pointer flex flex-col font-sans min-w-0"
    >
      {/* Image */}
      <div className="relative aspect-[4/5] bg-zinc-100 rounded-xl overflow-hidden">
        {imageFailed ? (
          <div className="w-full h-full flex items-center justify-center text-zinc-300">
            <CustomTagIcon className="w-8 h-8" />
          </div>
        ) : (
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className={`w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ${isUnavailable ? 'opacity-70' : ''}`}
          />
        )}

        {/* One badge at most: New wins over 1 of 1 */}
        {(isNew || product.isOneOfOne) && (
          <span
            className={`absolute top-2 left-2 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-sm ${
              isNew ? 'bg-emerald-500 text-white uppercase tracking-wide' : 'bg-zinc-950/85 backdrop-blur-md text-white'
            }`}
          >
            {!isNew && <CustomTagIcon className="w-2.5 h-2.5 text-white" />}
            <span>{isNew ? t('feed.new') : t('detail.oneOfOne')}</span>
          </span>
        )}

        {/* Save */}
        <button
          onClick={handleSaveClick}
          className={`absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all shadow-sm ${
            isSaved
              ? 'bg-zinc-950 text-white'
              : 'bg-white/90 backdrop-blur-md text-zinc-700 hover:bg-white hover:text-zinc-950'
          }`}
          aria-label={isSaved ? t('common.saved') : t('common.save')}
          aria-pressed={isSaved}
        >
          <SavedIcon className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Status ribbon for reserved or sold pieces */}
        {isUnavailable && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-white/95 text-zinc-800 text-[10px] font-bold uppercase tracking-wide shadow-sm">
            {product.status}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="pt-2 px-0.5 space-y-0.5 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-bold text-zinc-950 tracking-tight">
            ₱{product.price.toLocaleString()}
          </span>
          <span className="text-[10px] sm:text-[11px] text-zinc-500 truncate">{product.condition}</span>
        </div>

        <h3 className="text-xs sm:text-[13px] font-medium text-zinc-800 leading-snug line-clamp-1 group-hover:text-zinc-950">
          {product.name}
        </h3>

        <div className="text-[11px] text-zinc-500 truncate">
          Size {product.size} · <span className="capitalize">{product.category}</span>
        </div>

        {/* Seller */}
        <div className="flex items-center gap-1.5 pt-1 text-[11px] text-zinc-500 min-w-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onSelectSeller) onSelectSeller(product.sellerId);
            }}
            className="flex items-center gap-1 min-w-0 hover:text-zinc-950 transition-colors"
          >
            <img
              src={product.sellerLogo}
              alt={product.sellerName}
              className="w-4 h-4 rounded-full object-cover shrink-0"
            />
            <span className="font-semibold text-zinc-700 truncate">{product.sellerName}</span>
          </button>
          <span className="flex items-center gap-0.5 shrink-0 max-w-[45%]">
            <MapIcon className="w-2.5 h-2.5 shrink-0" />
            <span className="truncate">{product.location}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
