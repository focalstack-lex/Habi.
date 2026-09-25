import React from 'react';
import { History } from 'lucide-react';
import type { Product } from '../../types/fashion';
import { useI18n } from '../../i18n';

interface RecentlyViewedStripProps {
  products: Product[];
  onSelect: (product: Product) => void;
}

export const RecentlyViewedStrip: React.FC<RecentlyViewedStripProps> = ({ products, onSelect }) => {
  const { t } = useI18n();
  if (products.length === 0) return null;

  return (
    <section className="pt-4 sm:pt-6 pb-2 font-sans">
      <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2.5">
        <History className="w-3.5 h-3.5" />
        <span>{t('feed.recentlyViewed')}</span>
      </div>
      <div className="flex items-stretch gap-2.5 sm:gap-3 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
        {products.map((product) => (
          <button
            key={product.id}
            type="button"
            onClick={() => onSelect(product)}
            className="shrink-0 w-28 sm:w-36 text-left group"
          >
            <div className="aspect-[3/4] bg-zinc-100 rounded-xl sm:rounded-2xl overflow-hidden border border-zinc-200/80">
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="mt-1.5 text-[11px] sm:text-xs font-semibold text-zinc-900 truncate">{product.name}</div>
            <div className="text-[11px] text-zinc-600">₱{product.price.toLocaleString()}</div>
          </button>
        ))}
      </div>
    </section>
  );
};
