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

      {/* Storefront Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-zinc-200 mb-6 font-mono">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-5 py-3 text-xs uppercase font-bold tracking-wider transition-all border-b-2 -mb-px ${
            activeTab === 'products'
              ? 'border-zinc-950 text-zinc-950'
              : 'border-transparent text-zinc-500 hover:text-zinc-900'
          }`}
        >
          Catalog Items ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('drops')}
          className={`px-5 py-3 text-xs uppercase font-bold tracking-wider transition-all border-b-2 -mb-px ${
            activeTab === 'drops'
              ? 'border-zinc-950 text-zinc-950'
              : 'border-transparent text-zinc-500 hover:text-zinc-900'
          }`}
        >
          Scheduled Drops ({drops.length})
        </button>

        <button
          onClick={() => setActiveTab('info')}
          className={`px-5 py-3 text-xs uppercase font-bold tracking-wider transition-all border-b-2 -mb-px ${
            activeTab === 'info'
              ? 'border-zinc-950 text-zinc-950'
              : 'border-transparent text-zinc-500 hover:text-zinc-900'
          }`}
        >
          Store Location
        </button>
      </div>

      {/* Tab Content Display */}
      {activeTab === 'products' && (
        <div>
          <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-zinc-400 mb-4">
            Available Pieces from {seller.name}
          </h2>
          <ProductGrid
            products={products}
            onSelectProduct={onSelectProduct}
          />
        </div>
      )}

      {activeTab === 'drops' && (
        <div className="space-y-6 max-w-4xl">
          <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-zinc-400 mb-4">
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
            <div className="p-8 bg-zinc-50 border border-zinc-200 rounded-2xl text-center font-mono text-xs text-zinc-500">
              No upcoming drops scheduled for this brand at the moment.
            </div>
          )}
        </div>
      )}

      {activeTab === 'info' && (
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 max-w-3xl space-y-6 font-mono">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
              Verification Status
            </span>
            <div className="flex items-center gap-2 text-sm font-bold text-zinc-950">
              <ShieldCheck className="w-5 h-5 text-zinc-900" />
              <span>{seller.verificationStatus}</span>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-zinc-200">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
              Physical Location & Directions
            </span>
            <div className="flex items-start gap-2 text-xs text-zinc-800">
              <MapPin className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{seller.location.city} ({seller.location.district})</p>
                {seller.location.address ? (
                  <p className="text-zinc-600 font-sans mt-0.5">{seller.location.address}</p>
                ) : (
                  <p className="text-zinc-500 font-sans mt-0.5">Online creator based in {seller.location.district}, {seller.location.city}.</p>
                )}
              </div>
            </div>
          </div>

          {seller.location.openingHours && (
            <div className="space-y-2 pt-4 border-t border-zinc-200">
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                Operating Hours
              </span>
              <div className="flex items-center gap-2 text-xs text-zinc-800">
                <Clock className="w-4 h-4 text-zinc-600 shrink-0" />
                <span>{seller.location.openingHours}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
