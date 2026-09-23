import React from 'react';
import { ProductCard } from './ProductCard';
import type { Product } from '../../types/fashion';
import { Sparkles, RefreshCw } from 'lucide-react';

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
      <div className="py-20 text-center space-y-4 bg-zinc-50 rounded-none border border-zinc-200 p-8 my-6 font-mono">
        <div className="w-12 h-12 rounded-none bg-zinc-200 text-zinc-700 flex items-center justify-center mx-auto">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-zinc-900 uppercase">No Items Found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto font-sans">
            No local Davao pieces match your selected city or aesthetic filter. Try resetting your search filters.
          </p>
        </div>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white rounded-none text-xs font-bold hover:bg-zinc-800 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 my-6">
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
