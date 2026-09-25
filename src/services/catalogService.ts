import type {
  Drop,
  Product,
  ProductReport,
  ReportReason,
  Seller,
  VerificationStatus,
} from '../types/fashion';
import { mockProducts } from '../data/mockProducts';
import { mockSellers } from '../data/mockSellers';
import { mockDrops } from '../data/mockDrops';

/**
 * Catalog layer that merges the bundled mock dataset with seller-created and
 * admin-moderated records kept in localStorage. Components read through
 * fashionService; writers call the mutators here, which notify subscribers so
 * the view re-queries.
 */

const KEYS = {
  SELLERS: 'habi_catalog_sellers',
  PRODUCTS: 'habi_catalog_products',
  PRODUCT_OVERRIDES: 'habi_product_overrides',
  HIDDEN_PRODUCTS: 'habi_hidden_products',
  SUSPENDED_SELLERS: 'habi_suspended_sellers',
  SELLER_OVERRIDES: 'habi_seller_overrides',
  DROPS: 'habi_catalog_drops',
  REPORTS: 'habi_reports',
  MY_RESERVATIONS: 'habi_my_reservations',
  METRICS: 'habi_product_metrics',
  SELLER_METRICS: 'habi_seller_metrics',
};

type SellerOverride = Partial<Pick<Seller, 'verificationStatus' | 'theme'>>;
type ProductOverride = Partial<Pick<Product, 'status' | 'price' | 'availableQuantity'>>;

/** Seller-scheduled drop as persisted. Items are hydrated from product ids on read. */
export interface StoredDrop {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerHandle: string;
  sellerLogo: string;
  title: string;
  description: string;
  releaseTime: string;
  coverImage: string;
  productIds: string[];
  remindCount: number;
  createdAt: string;
}

export interface DailyMetric {
  date: string; // YYYY-MM-DD
  views: number;
  saves: number;
}

export interface ProductMetrics {
  productId: string;
  days: DailyMetric[];
  totalViews: number;
  totalSaves: number;
  /** True when no real events exist yet and the series is a deterministic sample. */
  isSample: boolean;
}

type MetricsStore = Record<string, Record<string, { views: number; saves: number }>>;

const listeners = new Set<() => void>();
let version = 0;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function notify(): void {
  version += 1;
  listeners.forEach((listener) => listener());
}

function todayKey(date = new Date()): string {
  return date.toISOString().split('T')[0];
}

function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return hash;
}

