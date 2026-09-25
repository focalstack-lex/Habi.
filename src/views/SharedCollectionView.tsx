import React from 'react';
import { ArrowLeft, Layers, Shirt } from 'lucide-react';
import type { Product } from '../types/fashion';
import { catalogService } from '../services/catalogService';
import { ProductGrid } from '../components/feed/ProductGrid';
import { Button } from '../components/common/FormControls';

interface SharedCollectionViewProps {
  kind: 'board' | 'closet';
  name: string;
  productIds: string[];
  onSelectProduct: (product: Product) => void;
  onSelectSeller: (sellerId: string) => void;
  onBack: () => void;
}

/** Read-only page for `#/board/...` and `#/closet` share links. */
export const SharedCollectionView: React.FC<SharedCollectionViewProps> = ({
  kind,
  name,
  productIds,
  onSelectProduct,
  onSelectSeller,
  onBack,
}) => {
  const visible = catalogService.getVisibleProducts();
  const products = productIds
    .map((id) => visible.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product));
  const missing = productIds.length - products.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 font-sans space-y-4 sm:space-y-6">
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 text-white p-5 sm:p-8 lg:p-12 rounded-2xl sm:rounded-3xl border border-zinc-800/80 shadow-xl space-y-2 sm:space-y-3">
        <div className="font-avantgarde text-[11px] tracking-wider uppercase text-zinc-400 font-semibold flex items-center gap-2">
          {kind === 'board' ? <Layers className="w-3.5 h-3.5" /> : <Shirt className="w-3.5 h-3.5" />}
          <span>{kind === 'board' ? 'SHARED OUTFIT BOARD' : 'SHARED CLOSET'}</span>
        </div>
        <h1 className="font-cooper text-2xl sm:text-3xl lg:text-5xl font-bold tracking-tight break-words">{name}</h1>
        <p className="text-zinc-300 text-xs sm:text-sm lg:text-base max-w-2xl leading-relaxed">
          {products.length} {products.length === 1 ? 'piece' : 'pieces'} from Davao sellers
          {missing > 0 ? `, ${missing} no longer listed` : ''}. Tap a piece to see details or inquire.
        </p>
        <div className="pt-1">
          <Button type="button" variant="inverse" onClick={onBack} className="px-4 py-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Habi feed</span>
          </Button>
        </div>
      </div>

      <ProductGrid products={products} onSelectProduct={onSelectProduct} onSelectSeller={onSelectSeller} />
    </div>
  );
};
