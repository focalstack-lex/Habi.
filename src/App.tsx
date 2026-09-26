import React, { useState, useMemo } from 'react';
import { NavigationHeader } from './components/layout/NavigationHeader';
import { NavigationDrawer } from './components/layout/NavigationDrawer';
import { FooterSection } from './components/layout/FooterSection';
import { BottomTabBar } from './components/layout/BottomTabBar';

import { EditorialHero } from './components/feed/EditorialHero';
import { AestheticFilterBar } from './components/feed/AestheticFilterBar';
import { ProductGrid } from './components/feed/ProductGrid';
import { ProductDetailModal } from './components/product/ProductDetailModal';

import { SellerStorefront } from './components/seller/SellerStorefront';
import { SellerDashboard } from './components/seller/SellerDashboard';

import { DropsView } from './views/DropsView';
import { FitCheckView } from './views/FitCheckView';
import { SavedView } from './views/SavedView';
import { DavaoFashionMap } from './components/map/DavaoFashionMap';

import { fashionService } from './services/fashionService';
import { storageService } from './services/storageService';
import type { Product } from './types/fashion';

export const App: React.FC = () => {
  // Navigation & View Routing State
  const [activeTab, setActiveTab] = useState<string>('feed');
  const [selectedCity, setSelectedCity] = useState<string>('All Davao Region');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Filter States
  const [selectedAesthetic, setSelectedAesthetic] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isOneOfOneOnly, setIsOneOfOneOnly] = useState<boolean>(false);

  // Selected Item Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Selected Seller Storefront State
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);

  // User Saved Items Count Tracker
  const savedCount = storageService.getSavedProducts().length;

  // Query Filtered Products
  const products = useMemo(() => {
    return fashionService.getProducts({
      city: selectedCity,
      category: selectedCategory,
      aesthetic: selectedAesthetic,
      isOneOfOne: isOneOfOneOnly,
      searchQuery: searchQuery,
    });
  }, [selectedCity, selectedCategory, selectedAesthetic, isOneOfOneOnly, searchQuery]);

  // Query All Sellers & Drops
  const sellers = useMemo(() => fashionService.getSellers(searchQuery), [searchQuery]);
  const drops = useMemo(() => fashionService.getDrops(), []);
  const outfitPosts = useMemo(() => fashionService.getOutfitPosts(), []);

  // Selected Seller Data
  const currentSeller = useMemo(() => {
    if (!selectedSellerId) return null;
    return fashionService.getSellerById(selectedSellerId) || null;
  }, [selectedSellerId]);

  const currentSellerProducts = useMemo(() => {
    if (!selectedSellerId) return [];
    return fashionService.getProductsBySeller(selectedSellerId);
  }, [selectedSellerId]);

  // Handle Opening Seller Profile View
  const handleSelectSeller = (sellerId: string) => {
    setSelectedSellerId(sellerId);
    setActiveTab('seller-profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSelectedCity('All Davao Region');
    setSelectedAesthetic('All');
    setSelectedCategory('All');
    setIsOneOfOneOnly(false);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF4E4] text-[#1A2225] font-sans selection:bg-[#1A2225] selection:text-[#FFF9E9]">
      {/* Top Header Navigation */}
      <NavigationHeader
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'seller-profile') setSelectedSellerId(null);
        }}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        savedCount={savedCount}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Mobile Menu Drawer */}
      <NavigationDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'seller-profile') setSelectedSellerId(null);
        }}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        savedCount={savedCount}
      />

      {/* Main Content Router Body */}
      <main className="flex-1 pb-28 sm:pb-32">
        {/* VIEW 1: Home Fashion Discovery Feed */}
        {activeTab === 'feed' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <EditorialHero
              featuredDrop={drops[0]}
              onExploreDrop={() => setActiveTab('drops')}
              onSelectBrand={handleSelectSeller}
            />

            <AestheticFilterBar
              selectedAesthetic={selectedAesthetic}
              setSelectedAesthetic={setSelectedAesthetic}
              isOneOfOneOnly={isOneOfOneOnly}
              setIsOneOfOneOnly={setIsOneOfOneOnly}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />

            <div className="flex items-center justify-between font-mono text-xs text-[#55615D] pb-2">
              <span className="uppercase font-bold tracking-wider">
                Showing {products.length} Local Davao Pieces
              </span>
              {(selectedAesthetic !== 'All' || selectedCategory !== 'All' || isOneOfOneOnly || searchQuery) && (
                <button
                  onClick={handleResetFilters}
                  className="text-[#1A2225] underline hover:opacity-80 font-bold"
                >
                  Clear Filters
                </button>
              )}
            </div>

            <ProductGrid
              products={products}
              onSelectProduct={(p) => setSelectedProduct(p)}
              onSelectSeller={handleSelectSeller}
              onResetFilters={handleResetFilters}
            />
          </div>
        )}

        {/* VIEW 2: Discover Aesthetic Catalog */}
        {activeTab === 'discover' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="relative overflow-hidden bg-[#1A2225] text-[#FFF9E9] p-6 sm:p-8 md:p-10 rounded-3xl border border-[#1A2225]/20 shadow-xl space-y-3">
              <h1 className="font-outfit text-3xl sm:text-4xl font-bold tracking-tight">
                Discover Fashion Aesthetics
              </h1>
              <p className="text-sm sm:text-base text-[#E0DFC8] max-w-xl font-sans leading-relaxed">
                Browse local Davao clothing pieces by style subculture.
              </p>
            </div>

            <AestheticFilterBar
              selectedAesthetic={selectedAesthetic}
              setSelectedAesthetic={setSelectedAesthetic}
              isOneOfOneOnly={isOneOfOneOnly}
              setIsOneOfOneOnly={setIsOneOfOneOnly}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />

            <ProductGrid
              products={products}
              onSelectProduct={(p) => setSelectedProduct(p)}
              onSelectSeller={handleSelectSeller}
              onResetFilters={handleResetFilters}
            />
          </div>
        )}

        {/* VIEW 3: Scheduled Collection Drops */}
        {activeTab === 'drops' && (
          <DropsView
            drops={drops}
            onExploreDrop={(dropId) => {
              const targetDrop = drops.find((d) => d.id === dropId);
              if (targetDrop && targetDrop.items.length > 0) {
                setSelectedProduct(targetDrop.items[0]);
              }
            }}
          />
        )}

        {/* VIEW 4: Interactive Davao Region Fashion Map */}
        {activeTab === 'map' && (
          <DavaoFashionMap
            sellers={sellers}
            selectedCity={selectedCity}
            onSelectSeller={handleSelectSeller}
          />
        )}

        {/* VIEW 5: Davao Local Brand Directory */}
        {activeTab === 'brands' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="relative overflow-hidden bg-[#1A2225] text-[#FFF9E9] p-6 sm:p-8 md:p-10 rounded-3xl border border-[#1A2225]/20 shadow-xl space-y-3">
              <h1 className="font-outfit text-3xl sm:text-4xl font-bold tracking-tight">
                Davao Seller Directory
              </h1>
              <p className="text-sm sm:text-base text-[#E0DFC8] max-w-xl font-sans leading-relaxed">
                Explore independent streetwear brands and vintage thrift vaults in Davao.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {sellers.map((seller) => (
                <div
                  key={seller.id}
                  onClick={() => handleSelectSeller(seller.id)}
                  className="bg-[#FFF9E9] border border-[#E6DCC0] rounded-2xl sm:rounded-3xl p-3 sm:p-6 space-y-3 sm:space-y-4 cursor-pointer hover:border-[#1A2225]/40 hover:shadow-md transition-all shadow-sm group"
                >
                  <div className="aspect-[16/9] bg-[#1A2225] rounded-2xl overflow-hidden relative shadow-inner">
                    <img
                      src={seller.coverUrl}
                      alt={seller.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2.5 bg-[#1A2225]/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#FFF9E9]/20">
                      <img
                        src={seller.logoUrl}
                        alt={seller.name}
                        className="w-6 h-6 rounded-full object-cover border border-[#FFF9E9] shrink-0"
                      />
                      <span className="font-outfit text-xs font-bold text-[#FFF9E9] truncate max-w-[120px]">{seller.name}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-[#55615D] font-sans">
                      @{seller.handle} • {seller.location.district}, {seller.location.city}
                    </div>
                    <p className="text-sm font-sans text-[#1A2225]/80 mt-1 line-clamp-2 leading-relaxed">
                      {seller.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#E6DCC0] flex items-center justify-between text-xs text-[#55615D]">
                    <span>{seller.followerCount.toLocaleString()} followers</span>
                    <span className="font-semibold text-[#1A2225] group-hover:underline">Visit Storefront &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 6: Davao Fit Check Community */}
        {activeTab === 'community' && (
          <FitCheckView
            posts={outfitPosts}
            onSelectSeller={handleSelectSeller}
            onSelectProduct={(id) => {
              const p = fashionService.getProductById(id);
              if (p) setSelectedProduct(p);
            }}
          />
        )}

        {/* VIEW 7: Personal Saved Closet */}
        {activeTab === 'saved' && (
          <SavedView
            onSelectProduct={(p) => setSelectedProduct(p)}
            onSelectSeller={handleSelectSeller}
            onExploreDrop={(dropId) => {
              const targetDrop = drops.find((d) => d.id === dropId);
              if (targetDrop && targetDrop.items.length > 0) {
                setSelectedProduct(targetDrop.items[0]);
              }
            }}
          />
        )}

        {/* VIEW 8: Seller Dashboard Portal */}
        {activeTab === 'dashboard' && (
          <SellerDashboard
            seller={sellers[0]}
            products={currentSellerProducts.length > 0 ? currentSellerProducts : products.slice(0, 4)}
          />
        )}

        {/* VIEW 9: Seller Storefront Profile View */}
        {activeTab === 'seller-profile' && currentSeller && (
          <SellerStorefront
            seller={currentSeller}
            products={currentSellerProducts}
            drops={drops.filter((d) => d.sellerId === currentSeller.id)}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onExploreDrop={(dropId) => {
              const targetDrop = drops.find((d) => d.id === dropId);
              if (targetDrop && targetDrop.items.length > 0) {
                setSelectedProduct(targetDrop.items[0]);
              }
            }}
          />
        )}
      </main>

      {/* Detail Modal Overlay */}
      <ProductDetailModal
        product={selectedProduct}
        seller={selectedProduct ? fashionService.getSellerById(selectedProduct.sellerId) || null : null}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        onSelectSeller={handleSelectSeller}
      />

      {/* Global Footer Section */}
      <FooterSection
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'seller-profile') setSelectedSellerId(null);
        }}
        setSelectedCity={setSelectedCity}
      />

      {/* Reserves space so the fixed bar never covers the footer */}
      <div className="h-16 lg:hidden" aria-hidden="true" />

      {/* Persistent Mobile Bottom Navigation */}
      <BottomTabBar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'seller-profile') setSelectedSellerId(null);
        }}
        savedCount={savedCount}
        isHidden={Boolean(selectedProduct)}
      />
    </div>
  );
};

export default App;
