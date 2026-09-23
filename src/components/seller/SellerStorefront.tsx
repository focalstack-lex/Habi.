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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans space-y-8">
      {/* Seller Header Component */}
      <SellerHeader seller={seller} />

      {/* Storefront Navigation Capsule Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-zinc-100 rounded-full w-fit">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-5 py-2.5 text-xs font-semibold rounded-full transition-all ${
            activeTab === 'products'
              ? 'bg-zinc-950 text-white shadow-sm'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60'
          }`}
        >
          Catalog Pieces ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('drops')}
          className={`px-5 py-2.5 text-xs font-semibold rounded-full transition-all ${
            activeTab === 'drops'
              ? 'bg-zinc-950 text-white shadow-sm'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60'
          }`}
        >
          Scheduled Drops ({drops.length})
        </button>

        <button
          onClick={() => setActiveTab('info')}
          className={`px-5 py-2.5 text-xs font-semibold rounded-full transition-all ${
            activeTab === 'info'
              ? 'bg-zinc-950 text-white shadow-sm'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60'
          }`}
        >
          Store Location
        </button>
      </div>

      {/* Tab 1: Products */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <h2 className="font-outfit text-2xl font-bold text-zinc-950 tracking-tight">
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
          <h2 className="font-outfit text-2xl font-bold text-zinc-950 tracking-tight">
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
            <div className="p-12 bg-white border border-zinc-200/80 rounded-3xl text-center text-sm text-zinc-500 font-sans shadow-sm">
              No upcoming drops scheduled for this brand at the moment.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Store Info */}
      {activeTab === 'info' && (
        <div className="bg-white border border-zinc-200/80 rounded-3xl p-8 max-w-3xl space-y-6 shadow-sm font-sans">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Verification Status
            </span>
            <div className="flex items-center gap-2 text-base font-semibold text-zinc-950">
              <ShieldCheck className="w-5 h-5 text-zinc-950" />
              <span>{seller.verificationStatus}</span>
            </div>
          </div>

          <div className="space-y-2 pt-6 border-t border-zinc-100">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Physical Location & Directions
            </span>
            <div className="flex items-start gap-2.5 text-sm text-zinc-900">
              <MapPin className="w-5 h-5 text-zinc-950 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-base">{seller.location.city} ({seller.location.district})</p>
                {seller.location.address ? (
                  <p className="text-zinc-600 font-sans mt-1">{seller.location.address}</p>
                ) : (
                  <p className="text-zinc-500 font-sans mt-1">Online creator based in {seller.location.district}, {seller.location.city}.</p>
                )}
              </div>
            </div>
          </div>

          {seller.location.openingHours && (
            <div className="space-y-2 pt-6 border-t border-zinc-100">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Operating Hours
              </span>
              <div className="flex items-center gap-2.5 text-sm text-zinc-900 font-medium">
                <Clock className="w-5 h-5 text-zinc-600 shrink-0" />
                <span>{seller.location.openingHours}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
