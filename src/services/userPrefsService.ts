import type { OutfitBoard, Product, SizeProfile, StyleProfile } from '../types/fashion';

/**
 * Buyer-side preferences and personal state. Buyers have no account, so all of
 * this is per-browser. Every mutator notifies subscribers; `usePrefsVersion()`
 * re-renders components that read from here.
 */

const KEYS = {
  THEME: 'habi_theme',
  LANGUAGE: 'habi_lang',
  SIZE_PROFILE: 'habi_size_profile',
  FITS_ME: 'habi_fits_me',
  STYLE_PROFILE: 'habi_style_profile',
  RECENT_VIEWS: 'habi_recent_views',
  RECENT_SEARCHES: 'habi_recent_searches',
  BOARDS: 'habi_boards',
  CLOSET: 'habi_closet',
  FOLLOWING_SEEN: 'habi_following_seen',
  SAVED_SNAPSHOTS: 'habi_saved_snapshots',
  DISPLAY_NAME: 'habi_display_name',
  INSTALL_DISMISSED: 'habi_install_dismissed',
};

export type ThemePreference = 'light' | 'dark' | 'system';
export type Language = 'en' | 'bis';

export interface ClosetSettings {
  isPublic: boolean;
  displayName: string;
}

export interface SavedSnapshot {
  price: number;
  status: Product['status'];
  at: string;
}

export type SavedAlertType = 'price-drop' | 'price-up' | 'back-in-stock' | 'sold-out' | 'reserved';

export interface SavedAlert {
  productId: string;
  type: SavedAlertType;
  from: string;
  to: string;
}

export const TOP_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
export const SHOE_SIZES = ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '12', '13'];

const EMPTY_SIZE_PROFILE: SizeProfile = { tops: [], waistMin: null, waistMax: null, shoes: [] };
const EMPTY_STYLE_PROFILE: StyleProfile = { aesthetics: [], completedAt: null };

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

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'board';
}

