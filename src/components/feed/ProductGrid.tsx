import React from 'react';
import { ProductCard } from './ProductCard';
import type { Product } from '../../types/fashion';
import { DiscoverIcon } from '../common/CustomIcons';
import { RefreshCw } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onSelectSeller?: (sellerId: string) => void;
  onResetFilters?: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onSelectProduct,
  onSelectSeller,
  onResetFilters,
}) => {
  if (products.length === 0) {
    return (
      <div className="py-20 text-center space-y-4 bg-[#FFF9E9] rounded-2xl border border-[#E6DCC0] p-8 my-6 font-mono">
        <div className="w-12 h-12 rounded-full bg-[#F3ECD8] text-[#1A2225] flex items-center justify-center mx-auto">
          <DiscoverIcon className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-[#1A2225] uppercase">No Items Found</h3>
          <p className="text-xs text-[#55615D] max-w-sm mx-auto font-sans">
            No local Davao pieces match your selected city or aesthetic filter. Try resetting your search filters.
          </p>
        </div>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1A2225] text-[#FFF9E9] rounded-full text-xs font-bold hover:bg-[#1A2225]/90 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 my-4 sm:my-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onSelectProduct={onSelectProduct}
          onSelectSeller={onSelectSeller}
        />
      ))}
    </div>
  );
};
