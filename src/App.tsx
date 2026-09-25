import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { NavigationHeader, PORTAL_TAB_ID, type PortalRole } from './components/layout/NavigationHeader';
import { NavigationDrawer } from './components/layout/NavigationDrawer';
import { FooterSection } from './components/layout/FooterSection';
import { BottomTabBar } from './components/layout/BottomTabBar';
import { InstallBanner } from './components/layout/InstallBanner';

import { EditorialHero } from './components/feed/EditorialHero';
import { AestheticFilterBar } from './components/feed/AestheticFilterBar';
import { ProductGrid } from './components/feed/ProductGrid';
import { FeedControls, PRICE_RANGES, type FeedMode, type PriceRange, type SortKey } from './components/feed/FeedControls';
import { StyleQuizModal } from './components/feed/StyleQuizModal';
import { RecentlyViewedStrip } from './components/feed/RecentlyViewedStrip';
import { ProductDetailModal } from './components/product/ProductDetailModal';

import { SellerStorefront } from './components/seller/SellerStorefront';
import { SellerDashboard } from './components/seller/SellerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuthView, type AuthMode } from './components/auth/AuthView';
import { ApplicationStatusView } from './components/auth/ApplicationStatusView';

import { DropsView } from './views/DropsView';
import { FitCheckView } from './views/FitCheckView';
import { SavedView, type SavedTab } from './views/SavedView';
import { SharedCollectionView } from './views/SharedCollectionView';
import { DavaoFashionMap } from './components/map/DavaoFashionMap';

import { fashionService } from './services/fashionService';
import { storageService } from './services/storageService';
import { authService } from './services/authService';
import { catalogService } from './services/catalogService';
import { userPrefsService } from './services/userPrefsService';
import { useCatalogVersion } from './hooks/useCatalogVersion';
import { usePrefsVersion } from './hooks/usePrefsVersion';
import { fitsProfile } from './utils/sizing';
import { closestMatches } from './utils/search';
import { buildHash, parseHash, setHash } from './utils/router';
import { useI18n } from './i18n';
import type { Product } from './types/fashion';
import type { Account } from './types/auth';

const TAB_IDS = new Set(['feed', 'discover', 'drops', 'map', 'brands', 'community', 'saved', PORTAL_TAB_ID]);

interface SharedCollection {
  kind: 'board' | 'closet';
  name: string;
  productIds: string[];
}

