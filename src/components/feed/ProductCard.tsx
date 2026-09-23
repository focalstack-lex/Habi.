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
      className="group bg-white rounded-none border border-zinc-200 overflow-hidden cursor-pointer hover:border-zinc-950 transition-all duration-300 flex flex-col justify-between"
    >
      {/* Top Image Container (Sharp 3:4 High-Fashion Aspect Ratio) */}
      <div className="relative aspect-[3/4] bg-zinc-100 overflow-hidden border-b border-zinc-200">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Rectangular Tag Ribbons Pinned to Corner (NO Pills) */}
        <div className="absolute top-0 left-0 flex flex-col items-start gap-1">
          {product.isOneOfOne && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950 text-white font-mono text-[9px] uppercase font-bold tracking-[0.15em] border-b border-r border-zinc-800">
              <Tag className="w-3 h-3 text-white" />
              <span>1-OF-1 THRIFT</span>
            </span>
          )}
          <span className="px-3 py-1 bg-white text-zinc-950 font-mono text-[9px] uppercase font-bold tracking-widest border-b border-r border-zinc-200">
            {product.condition}
          </span>
        </div>

        {/* Save Wishlist Button */}
        <button
          onClick={handleSaveClick}
          className={`absolute top-2 right-2 p-2.5 transition-all border ${
            isSaved
              ? 'bg-zinc-950 text-white border-zinc-950'
              : 'bg-white/90 text-zinc-800 border-zinc-300 hover:bg-zinc-950 hover:text-white hover:border-zinc-950'
          }`}
          aria-label="Save item"
        >
          <Bookmark className="w-4 h-4 fill-current" />
        </button>

        {/* Bottom Size Ribbon */}
        <div className="absolute bottom-0 right-0 bg-zinc-950 text-white px-3 py-1 font-mono text-[10px] uppercase font-bold tracking-widest border-t border-l border-zinc-800">
          SIZE: {product.size}
        </div>
      </div>

      {/* Card Details Body */}
      <div className="p-4 space-y-3 font-sans bg-white">
        <div>
          <h3 className="font-syne text-sm font-bold text-zinc-950 tracking-tight leading-snug line-clamp-2 group-hover:text-zinc-700 transition-colors uppercase">
            {product.name}
          </h3>
          <p className="font-mono text-base font-black text-zinc-950 mt-1">
            ₱{product.price.toLocaleString()}
          </p>
        </div>

        {/* Seller Info Row */}
        <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500 font-mono">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onSelectSeller) onSelectSeller(product.sellerId);
            }}
            className="flex items-center gap-2 hover:text-zinc-950 transition-colors truncate"
          >
            <img
              src={product.sellerLogo}
              alt={product.sellerName}
              className="w-5 h-5 rounded-none object-cover shrink-0 border border-zinc-200"
            />
            <span className="font-bold text-zinc-900 truncate uppercase text-[11px]">
              {product.sellerName}
            </span>
          </button>

          <div className="flex items-center gap-1 shrink-0 text-zinc-400 text-[10px] uppercase">
            <MapPin className="w-3 h-3 text-zinc-500" />
            <span className="truncate max-w-[90px]">{product.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