export const userPrefsService = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getVersion(): number {
    return version;
  },

  // Theme -------------------------------------------------------------------

  getThemePreference(): ThemePreference {
    const value = localStorage.getItem(KEYS.THEME);
    return value === 'light' || value === 'dark' || value === 'system' ? value : 'system';
  },

  setThemePreference(preference: ThemePreference): void {
    localStorage.setItem(KEYS.THEME, preference);
    this.applyTheme();
    notify();
  },

  resolveTheme(preference?: ThemePreference): 'light' | 'dark' {
    const wanted = preference ?? userPrefsService.getThemePreference();
    if (wanted !== 'system') return wanted;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  },

  /** Toggles the `dark` class on <html>; Tailwind colour variables are remapped in index.css. */
  applyTheme(): void {
    const isDark = this.resolveTheme() === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
  },

  // Language ----------------------------------------------------------------

  getLanguage(): Language {
    return localStorage.getItem(KEYS.LANGUAGE) === 'bis' ? 'bis' : 'en';
  },

  setLanguage(language: Language): void {
    localStorage.setItem(KEYS.LANGUAGE, language);
    document.documentElement.lang = language === 'bis' ? 'ceb' : 'en';
    notify();
  },

  // Display name for community posts and boards --------------------------------

  getDisplayName(): string {
    return localStorage.getItem(KEYS.DISPLAY_NAME) ?? '';
  },

  setDisplayName(name: string): void {
    localStorage.setItem(KEYS.DISPLAY_NAME, name.trim());
    notify();
  },

  // Size profile ("Fits me") ----------------------------------------------------

  getSizeProfile(): SizeProfile {
    return { ...EMPTY_SIZE_PROFILE, ...readJson<Partial<SizeProfile>>(KEYS.SIZE_PROFILE, {}) };
  },

  setSizeProfile(profile: SizeProfile): void {
    writeJson(KEYS.SIZE_PROFILE, profile);
    notify();
  },

  hasSizeProfile(): boolean {
    const profile = this.getSizeProfile();
    return profile.tops.length > 0 || profile.shoes.length > 0 || profile.waistMin !== null || profile.waistMax !== null;
  },

  isFitsMeEnabled(): boolean {
    return localStorage.getItem(KEYS.FITS_ME) === '1';
  },

  setFitsMeEnabled(enabled: boolean): void {
    localStorage.setItem(KEYS.FITS_ME, enabled ? '1' : '0');
    notify();
  },

  // Style quiz --------------------------------------------------------------

  getStyleProfile(): StyleProfile {
    return { ...EMPTY_STYLE_PROFILE, ...readJson<Partial<StyleProfile>>(KEYS.STYLE_PROFILE, {}) };
  },

  setStyleProfile(aesthetics: string[]): void {
    writeJson(KEYS.STYLE_PROFILE, { aesthetics, completedAt: new Date().toISOString() } satisfies StyleProfile);
    notify();
  },

  isStyleQuizDone(): boolean {
    return this.getStyleProfile().completedAt !== null;
  },

  // Recently viewed and recent searches --------------------------------------------

  getRecentViews(): string[] {
    return readJson<string[]>(KEYS.RECENT_VIEWS, []);
  },

  addRecentView(productId: string): void {
    const next = [productId, ...this.getRecentViews().filter((id) => id !== productId)].slice(0, 12);
    writeJson(KEYS.RECENT_VIEWS, next);
    notify();
  },

  getRecentSearches(): string[] {
    return readJson<string[]>(KEYS.RECENT_SEARCHES, []);
  },

  addRecentSearch(query: string): void {
    const clean = query.trim();
    if (clean.length < 2) return;
    const next = [clean, ...this.getRecentSearches().filter((q) => q.toLowerCase() !== clean.toLowerCase())].slice(0, 8);
    writeJson(KEYS.RECENT_SEARCHES, next);
    notify();
  },

  clearRecentSearches(): void {
    writeJson(KEYS.RECENT_SEARCHES, []);
    notify();
  },

  // Outfit boards -----------------------------------------------------------

  getBoards(): OutfitBoard[] {
    return readJson<OutfitBoard[]>(KEYS.BOARDS, []);
  },

  createBoard(name: string, productIds: string[] = []): OutfitBoard {
    const board: OutfitBoard = {
      id: makeId('board'),
      name: name.trim() || 'Untitled look',
      productIds,
      createdAt: new Date().toISOString(),
    };
    writeJson(KEYS.BOARDS, [board, ...this.getBoards()]);
    notify();
    return board;
  },

  renameBoard(boardId: string, name: string): void {
    writeJson(KEYS.BOARDS, this.getBoards().map((b) => (b.id === boardId ? { ...b, name: name.trim() || b.name } : b)));
    notify();
  },

  deleteBoard(boardId: string): void {
    writeJson(KEYS.BOARDS, this.getBoards().filter((b) => b.id !== boardId));
    notify();
  },

  /** Adds or removes a product; returns true when the product is now on the board. */
  toggleInBoard(boardId: string, productId: string): boolean {
    let isOn = false;
    writeJson(
      KEYS.BOARDS,
      this.getBoards().map((board) => {
        if (board.id !== boardId) return board;
        const has = board.productIds.includes(productId);
        isOn = !has;
        return { ...board, productIds: has ? board.productIds.filter((id) => id !== productId) : [...board.productIds, productId] };
      })
    );
    notify();
    return isOn;
  },

  boardsContaining(productId: string): OutfitBoard[] {
    return this.getBoards().filter((board) => board.productIds.includes(productId));
  },

  // Public closet -----------------------------------------------------------

  getClosetSettings(): ClosetSettings {
    return { isPublic: false, displayName: this.getDisplayName(), ...readJson<Partial<ClosetSettings>>(KEYS.CLOSET, {}) };
  },

  setClosetSettings(settings: ClosetSettings): void {
    writeJson(KEYS.CLOSET, settings);
    notify();
  },

  // Following feed "new since last visit" --------------------------------------

  /** Product ids that were in the Following feed the last time it was opened. */
  getFollowingSeenIds(): string[] | null {
    return readJson<string[] | null>(KEYS.FOLLOWING_SEEN, null);
  },

  markFollowingSeen(productIds: string[]): void {
    writeJson(KEYS.FOLLOWING_SEEN, productIds);
    notify();
  },

  // Saved-piece alerts (price drop, back in stock) -------------------------------

  getSavedSnapshots(): Record<string, SavedSnapshot> {
    return readJson<Record<string, SavedSnapshot>>(KEYS.SAVED_SNAPSHOTS, {});
  },

  snapshotSaved(product: Product): void {
    const snapshots = this.getSavedSnapshots();
    snapshots[product.id] = { price: product.price, status: product.status, at: new Date().toISOString() };
    writeJson(KEYS.SAVED_SNAPSHOTS, snapshots);
  },

  removeSnapshot(productId: string): void {
    const snapshots = this.getSavedSnapshots();
    delete snapshots[productId];
    writeJson(KEYS.SAVED_SNAPSHOTS, snapshots);
  },

  /** Diffs saved pieces against the state they had when saved. */
  getAlerts(products: Product[]): SavedAlert[] {
    const snapshots = this.getSavedSnapshots();
    const alerts: SavedAlert[] = [];
    for (const product of products) {
      const snapshot = snapshots[product.id];
      if (!snapshot) continue;
      if (product.price < snapshot.price) {
        alerts.push({ productId: product.id, type: 'price-drop', from: `₱${snapshot.price.toLocaleString()}`, to: `₱${product.price.toLocaleString()}` });
      } else if (product.price > snapshot.price) {
        alerts.push({ productId: product.id, type: 'price-up', from: `₱${snapshot.price.toLocaleString()}`, to: `₱${product.price.toLocaleString()}` });
      }
      if (product.status !== snapshot.status) {
        const type: SavedAlertType =
          product.status === 'Available' ? 'back-in-stock' : product.status === 'Sold Out' ? 'sold-out' : 'reserved';
        alerts.push({ productId: product.id, type, from: snapshot.status, to: product.status });
      }
    }
    return alerts;
  },

  /** Acknowledges alerts by re-snapshotting the current state. */
  dismissAlerts(products: Product[]): void {
    const snapshots = this.getSavedSnapshots();
    for (const product of products) {
      if (snapshots[product.id]) {
        snapshots[product.id] = { price: product.price, status: product.status, at: new Date().toISOString() };
      }
    }
    writeJson(KEYS.SAVED_SNAPSHOTS, snapshots);
    notify();
  },

  // PWA install banner ------------------------------------------------------

  isInstallDismissed(): boolean {
    return localStorage.getItem(KEYS.INSTALL_DISMISSED) === '1';
  },

  dismissInstall(): void {
    localStorage.setItem(KEYS.INSTALL_DISMISSED, '1');
    notify();
  },
};
