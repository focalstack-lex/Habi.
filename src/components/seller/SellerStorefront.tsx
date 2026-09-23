import React, { useState } from 'react';
import { SellerHeader } from './SellerHeader';
import { ProductGrid } from '../feed/ProductGrid';
import { DropCard } from '../drops/DropCard';
import type { Seller, Product, Drop } from '../../types/fashion';
import { MapPin, Clock, ShieldCheck } from 'lucide-react';

interface SellerStorefrontProps {
  seller: Seller;
  products: Product[];
  drops: Drop[];
  onSelectProduct: (product: Product) => void;
  onExploreDrop: (dropId: string) => void;
}

export const SellerStorefront: React.FC<SellerStorefrontProps> = ({
  seller,
  products,
  drops,
  onSelectProduct,
  onExploreDrop,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'drops' | 'info'>('products');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* Seller Header Component */}
      <SellerHeader seller={seller} />

      {/* Storefront Navigation Tabs (Clean Text with Hairline Active Underline, NO Pills) */}
      <div className="flex items-center gap-6 border-b border-zinc-200 mb-8 font-mono">
        <button
          onClick={() => setActiveTab('products')}
          className={`py-3 text-xs uppercase font-bold tracking-[0.2em] transition-all border-b-2 -mb-px ${
            activeTab === 'products'
              ? 'border-zinc-950 text-zinc-950'
              : 'border-transparent text-zinc-500 hover:text-zinc-950'
          }`}
        >
          CATALOG PIECES ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('drops')}
          className={`py-3 text-xs uppercase font-bold tracking-[0.2em] transition-all border-b-2 -mb-px ${
            activeTab === 'drops'
              ? 'border-zinc-950 text-zinc-950'
              : 'border-transparent text-zinc-500 hover:text-zinc-950'
          }`}
        >
          SCHEDULED DROPS ({drops.length})
        </button>

        <button
          onClick={() => setActiveTab('info')}
          className={`py-3 text-xs uppercase font-bold tracking-[0.2em] transition-all border-b-2 -mb-px ${
            activeTab === 'info'
              ? 'border-zinc-950 text-zinc-950'
              : 'border-transparent text-zinc-500 hover:text-zinc-950'
          }`}
        >
          STORE LOCATION
        </button>
      </div>

      {/* Tab 1: Products */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <h2 className="font-syne text-xl font-bold uppercase tracking-tight text-zinc-950">
            Available Pieces from {seller.name}
          </h2>
          <ProductGrid
            products={products}
            onSelectProduct={onSelectProduct}
          />
        </div>
      )}

      {/* Tab 2: Drops */}
      {activeTab === 'drops' && (
        <div className="space-y-6 max-w-4xl">
          <h2 className="font-syne text-xl font-bold uppercase tracking-tight text-zinc-950">
            Upcoming Collection Releases
          </h2>
          {drops.length > 0 ? (
            drops.map((drop) => (
              <DropCard
                key={drop.id}
                drop={drop}
                onExploreDrop={onExploreDrop}
              />
            ))
          ) : (
            <div className="p-12 bg-zinc-50 border border-zinc-200 text-center font-mono text-xs text-zinc-500 uppercase tracking-widest">
              No upcoming drops scheduled for this brand at the moment.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Store Info */}
      {activeTab === 'info' && (
        <div className="bg-white border border-zinc-200 rounded-none p-8 max-w-3xl space-y-6 font-mono">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-400">
              VERIFICATION STATUS
            </span>
            <div className="flex items-center gap-2 text-sm font-bold text-zinc-950">
              <ShieldCheck className="w-5 h-5 text-zinc-950" />
              <span>{seller.verificationStatus}</span>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-zinc-200">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-400">
              PHYSICAL LOCATION & DIRECTIONS
            </span>
            <div className="flex items-start gap-2 text-xs text-zinc-900">
              <MapPin className="w-4 h-4 text-zinc-950 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{seller.location.city} ({seller.location.district})</p>
                {seller.location.address ? (
                  <p className="text-zinc-600 font-sans mt-1">{seller.location.address}</p>
                ) : (
                  <p className="text-zinc-500 font-sans mt-1">Online creator based in {seller.location.district}, {seller.location.city}.</p>
                )}
              </div>
            </div>
          </div>

          {seller.location.openingHours && (
            <div className="space-y-2 pt-4 border-t border-zinc-200">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-400">
                OPERATING HOURS
              </span>
              <div className="flex items-center gap-2 text-xs text-zinc-900 font-bold">
                <Clock className="w-4 h-4 text-zinc-700 shrink-0" />
                <span>{seller.location.openingHours}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