export function makeCatalogId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export const catalogService = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getVersion(): number {
    return version;
  },

  // Sellers -----------------------------------------------------------------

  getCustomSellers(): Seller[] {
    return readJson<Seller[]>(KEYS.SELLERS, []);
  },

  upsertSeller(seller: Seller): void {
    const sellers = this.getCustomSellers();
    const index = sellers.findIndex((s) => s.id === seller.id);
    if (index === -1) sellers.push(seller);
    else sellers[index] = seller;
    writeJson(KEYS.SELLERS, sellers);
    notify();
  },

  getSuspendedSellerIds(): string[] {
    return readJson<string[]>(KEYS.SUSPENDED_SELLERS, []);
  },

  isSellerSuspended(sellerId: string): boolean {
    return this.getSuspendedSellerIds().includes(sellerId);
  },

  setSellerSuspended(sellerId: string, suspended: boolean): void {
    const ids = this.getSuspendedSellerIds().filter((id) => id !== sellerId);
    if (suspended) ids.push(sellerId);
    writeJson(KEYS.SUSPENDED_SELLERS, ids);
    notify();
  },

  setSellerVerification(sellerId: string, status: VerificationStatus): void {
    this.patchSeller(sellerId, { verificationStatus: status });
  },

  /** Applies a partial update to a seller-created profile, or an override on a bundled one. */
  patchSeller(sellerId: string, patch: SellerOverride): void {
    const custom = this.getCustomSellers();
    const customIndex = custom.findIndex((s) => s.id === sellerId);
    if (customIndex !== -1) {
      custom[customIndex] = { ...custom[customIndex], ...patch };
      writeJson(KEYS.SELLERS, custom);
    } else {
      const overrides = readJson<Record<string, SellerOverride>>(KEYS.SELLER_OVERRIDES, {});
      overrides[sellerId] = { ...overrides[sellerId], ...patch };
      writeJson(KEYS.SELLER_OVERRIDES, overrides);
    }
    notify();
  },

  /** Every seller, including suspended ones. Admin surfaces use this. */
  getAllSellers(): Seller[] {
    const overrides = readJson<Record<string, SellerOverride>>(KEYS.SELLER_OVERRIDES, {});
    const base = mockSellers.map((seller) =>
      overrides[seller.id] ? { ...seller, ...overrides[seller.id] } : seller
    );
    return [...base, ...this.getCustomSellers()];
  },

  /** Sellers shown to the public: suspended accounts are removed. */
  getVisibleSellers(): Seller[] {
    const suspended = new Set(this.getSuspendedSellerIds());
    return this.getAllSellers().filter((seller) => !suspended.has(seller.id));
  },

  getSellerById(sellerId: string): Seller | undefined {
    return this.getAllSellers().find((seller) => seller.id === sellerId);
  },

  getSellerByHandle(handle: string): Seller | undefined {
    const wanted = handle.toLowerCase();
    return this.getAllSellers().find((seller) => seller.handle.toLowerCase() === wanted);
  },

  isCustomSeller(sellerId: string): boolean {
    return this.getCustomSellers().some((seller) => seller.id === sellerId);
  },

  // Products ----------------------------------------------------------------

  getCustomProducts(): Product[] {
    return readJson<Product[]>(KEYS.PRODUCTS, []);
  },

  addProduct(product: Product): void {
    writeJson(KEYS.PRODUCTS, [product, ...this.getCustomProducts()]);
    notify();
  },

  /** Seller-created products are edited in place; bundled ones take a status/price override. */
  updateProduct(productId: string, patch: Partial<Product>): void {
    const custom = this.getCustomProducts();
    if (custom.some((product) => product.id === productId)) {
      writeJson(
        KEYS.PRODUCTS,
        custom.map((product) => (product.id === productId ? { ...product, ...patch } : product))
      );
    } else {
      const overrides = readJson<Record<string, ProductOverride>>(KEYS.PRODUCT_OVERRIDES, {});
      const allowed: ProductOverride = {};
      if (patch.status !== undefined) allowed.status = patch.status;
      if (patch.price !== undefined) allowed.price = patch.price;
      if (patch.availableQuantity !== undefined) allowed.availableQuantity = patch.availableQuantity;
      overrides[productId] = { ...overrides[productId], ...allowed };
      writeJson(KEYS.PRODUCT_OVERRIDES, overrides);
    }
    notify();
  },

  /** Seller-created products are deleted; bundled mock products are hidden instead. */
  removeProduct(productId: string): void {
    const custom = this.getCustomProducts();
    if (custom.some((product) => product.id === productId)) {
      writeJson(KEYS.PRODUCTS, custom.filter((product) => product.id !== productId));
    } else {
      const hidden = this.getHiddenProductIds();
      if (!hidden.includes(productId)) writeJson(KEYS.HIDDEN_PRODUCTS, [...hidden, productId]);
    }
    notify();
  },

  restoreProduct(productId: string): void {
    writeJson(
      KEYS.HIDDEN_PRODUCTS,
      this.getHiddenProductIds().filter((id) => id !== productId)
    );
    notify();
  },

  getHiddenProductIds(): string[] {
    return readJson<string[]>(KEYS.HIDDEN_PRODUCTS, []);
  },

  isCustomProduct(productId: string): boolean {
    return this.getCustomProducts().some((product) => product.id === productId);
  },

  /** Every product, including hidden ones and those of suspended sellers. */
  getAllProducts(): Product[] {
    const overrides = readJson<Record<string, ProductOverride>>(KEYS.PRODUCT_OVERRIDES, {});
    const base = mockProducts.map((product) =>
      overrides[product.id] ? { ...product, ...overrides[product.id] } : product
    );
    return [...this.getCustomProducts(), ...base];
  },

  /** Products shown to the public feed. */
  getVisibleProducts(): Product[] {
    const hidden = new Set(this.getHiddenProductIds());
    const suspended = new Set(this.getSuspendedSellerIds());
    return this.getAllProducts().filter(
      (product) => !hidden.has(product.id) && !suspended.has(product.sellerId)
    );
  },

  getProductById(productId: string): Product | undefined {
    return this.getAllProducts().find((product) => product.id === productId);
  },

  /** Keeps the denormalized seller fields on products in sync after a profile edit. */
  syncSellerOnProducts(seller: Seller): void {
    const products = this.getCustomProducts().map((product) =>
      product.sellerId === seller.id
        ? {
            ...product,
            sellerName: seller.name,
            sellerHandle: seller.handle,
            sellerLogo: seller.logoUrl,
            location: formatSellerLocation(seller),
          }
        : product
    );
    writeJson(KEYS.PRODUCTS, products);
    const drops = this.getStoredDrops().map((drop) =>
      drop.sellerId === seller.id
        ? { ...drop, sellerName: seller.name, sellerHandle: seller.handle, sellerLogo: seller.logoUrl }
        : drop
    );
    writeJson(KEYS.DROPS, drops);
    notify();
  },

  // Drops -------------------------------------------------------------------

  getStoredDrops(): StoredDrop[] {
    return readJson<StoredDrop[]>(KEYS.DROPS, []);
  },

  addDrop(drop: StoredDrop): void {
    writeJson(KEYS.DROPS, [drop, ...this.getStoredDrops()]);
    notify();
  },

  updateDrop(dropId: string, patch: Partial<StoredDrop>): void {
    writeJson(
      KEYS.DROPS,
      this.getStoredDrops().map((drop) => (drop.id === dropId ? { ...drop, ...patch } : drop))
    );
    notify();
  },

  removeDrop(dropId: string): void {
    writeJson(KEYS.DROPS, this.getStoredDrops().filter((drop) => drop.id !== dropId));
    notify();
  },

  isCustomDrop(dropId: string): boolean {
    return this.getStoredDrops().some((drop) => drop.id === dropId);
  },

  /** Seller-scheduled drops with their pieces resolved from the catalog. */
  getCustomDrops(): Drop[] {
    const products = this.getAllProducts();
    return this.getStoredDrops().map((stored) => {
      const items = stored.productIds
        .map((id) => products.find((product) => product.id === id))
        .filter((product): product is Product => Boolean(product));
      return {
        id: stored.id,
        sellerId: stored.sellerId,
        sellerName: stored.sellerName,
        sellerHandle: stored.sellerHandle,
        sellerLogo: stored.sellerLogo,
        title: stored.title,
        description: stored.description,
        releaseTime: stored.releaseTime,
        coverImage: stored.coverImage,
        itemCount: stored.productIds.length,
        items,
        remindCount: stored.remindCount,
        isLive: Date.now() >= new Date(stored.releaseTime).getTime(),
      };
    });
  },

  /** Bundled and seller-scheduled drops, soonest first, with live state computed now. */
  getAllDrops(): Drop[] {
    const products = this.getAllProducts();
    const base = mockDrops.map((drop) => ({
      ...drop,
      // Re-resolve bundled items so status overrides (reservations) show inside drops too.
      items: drop.items.map((item) => products.find((product) => product.id === item.id) ?? item),
      isLive: Date.now() >= new Date(drop.releaseTime).getTime(),
    }));
    return [...base, ...this.getCustomDrops()].sort(
      (a, b) => new Date(a.releaseTime).getTime() - new Date(b.releaseTime).getTime()
    );
  },

  getVisibleDrops(): Drop[] {
    const suspended = new Set(this.getSuspendedSellerIds());
    return this.getAllDrops().filter((drop) => !suspended.has(drop.sellerId));
  },

  getDropById(dropId: string): Drop | undefined {
    return this.getAllDrops().find((drop) => drop.id === dropId);
  },

  // Reservations (first come, first served during a live drop) ---------------

  getMyReservations(): string[] {
    return readJson<string[]>(KEYS.MY_RESERVATIONS, []);
  },

  isReservedByMe(productId: string): boolean {
    return this.getMyReservations().includes(productId);
  },

  reserveProduct(productId: string): Product {
    const product = this.getProductById(productId);
    if (!product) throw new Error('This piece is no longer listed.');
    if (product.status !== 'Available') throw new Error(`Too late, this piece is already ${product.status.toLowerCase()}.`);
    this.updateProduct(productId, { status: 'Reserved' });
    writeJson(KEYS.MY_RESERVATIONS, [...this.getMyReservations(), productId]);
    notify();
    return { ...product, status: 'Reserved' };
  },

  cancelReservation(productId: string): void {
    if (!this.isReservedByMe(productId)) return;
    this.updateProduct(productId, { status: 'Available' });
    writeJson(KEYS.MY_RESERVATIONS, this.getMyReservations().filter((id) => id !== productId));
    notify();
  },

  // Reports -----------------------------------------------------------------

  getReports(): ProductReport[] {
    return readJson<ProductReport[]>(KEYS.REPORTS, []).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  addReport(input: { productId: string; productName: string; sellerId: string; reason: ReportReason; note: string }): ProductReport {
    const report: ProductReport = {
      id: makeCatalogId('report'),
      ...input,
      note: input.note.trim(),
      createdAt: new Date().toISOString(),
      status: 'open',
    };
    writeJson(KEYS.REPORTS, [report, ...readJson<ProductReport[]>(KEYS.REPORTS, [])]);
    notify();
    return report;
  },

  setReportStatus(reportId: string, status: ProductReport['status']): void {
    writeJson(
      KEYS.REPORTS,
      readJson<ProductReport[]>(KEYS.REPORTS, []).map((report) =>
        report.id === reportId ? { ...report, status } : report
      )
    );
    notify();
  },

  // Metrics (views and saves per day, this browser only) ----------------------

  recordProductView(productId: string): void {
    const store = readJson<MetricsStore>(KEYS.METRICS, {});
    const day = todayKey();
    const entry = store[productId]?.[day] ?? { views: 0, saves: 0 };
    store[productId] = { ...store[productId], [day]: { ...entry, views: entry.views + 1 } };
    writeJson(KEYS.METRICS, store);
    // Views do not notify: the dashboard reads them on its next render.
  },

  recordProductSave(productId: string, delta: 1 | -1): void {
    const store = readJson<MetricsStore>(KEYS.METRICS, {});
    const day = todayKey();
    const entry = store[productId]?.[day] ?? { views: 0, saves: 0 };
    store[productId] = { ...store[productId], [day]: { ...entry, saves: entry.saves + delta } };
    writeJson(KEYS.METRICS, store);
  },

  getProductMetrics(productId: string, days = 7): ProductMetrics {
    const store = readJson<MetricsStore>(KEYS.METRICS, {});
    const recorded = store[productId] ?? {};
    const hasData = Object.keys(recorded).length > 0;
    const isSample = !hasData && !this.isCustomProduct(productId);
    const seed = hashSeed(productId);
    const series: DailyMetric[] = [];
    for (let offset = days - 1; offset >= 0; offset--) {
      const date = new Date();
      date.setDate(date.getDate() - offset);
      const key = todayKey(date);
      if (isSample) {
        const views = 12 + ((seed >> (offset * 3)) % 38);
        series.push({ date: key, views, saves: Math.max(0, Math.round(views / 6) - (offset % 2)) });
      } else {
        series.push({ date: key, views: recorded[key]?.views ?? 0, saves: recorded[key]?.saves ?? 0 });
      }
    }
    return {
      productId,
      days: series,
      totalViews: series.reduce((sum, d) => sum + d.views, 0),
      totalSaves: series.reduce((sum, d) => sum + d.saves, 0),
      isSample,
    };
  },

  recordSellerView(sellerId: string): void {
    const store = readJson<Record<string, number>>(KEYS.SELLER_METRICS, {});
    store[sellerId] = (store[sellerId] ?? 0) + 1;
    writeJson(KEYS.SELLER_METRICS, store);
  },

  getSellerViews(sellerId: string): number {
    return readJson<Record<string, number>>(KEYS.SELLER_METRICS, {})[sellerId] ?? 0;
  },
};

export function formatSellerLocation(seller: Seller): string {
  return seller.location.district
    ? `${seller.location.city} - ${seller.location.district}`
    : seller.location.city;
}
