import React from 'react';
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
  const [isSaved, setIsSaved] = React.useState<boolean>(() =>
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
      className="group bg-white rounded-2xl border border-zinc-200 overflow-hidden cursor-pointer hover:border-zinc-900 transition-all duration-300 flex flex-col justify-between"
    >
      {/* Top Image Container */}
      <div className="relative aspect-[3/4] bg-zinc-100 overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1">
          {product.isOneOfOne && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-950 text-white font-mono text-[10px] uppercase font-bold tracking-wider rounded-md shadow-sm">
              <Tag className="w-3 h-3" />
              <span>1-of-1 Thrift</span>
            </span>
          )}
          <span className="px-2 py-0.5 bg-white/95 text-zinc-900 backdrop-blur-sm font-mono text-[10px] font-bold rounded-md border border-zinc-200">
            {product.condition}
          </span>
        </div>

        {/* Save Wishlist Button */}
        <button
          onClick={handleSaveClick}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
            isSaved
              ? 'bg-zinc-950 text-white'
              : 'bg-white/80 text-zinc-700 hover:bg-white hover:text-zinc-950'
          }`}
          aria-label="Save item"
        >
          <Bookmark className="w-4 h-4 fill-current" />
        </button>

        {/* Bottom Size Badge Overlay */}
        <div className="absolute bottom-3 left-3 bg-zinc-950/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-md font-mono text-[11px] font-medium">
          Size: {product.size}
        </div>
      </div>

      {/* Card Details Body */}
      <div className="p-4 space-y-3 font-sans">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-mono text-sm font-bold text-zinc-900 truncate tracking-tight group-hover:text-zinc-700 transition-colors">
              {product.name}
            </h3>
          </div>
          <p className="font-mono text-base font-black text-zinc-950 mt-0.5">
            ₱{product.price.toLocaleString()}
          </p>
        </div>

        {/* Seller Info Mini Row */}
        <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500 font-mono">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onSelectSeller) onSelectSeller(product.sellerId);
            }}
            className="flex items-center gap-2 hover:text-zinc-900 transition-colors truncate"
          >
            <img
              src={product.sellerLogo}
              alt={product.sellerName}
              className="w-5 h-5 rounded-full object-cover shrink-0 border border-zinc-200"
            />
            <span className="font-medium text-zinc-800 truncate">{product.sellerName}</span>
          </button>

          <div className="flex items-center gap-1 shrink-0 text-zinc-400 text-[11px]">
            <MapPin className="w-3 h-3" />
            <span className="truncate max-w-[100px]">{product.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
