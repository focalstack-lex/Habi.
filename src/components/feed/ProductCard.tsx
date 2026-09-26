import React, { useState } from 'react';
import { CustomTagIcon, SavedIcon, MapIcon } from '../common/CustomIcons';
import type { Product } from '../../types/fashion';
import { storageService } from '../../services/storageService';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onSelectSeller?: (sellerId: string) => void;
  onToggleSave?: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onSelectSeller,
  onToggleSave,
}) => {
  const [isSaved, setIsSaved] = useState<boolean>(() =>
    storageService.isProductSaved(product.id)
  );

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = storageService.toggleSaveProduct(product.id);
    setIsSaved(newStatus);
    if (onToggleSave) onToggleSave(product.id);
  };

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="group bg-[#FFF9E9] rounded-2xl sm:rounded-3xl border border-[#E6DCC0] p-2 sm:p-3 cursor-pointer hover:border-[#39464A] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between font-sans"
    >
      {/* Top Image Container */}
      <div className="relative aspect-[3/4] bg-[#F3ECD8] rounded-xl sm:rounded-2xl overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Floating Single Capsule Tag */}
        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-[#1A2225]/90 backdrop-blur-md text-[#FFF9E9] text-[9px] sm:text-[10px] font-semibold rounded-full shadow-sm">
            {product.isOneOfOne && <CustomTagIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#FFF9E9]" />}
            <span>{product.isOneOfOne ? `1 of 1 • ${product.condition}` : product.condition}</span>
          </span>
        </div>

        {/* Floating Wishlist Pill Button */}
        <button
          onClick={handleSaveClick}
          aria-label={isSaved ? "Remove from saved products" : "Save product"}
          className={`absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all shadow-md z-10 cursor-pointer ${
            isSaved
              ? 'bg-[#1A2225] text-[#FFF9E9]'
              : 'bg-[#F3ECD8]/95 backdrop-blur-md text-[#1A2225] hover:bg-[#1A2225] hover:text-[#FFF9E9] hover:scale-105'
          }`}
        >
          <SavedIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Floating Price Tag Capsule */}
        <div className="absolute bottom-2 right-2 sm:bottom-2.5 sm:right-2.5 bg-[#1A2225]/90 backdrop-blur-md text-[#FFF9E9] px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-cooper font-bold shadow-lg">
          ₱{product.price.toLocaleString()}
        </div>
      </div>

      {/* Card Details Body */}
      <div className="p-1.5 sm:p-2 pt-2.5 sm:pt-3 space-y-2">
        <div>
          <h3 className="font-cooper text-xs sm:text-sm font-semibold text-[#1A2225] tracking-tight leading-snug line-clamp-2 min-h-[2rem] sm:min-h-[2.25rem] group-hover:text-[#4A575B] transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center justify-between text-[10px] sm:text-xs font-avantgarde font-semibold text-[#55615D] mt-1">
            <span>Size {product.size}</span>
            <span className="capitalize truncate max-w-[75px] sm:max-w-none">{product.category}</span>
          </div>
        </div>

        {/* Seller Info Pill Row */}
        <div className="pt-1.5 sm:pt-2 border-t border-[#E6DCC0] flex items-center justify-between text-[10px] sm:text-xs text-[#55615D]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onSelectSeller) onSelectSeller(product.sellerId);
            }}
            className="flex items-center gap-1 sm:gap-1.5 hover:text-[#1A2225] transition-colors truncate max-w-[55%] cursor-pointer"
          >
            <img
              src={product.sellerLogo}
              alt={product.sellerName}
              className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover shrink-0 border border-[#E6DCC0]"
            />
            <span className="font-medium text-[#1A2225] truncate text-[10px] sm:text-[11px]">
              {product.sellerName}
            </span>
          </button>

          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 text-[#55615D] text-[9px] sm:text-[10px]">
            <MapIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#55615D]" />
            <span className="truncate max-w-[85px] sm:max-w-[110px]">{product.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