export const App: React.FC = () => {
  const { t } = useI18n();

  // Navigation & View Routing State
  const [activeTab, setActiveTabState] = useState<string>('feed');
  const [selectedCity, setSelectedCity] = useState<string>('All Davao Region');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [sharedCollection, setSharedCollection] = useState<SharedCollection | null>(null);
  const [savedInitialTab, setSavedInitialTab] = useState<SavedTab>('products');

  // Filter States
  const [selectedAesthetic, setSelectedAesthetic] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isOneOfOneOnly, setIsOneOfOneOnly] = useState<boolean>(false);
  const [feedMode, setFeedMode] = useState<FeedMode>('forYou');
  const [sortKey, setSortKey] = useState<SortKey>('newest');
  const [priceRange, setPriceRange] = useState<PriceRange>('any');
  const [followingBaseline, setFollowingBaseline] = useState<Set<string>>(() => new Set());

  // Selected Item Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Selected Seller Storefront State
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);

  // Auth State: seller or admin account behind the portal tab
  const [account, setAccount] = useState<Account | null>(() => authService.getCurrentAccount());
  const [authMode, setAuthMode] = useState<AuthMode>('signin');

  // First-visit style quiz
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);

  // Bumps whenever sellers, products, or buyer preferences change so queries re-run
  const catalogVersion = useCatalogVersion();
  usePrefsVersion();

  // The hash for the current tab or storefront; restored when a piece is closed.
  const baseHashRef = useRef<string>(buildHash('/tab/feed'));

  // Keep the account fresh: approvals from another tab, sign-outs, resubmissions
  useEffect(() => {
    const refresh = () => setAccount(authService.getCurrentAccount());
    const unsubscribe = authService.subscribe(refresh);
    window.addEventListener('storage', refresh);
    return () => {
      unsubscribe();
      window.removeEventListener('storage', refresh);
    };
  }, []);

  // Style quiz once per browser, shortly after first paint
  useEffect(() => {
    if (userPrefsService.isStyleQuizDone()) return;
    const timer = window.setTimeout(() => setIsQuizOpen(true), 900);
    return () => window.clearTimeout(timer);
  }, []);

  // Hash routes: deep links on load, and back/forward navigation
  useEffect(() => {
    const apply = () => {
      const route = parseHash();
      switch (route.kind) {
        case 'tab': {
          if (TAB_IDS.has(route.id)) {
            setActiveTabState(route.id);
            setSelectedSellerId(null);
            baseHashRef.current = buildHash(`/tab/${route.id}`);
          }
          setSelectedProduct(null);
          break;
        }
        case 'piece': {
          const product = fashionService.getProductById(route.id);
          if (product) setSelectedProduct(product);
          break;
        }
        case 'store': {
          const seller = fashionService.getSellerByHandle(route.id) ?? fashionService.getSellerById(route.id);
          if (seller) {
            setSelectedSellerId(seller.id);
            setActiveTabState('seller-profile');
            baseHashRef.current = buildHash(`/store/${seller.handle}`);
          }
          setSelectedProduct(null);
          break;
        }
        case 'drop': {
          setActiveTabState('drops');
          baseHashRef.current = buildHash('/tab/drops');
          const drop = fashionService.getDropById(route.id);
          if (drop && drop.items.length > 0 && !drop.isLive) setSelectedProduct(drop.items[0]);
          break;
        }
        case 'board':
        case 'closet': {
          const items = (route.query.get('items') ?? '').split(',').filter(Boolean);
          const fallbackName = route.kind === 'board' ? route.id.replace(/-/g, ' ') : 'Shared closet';
          setSharedCollection({ kind: route.kind, name: route.query.get('name') || fallbackName, productIds: items });
          setActiveTabState('shared');
          baseHashRef.current = window.location.hash;
          setSelectedProduct(null);
          break;
        }
        default:
          break;
      }
    };
    apply();
    window.addEventListener('hashchange', apply);
    return () => window.removeEventListener('hashchange', apply);
  }, []);

  const portalRole: PortalRole = !account ? 'guest' : account.role === 'admin' ? 'admin' : 'seller';
  const accountName = !account ? null : account.role === 'admin' ? account.name : account.businessName;

  // User Saved Items Count Tracker
  const savedCount = storageService.getSavedProducts().length;

  // Query Filtered Products (city, category, aesthetic, 1-of-1, search)
  const baseProducts = useMemo(() => {
    return fashionService.getProducts({
      city: selectedCity,
      category: selectedCategory,
      aesthetic: selectedAesthetic,
      isOneOfOne: isOneOfOneOnly,
      searchQuery: searchQuery,
    });
  }, [selectedCity, selectedCategory, selectedAesthetic, isOneOfOneOnly, searchQuery, catalogVersion]);

  // Buyer preferences applied on top: Following, Fits me, price range, sort, style boost
  const followedIds = storageService.getFollowedSellers();
  const sizeProfile = userPrefsService.getSizeProfile();
  const hasSizeProfile = userPrefsService.hasSizeProfile();
  const fitsMe = userPrefsService.isFitsMeEnabled();
  const styleAesthetics = userPrefsService.getStyleProfile().aesthetics;

  const products = (() => {
    let list = baseProducts;
    if (feedMode === 'following') list = list.filter((p) => followedIds.includes(p.sellerId));
    if (fitsMe && hasSizeProfile) list = list.filter((p) => fitsProfile(p, sizeProfile));
    const range = PRICE_RANGES.find((r) => r.id === priceRange) ?? PRICE_RANGES[0];
    list = list.filter((p) => p.price >= range.min && p.price <= range.max);

    const sorted = [...list];
    switch (sortKey) {
      case 'priceLow':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'priceHigh':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'mostSaved':
        sorted.sort((a, b) => b.saveCount - a.saveCount);
        break;
      default:
        sorted.sort((a, b) => b.dateAdded.localeCompare(a.dateAdded));
    }

    if (sortKey === 'newest' && feedMode === 'forYou' && styleAesthetics.length > 0) {
      const matches = sorted.filter((p) => p.aesthetics.some((a) => styleAesthetics.includes(a)));
      const rest = sorted.filter((p) => !p.aesthetics.some((a) => styleAesthetics.includes(a)));
      return [...matches, ...rest];
    }
    return sorted;
  })();

  // Following feed: pieces added since the last visit get a "New" ribbon
  const followingAll = useMemo(
    () => fashionService.getProducts().filter((p) => followedIds.includes(p.sellerId)),
    [catalogVersion, followedIds.join(',')]
  );
  const seenFollowingIds = userPrefsService.getFollowingSeenIds();
  const unseenFollowingIds = useMemo(() => {
    if (seenFollowingIds === null) return new Set<string>();
    return new Set(followingAll.filter((p) => !seenFollowingIds.includes(p.id)).map((p) => p.id));
  }, [followingAll, seenFollowingIds?.join(',')]);
  const newRibbonIds = feedMode === 'following' ? followingBaseline : new Set<string>();

  const handleFeedModeChange = (mode: FeedMode) => {
    setFeedMode(mode);
    if (mode === 'following') {
      setFollowingBaseline(unseenFollowingIds);
      userPrefsService.markFollowingSeen(followingAll.map((p) => p.id));
    }
  };

  // Suggestions when a search finds nothing
  const closest = useMemo(
    () => (products.length === 0 && searchQuery.trim() ? closestMatches(searchQuery, fashionService.getProducts({ city: selectedCity })) : []),
    [products.length, searchQuery, selectedCity, catalogVersion]
  );

  // Recently viewed strip
  const recentProducts = userPrefsService
    .getRecentViews()
    .map((id) => fashionService.getProductById(id))
    .filter((p): p is Product => Boolean(p));

  // Query All Sellers & Drops
  const sellers = useMemo(() => fashionService.getSellers(searchQuery), [searchQuery, catalogVersion]);
  const drops = useMemo(() => fashionService.getDrops(), [catalogVersion]);
  const outfitPosts = useMemo(() => fashionService.getOutfitPosts(), []);

  // Selected Seller Data
  const currentSeller = useMemo(() => {
    if (!selectedSellerId) return null;
    return fashionService.getSellerById(selectedSellerId) || null;
  }, [selectedSellerId, catalogVersion]);

  const currentSellerProducts = useMemo(() => {
    if (!selectedSellerId) return [];
    return fashionService.getProductsBySeller(selectedSellerId);
  }, [selectedSellerId, catalogVersion]);

  // Tab navigation: clears the storefront selection, updates the URL, returns to the top
  const setActiveTab = useCallback((tab: string) => {
    setActiveTabState(tab);
    if (tab !== 'seller-profile') setSelectedSellerId(null);
    if (TAB_IDS.has(tab)) {
      baseHashRef.current = buildHash(`/tab/${tab}`);
      setHash(baseHashRef.current);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handle Opening Seller Profile View
  const handleSelectSeller = (sellerId: string) => {
    const seller = fashionService.getSellerById(sellerId);
    setSelectedSellerId(sellerId);
    setActiveTabState('seller-profile');
    setSelectedProduct(null);
    if (seller) {
      baseHashRef.current = buildHash(`/store/${seller.handle}`);
      setHash(baseHashRef.current);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Piece detail open/close with a shareable #/piece/:id URL
  const openProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
    setHash(buildHash(`/piece/${product.id}`), 'push');
  }, []);

  const closeProduct = () => {
    setSelectedProduct(null);
    setHash(baseHashRef.current);
  };

  const openProductById = (productId: string) => {
    const product = fashionService.getProductById(productId);
    if (product) openProduct(product);
  };

  const exploreDrop = (dropId: string) => {
    const targetDrop = drops.find((d) => d.id === dropId);
    if (targetDrop && targetDrop.items.length > 0) openProduct(targetDrop.items[0]);
  };

  const handleResetFilters = () => {
    setSelectedCity('All Davao Region');
    setSelectedAesthetic('All');
    setSelectedCategory('All');
    setIsOneOfOneOnly(false);
    setSearchQuery('');
    setPriceRange('any');
    userPrefsService.setFitsMeEnabled(false);
  };

  const handleAuthenticated = (nextAccount: Account) => {
    setAccount(nextAccount);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignOut = () => {
    authService.signOut();
    setAccount(null);
    setAuthMode('signin');
    setActiveTab('feed');
  };

  const handleJoinSeller = () => {
    if (!account) setAuthMode('seller-signup');
    setActiveTab(PORTAL_TAB_ID);
  };

  const openSizeProfile = () => {
    setSavedInitialTab('profile');
    setActiveTab('saved');
  };

  const hasActiveFilters =
    selectedAesthetic !== 'All' || selectedCategory !== 'All' || isOneOfOneOnly || Boolean(searchQuery) || priceRange !== 'any' || (fitsMe && hasSizeProfile);

  const renderPortal = () => {
    if (!account) {
      return <AuthView mode={authMode} onModeChange={setAuthMode} onAuthenticated={handleAuthenticated} />;
    }

    if (account.role === 'admin') {
      return (
        <AdminDashboard
          admin={account}
          onSignOut={handleSignOut}
          onViewSeller={handleSelectSeller}
          onSelectProduct={(p) => {
            setSelectedProduct(p);
            setHash(buildHash(`/piece/${p.id}`), 'push');
          }}
        />
      );
    }

    if (account.status !== 'approved') {
      return (
        <ApplicationStatusView
          account={account}
          onUpdated={setAccount}
          onSignOut={handleSignOut}
          onBrowseFeed={() => setActiveTab('feed')}
        />
      );
    }

    const sellerProfile = catalogService.getSellerById(account.sellerProfileId);
    if (!sellerProfile) {
      return (
        <div className="max-w-xl mx-auto px-4 py-12 text-center space-y-3 font-sans">
          <div className="font-cooper text-xl font-bold text-zinc-950">Storefront profile missing</div>
          <p className="text-sm text-zinc-500">
            Your application is approved but the storefront record was not found in this browser. Ask an admin to re-approve the application.
          </p>
          <button onClick={handleSignOut} className="px-5 py-2.5 bg-zinc-950 text-white rounded-full text-xs font-semibold">
            Sign Out
          </button>
        </div>
      );
    }

    return (
      <SellerDashboard
        account={account}
        seller={sellerProfile}
        onViewStorefront={() => handleSelectSeller(sellerProfile.id)}
        onSignOut={handleSignOut}
      />
    );
  };

  const renderFeedGrid = () => {
    if (feedMode === 'following' && followedIds.length === 0) {
      return (
        <ProductGrid
          products={[]}
          onSelectProduct={openProduct}
          emptyTitle={t('feed.following')}
          emptyBody={t('feed.followingEmpty')}
          emptyAction={{ label: t('feed.followingBrowse'), onClick: () => setActiveTab('brands') }}
        />
      );
    }
    if (products.length === 0 && fitsMe && hasSizeProfile) {
      return (
        <ProductGrid
          products={[]}
          onSelectProduct={openProduct}
          emptyTitle={t('feed.fitsMe')}
          emptyBody={t('feed.noFit')}
          emptyAction={{ label: t('feed.setSizes'), onClick: openSizeProfile }}
        />
      );
    }
    return (
      <>
        <ProductGrid
          products={products}
          onSelectProduct={openProduct}
          onSelectSeller={handleSelectSeller}
          onResetFilters={handleResetFilters}
          newProductIds={newRibbonIds}
        />
        {closest.length > 0 && (
          <section className="space-y-1">
            <h3 className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-500">{t('search.closest')}</h3>
            <ProductGrid products={closest} onSelectProduct={openProduct} onSelectSeller={handleSelectSeller} />
          </section>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-950 font-sans selection:bg-zinc-950 selection:text-white">
      {/* Top Header Navigation */}
      <NavigationHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        savedCount={savedCount}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        portalRole={portalRole}
        onSelectSeller={handleSelectSeller}
      />

      {/* Mobile Menu Drawer */}
      <NavigationDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        savedCount={savedCount}
        portalRole={portalRole}
        accountName={accountName}
        onSignOut={handleSignOut}
      />

      {/* Main Content Router Body */}
      <main className="flex-1 pb-28 sm:pb-32">
        {/* VIEW 1: Home Fashion Discovery Feed */}
        {activeTab === 'feed' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4">
            <EditorialHero
              featuredDrop={drops[0]}
              onExploreDrop={() => setActiveTab('drops')}
              onSelectBrand={handleSelectSeller}
            />

            <FeedControls
              mode={feedMode}
              onModeChange={handleFeedModeChange}
              followingNewCount={unseenFollowingIds.size}
              fitsMe={fitsMe}
              hasSizeProfile={hasSizeProfile}
              onFitsMeChange={(enabled) => userPrefsService.setFitsMeEnabled(enabled)}
              onSetSizes={openSizeProfile}
              sort={sortKey}
              onSortChange={setSortKey}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
            />

            <AestheticFilterBar
              selectedAesthetic={selectedAesthetic}
              setSelectedAesthetic={setSelectedAesthetic}
              isOneOfOneOnly={isOneOfOneOnly}
              setIsOneOfOneOnly={setIsOneOfOneOnly}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />

            <div className="flex items-center justify-between gap-3 font-sans text-[11px] sm:text-xs text-zinc-500">
              <span className="font-medium">
                {t('feed.showing', { count: products.length })}
              </span>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-zinc-900 underline hover:text-zinc-600 font-bold shrink-0"
                >
                  {t('feed.clear')}
                </button>
              )}
            </div>

            {renderFeedGrid()}

            <RecentlyViewedStrip products={recentProducts} onSelect={openProduct} />
          </div>
        )}

        {/* VIEW 2: Discover Aesthetic Catalog */}
        {activeTab === 'discover' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">
            <div className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 text-white p-5 sm:p-8 lg:p-12 rounded-2xl sm:rounded-3xl border border-zinc-800/80 shadow-xl space-y-2 sm:space-y-3">
              <h1 className="font-cooper text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                Discover Fashion Aesthetics
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-zinc-300 max-w-xl leading-relaxed">
                Browse local Davao clothing items categorized strictly by style subculture: Streetwear, Vintage Denim, Y2K Archives, Techwear, and Gorpcore Outerwear.
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
              onSelectProduct={openProduct}
              onSelectSeller={handleSelectSeller}
              onResetFilters={handleResetFilters}
            />
          </div>
        )}

        {/* VIEW 3: Scheduled Collection Drops */}
        {activeTab === 'drops' && <DropsView drops={drops} onExploreDrop={exploreDrop} />}

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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-8">
            <div className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 text-white p-5 sm:p-8 lg:p-12 rounded-2xl sm:rounded-3xl border border-zinc-800/80 shadow-xl space-y-2 sm:space-y-3">
              <h1 className="font-cooper text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                Davao Seller Directory
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-zinc-300 max-w-xl leading-relaxed">
                Independent streetwear brands, curated thrift vaults, vintage archives, and local clothing creators across the Davao Region.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {sellers.map((seller) => (
                <div
                  key={seller.id}
                  onClick={() => handleSelectSeller(seller.id)}
                  className="bg-white border border-zinc-200/80 rounded-2xl sm:rounded-3xl p-2.5 sm:p-6 space-y-2.5 sm:space-y-4 cursor-pointer hover:border-zinc-400 hover:shadow-md transition-all shadow-sm group"
                >
                  <div className="aspect-[16/9] bg-zinc-900 rounded-xl sm:rounded-2xl overflow-hidden relative shadow-inner">
                    <img
                      src={seller.coverUrl}
                      alt={seller.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 flex items-center gap-1.5 sm:gap-2.5 bg-black/50 backdrop-blur-md px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-white/20 max-w-[calc(100%-1rem)]">
                      <img
                        src={seller.logoUrl}
                        alt={seller.name}
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-white shrink-0"
                      />
                      <span className="font-cooper text-[11px] sm:text-xs font-bold text-white truncate">{seller.name}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] sm:text-xs text-zinc-600 truncate">
                      @{seller.handle} • {seller.location.district}, {seller.location.city}
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-600 mt-1 line-clamp-2 leading-relaxed">
                      {seller.description}
                    </p>
                  </div>

                  <div className="pt-2 sm:pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] sm:text-xs text-zinc-600 gap-2">
                    <span className="truncate">{seller.followerCount.toLocaleString()} followers</span>
                    <span className="font-semibold text-zinc-950 group-hover:underline shrink-0">Visit &rarr;</span>
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
            onSelectProduct={openProductById}
          />
        )}

        {/* VIEW 7: Personal Saved Closet */}
        {activeTab === 'saved' && (
          <SavedView
            key={savedInitialTab}
            initialTab={savedInitialTab}
            onSelectProduct={openProduct}
            onSelectSeller={handleSelectSeller}
            onExploreDrop={exploreDrop}
          />
        )}

        {/* VIEW 8: Portal (Sign In, Seller Dashboard, or Admin Panel) */}
        {activeTab === PORTAL_TAB_ID && renderPortal()}

        {/* VIEW 9: Seller Storefront Profile View */}
        {activeTab === 'seller-profile' && currentSeller && (
          <SellerStorefront
            seller={currentSeller}
            products={currentSellerProducts}
            drops={drops.filter((d) => d.sellerId === currentSeller.id)}
            onSelectProduct={openProduct}
            onExploreDrop={exploreDrop}
          />
        )}

        {/* VIEW 10: Shared outfit board or closet link */}
        {activeTab === 'shared' && sharedCollection && (
          <SharedCollectionView
            kind={sharedCollection.kind}
            name={sharedCollection.name}
            productIds={sharedCollection.productIds}
            onSelectProduct={openProduct}
            onSelectSeller={handleSelectSeller}
            onBack={() => setActiveTab('feed')}
          />
        )}
      </main>

      {/* Detail Modal Overlay */}
      <ProductDetailModal
        product={selectedProduct}
        seller={selectedProduct ? fashionService.getSellerById(selectedProduct.sellerId) || null : null}
        isOpen={Boolean(selectedProduct)}
        onClose={closeProduct}
        onSelectSeller={handleSelectSeller}
        onSwitchProduct={openProduct}
      />

      {/* First-visit style quiz */}
      <StyleQuizModal
        isOpen={isQuizOpen && activeTab === 'feed' && !selectedProduct}
        onSkip={() => {
          userPrefsService.setStyleProfile([]);
          setIsQuizOpen(false);
        }}
        onComplete={(aesthetics) => {
          userPrefsService.setStyleProfile(aesthetics);
          setIsQuizOpen(false);
        }}
      />

      {/* Global Footer Section */}
      <FooterSection
        setActiveTab={setActiveTab}
        setSelectedCity={setSelectedCity}
        onJoinSeller={handleJoinSeller}
      />

      {/* Reserves space so the fixed bar never covers the footer */}
      <div className="h-16 lg:hidden" aria-hidden="true" />

      {/* Add to home screen prompt */}
      {!selectedProduct && <InstallBanner />}

      {/* Persistent Mobile Bottom Navigation */}
      <BottomTabBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedCount}
        isHidden={Boolean(selectedProduct)}
        portalRole={portalRole}
      />
    </div>
  );
};

export default App;
