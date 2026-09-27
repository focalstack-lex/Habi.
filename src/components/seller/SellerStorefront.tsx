import React, { useState } from 'react';
import type { Seller, Product, Drop } from '../../types/fashion';
import { ProductGrid } from '../feed/ProductGrid';
import { DropCard } from '../drops/DropCard';
import { SellerHeader } from './SellerHeader';
import { ShieldCheck, MapPin, Clock } from 'lucide-react';
import { resolveSellerTheme } from './theme';

interface SellerStorefrontProps {
  seller: Seller;
  products: Product[];
  drops: Drop[];
  onSelectProduct: (product: Product) => void;
  onExploreDrop?: (dropId: string) => void;
}

type StorefrontTab = 'products' | 'drops' | 'info';

export const SellerStorefront: React.FC<SellerStorefrontProps> = ({
  seller,
  products,
  drops,
  onSelectProduct,
  onExploreDrop,
}) => {
  const [activeTab, setActiveTab] = useState<StorefrontTab>('products');
  const theme = resolveSellerTheme(seller);

  const tabs: { id: StorefrontTab; label: string }[] = [
    { id: 'products', label: `Catalog Pieces (${products.length})` },
    { id: 'drops', label: `Scheduled Drops (${drops.length})` },
    { id: 'info', label: 'Store Location' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 font-sans space-y-5 sm:space-y-8">
      {/* Seller Header Component */}
      <SellerHeader seller={seller} />

      {/* Storefront Navigation Tabs */}
      <div className="flex items-center gap-5 sm:gap-8 border-b border-[#E6DCC0] pb-1 overflow-x-auto scrollbar-none">
        {tabs.map((tabItem) => {
          const isActive = activeTab === tabItem.id;
          return (
            <button
              key={tabItem.id}
              type="button"
              onClick={() => setActiveTab(tabItem.id)}
              className={`pb-3 text-xs font-avantgarde font-bold tracking-widest uppercase transition-all relative cursor-pointer shrink-0 whitespace-nowrap ${
                isActive
                  ? `border-b-2 -mb-[5px] ${theme.isDefaultAccent ? 'text-[#1A2225] border-[#1A2225]' : ''}`
                  : 'text-[#55615D] hover:text-[#1A2225]'
              }`}
            >
              {tabItem.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Products */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <h2 className="font-outfit text-lg sm:text-2xl font-bold text-[#1A2225] tracking-tight">
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
        <div className="space-y-4 sm:space-y-6 max-w-4xl">
          <h2 className="font-outfit text-lg sm:text-2xl font-bold text-[#1A2225] tracking-tight">
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
            <div className="p-6 sm:p-12 bg-[#FFF9E9] border border-[#E6DCC0] rounded-3xl text-center text-sm text-[#55615D] font-sans shadow-sm">
              No upcoming drops scheduled for this brand at the moment.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Store Info */}
      {activeTab === 'info' && (
        <div className="bg-[#FFF9E9] border border-[#E6DCC0] rounded-2xl sm:rounded-3xl p-5 sm:p-8 max-w-3xl space-y-5 sm:space-y-6 shadow-sm font-sans">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#55615D]">
              Verification Status
            </span>
            <div className="flex items-center gap-2 text-base font-semibold text-[#1A2225]">
              <ShieldCheck className="w-5 h-5 text-[#1A2225]" />
              <span>{seller.verificationStatus}</span>
            </div>
          </div>

          <div className="space-y-2 pt-6 border-t border-[#E6DCC0]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#55615D]">
              Physical Location & Directions
            </span>
            <div className="flex items-start gap-2.5 text-sm text-[#1A2225]">
              <MapPin className="w-5 h-5 text-[#1A2225] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-base">{seller.location.city} ({seller.location.district})</p>
                {seller.location.address ? (
                  <p className="text-[#55615D] font-sans mt-1">{seller.location.address}</p>
                ) : (
                  <p className="text-[#55615D] font-sans mt-1">Online creator based in {seller.location.district}, {seller.location.city}.</p>
                )}
              </div>
            </div>
          </div>

          {seller.location.openingHours && (
            <div className="space-y-2 pt-6 border-t border-[#E6DCC0]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#55615D]">
                Operating Hours
              </span>
              <div className="flex items-center gap-2.5 text-sm text-[#1A2225] font-medium">
                <Clock className="w-5 h-5 text-[#55615D] shrink-0" />
                <span>{seller.location.openingHours}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
