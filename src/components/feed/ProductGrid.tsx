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
  /** Ids that get a "New" ribbon (Following feed). */
  newProductIds?: Set<string>;
  /** Custom empty-state copy, e.g. for the Following feed or the Fits me filter. */
  emptyTitle?: string;
  emptyBody?: string;
  emptyAction?: { label: string; onClick: () => void };
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onSelectProduct,
  onSelectSeller,
  onResetFilters,
  newProductIds,
  emptyTitle = 'No Items Found',
  emptyBody = 'No local Davao pieces match your selected city or aesthetic filter. Try resetting your search filters.',
  emptyAction,
}) => {
  if (products.length === 0) {
    return (
      <div className="py-10 sm:py-20 text-center space-y-4 bg-zinc-50 rounded-2xl border border-zinc-200 p-5 sm:p-8 my-4 sm:my-6 font-sans">
        <div className="w-12 h-12 rounded-full bg-zinc-200 text-zinc-900 flex items-center justify-center mx-auto">
          <DiscoverIcon className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-cooper text-base sm:text-lg font-bold text-zinc-900">{emptyTitle}</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto font-sans">{emptyBody}</p>
        </div>
        {emptyAction ? (
          <button
            onClick={emptyAction.onClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white rounded-full text-xs font-bold hover:bg-zinc-800 transition-colors"
          >
            <span>{emptyAction.label}</span>
          </button>
        ) : onResetFilters ? (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white rounded-full text-xs font-bold hover:bg-zinc-800 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-5 sm:gap-x-5 sm:gap-y-8 my-3 sm:my-5">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onSelectProduct={onSelectProduct}
          onSelectSeller={onSelectSeller}
          isNew={newProductIds?.has(product.id) ?? false}
        />
      ))}
    </div>
  );
};
