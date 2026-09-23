import React, { useState } from 'react';
import { Bookmark, MapPin, Tag } from 'lucide-react';
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
      className="group bg-white rounded-3xl border border-zinc-200/80 p-3 cursor-pointer hover:border-zinc-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between font-sans"
    >
      {/* Top Image Container with Smooth 2xl Curves */}
      <div className="relative aspect-[3/4] bg-zinc-100 rounded-2xl overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Floating Capsule Tags */}
        <div className="absolute top-2.5 left-2.5 flex flex-col items-start gap-1.5 z-10">
          {product.isOneOfOne && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-950/90 backdrop-blur-md text-white text-[10px] font-semibold rounded-full shadow-sm">
              <Tag className="w-3 h-3 text-white" />
              <span>1 of 1</span>
            </span>
          )}
          <span className="px-2.5 py-0.5 bg-white/90 backdrop-blur-md text-zinc-900 text-[10px] font-semibold rounded-full shadow-sm border border-zinc-200/50">
            {product.condition}
          </span>
        </div>

        {/* Floating Wishlist Pill Button */}
        <button
          onClick={handleSaveClick}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md z-10 ${
            isSaved
              ? 'bg-zinc-950 text-white'
              : 'bg-white/90 backdrop-blur-md text-zinc-700 hover:bg-white hover:text-zinc-950 hover:scale-105'
          }`}
          aria-label="Save item"
        >
          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Floating Price Tag Capsule */}
        <div className="absolute bottom-2.5 right-2.5 bg-zinc-950/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          ₱{product.price.toLocaleString()}
        </div>
      </div>

      {/* Card Details Body */}
      <div className="p-2 pt-3 space-y-2.5">
        <div>
          <h3 className="font-outfit text-sm font-semibold text-zinc-950 tracking-tight leading-snug line-clamp-1 group-hover:text-zinc-700 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center justify-between text-xs text-zinc-500 mt-1">
            <span>Size {product.size}</span>
            <span className="capitalize">{product.category}</span>
          </div>
        </div>

        {/* Seller Info Pill Row */}
        <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onSelectSeller) onSelectSeller(product.sellerId);
            }}
            className="flex items-center gap-1.5 hover:text-zinc-950 transition-colors truncate max-w-[65%]"
          >
            <img
              src={product.sellerLogo}
              alt={product.sellerName}
              className="w-5 h-5 rounded-full object-cover shrink-0 border border-zinc-200"
            />
            <span className="font-medium text-zinc-800 truncate text-[11px]">
              {product.sellerName}
            </span>
          </button>

          <div className="flex items-center gap-1 shrink-0 text-zinc-400 text-[10px]">
            <MapPin className="w-3 h-3 text-zinc-400" />
            <span className="truncate max-w-[80px]">{product.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
