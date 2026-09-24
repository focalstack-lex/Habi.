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
      <div className="flex items-center gap-8 border-b border-[#E1E6B6] pb-1">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 text-xs font-avantgarde font-bold tracking-widest uppercase transition-all relative cursor-pointer ${
            activeTab === 'products'
              ? 'text-[#1A1A00] border-b-2 border-[#1A1A00] -mb-[5px]'
              : 'text-[#565C38] hover:text-[#1A1A00]'
          }`}
        >
          Catalog Pieces ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('drops')}
          className={`pb-3 text-xs font-avantgarde font-bold tracking-widest uppercase transition-all relative cursor-pointer ${
            activeTab === 'drops'
              ? 'text-[#1A1A00] border-b-2 border-[#1A1A00] -mb-[5px]'
              : 'text-[#565C38] hover:text-[#1A1A00]'
          }`}
        >
          Scheduled Drops ({drops.length})
        </button>

        <button
          onClick={() => setActiveTab('info')}
          className={`pb-3 text-xs font-avantgarde font-bold tracking-widest uppercase transition-all relative cursor-pointer ${
            activeTab === 'info'
              ? 'text-[#1A1A00] border-b-2 border-[#1A1A00] -mb-[5px]'
              : 'text-[#565C38] hover:text-[#1A1A00]'
          }`}
        >
          Store Location
        </button>
      </div>

      {/* Tab 1: Products */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <h2 className="font-outfit text-2xl font-bold text-[#1A1A00] tracking-tight">
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
          <h2 className="font-outfit text-2xl font-bold text-[#1A1A00] tracking-tight">
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
            <div className="p-12 bg-[#FFFFCC] border border-[#E1E6B6] rounded-3xl text-center text-sm text-[#565C38] font-sans shadow-sm">
              No upcoming drops scheduled for this brand at the moment.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Store Info */}
      {activeTab === 'info' && (
        <div className="bg-[#FFFFCC] border border-[#E1E6B6] rounded-3xl p-8 max-w-3xl space-y-6 shadow-sm font-sans">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#565C38]">
              Verification Status
            </span>
            <div className="flex items-center gap-2 text-base font-semibold text-[#1A1A00]">
              <ShieldCheck className="w-5 h-5 text-[#1A1A00]" />
              <span>{seller.verificationStatus}</span>
            </div>
          </div>

          <div className="space-y-2 pt-6 border-t border-[#E1E6B6]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#565C38]">
              Physical Location & Directions
            </span>
            <div className="flex items-start gap-2.5 text-sm text-[#1A1A00]">
              <MapPin className="w-5 h-5 text-[#1A1A00] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-base">{seller.location.city} ({seller.location.district})</p>
                {seller.location.address ? (
                  <p className="text-[#565C38] font-sans mt-1">{seller.location.address}</p>
                ) : (
                  <p className="text-[#565C38] font-sans mt-1">Online creator based in {seller.location.district}, {seller.location.city}.</p>
                )}
              </div>
            </div>
          </div>

          {seller.location.openingHours && (
            <div className="space-y-2 pt-6 border-t border-[#E1E6B6]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#565C38]">
                Operating Hours
              </span>
              <div className="flex items-center gap-2.5 text-sm text-[#1A1A00] font-medium">
                <Clock className="w-5 h-5 text-[#565C38] shrink-0" />
                <span>{seller.location.openingHours}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
