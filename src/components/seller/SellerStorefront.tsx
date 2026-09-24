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

      {/* Storefront Navigation Tabs */}
      <div className="flex items-center gap-8 border-b border-zinc-200/80 pb-1">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 text-xs font-avantgarde font-bold tracking-widest uppercase transition-all relative cursor-pointer ${
            activeTab === 'products'
              ? 'text-zinc-950 border-b-2 border-zinc-950 -mb-[5px]'
              : 'text-zinc-400 hover:text-zinc-700'
          }`}
        >
          Catalog Pieces ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('drops')}
          className={`pb-3 text-xs font-avantgarde font-bold tracking-widest uppercase transition-all relative cursor-pointer ${
            activeTab === 'drops'
              ? 'text-zinc-950 border-b-2 border-zinc-950 -mb-[5px]'
              : 'text-zinc-400 hover:text-zinc-700'
          }`}
        >
          Scheduled Drops ({drops.length})
        </button>

        <button
          onClick={() => setActiveTab('info')}
          className={`pb-3 text-xs font-avantgarde font-bold tracking-widest uppercase transition-all relative cursor-pointer ${
            activeTab === 'info'
              ? 'text-zinc-950 border-b-2 border-zinc-950 -mb-[5px]'
              : 'text-zinc-400 hover:text-zinc-700'
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
