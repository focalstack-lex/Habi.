import type { Moodboard } from '../types/fashion';

const STORAGE_KEYS = {
  SAVED_PRODUCTS: 'habi_saved_products',
  FOLLOWED_SELLERS: 'habi_followed_sellers',
  DROP_REMINDERS: 'habi_drop_reminders',
  MOODBOARDS: 'habi_moodboards',
};

const DEFAULT_MOODBOARDS: Moodboard[] = [
  {
    id: 'mb-1',
    name: 'Davao Streetwear Inspo',
    description: 'Curated local Davao oversized tees, cargo pants, and vintage hoodies.',
    productIds: ['prod-1', 'prod-4'],
    isPublic: true,
    createdAt: '2026-09-20',
    pinCount: 24,
  },
  {
    id: 'mb-2',
    name: 'Vintage Denim Vault',
    description: 'Authentic 90s faded washes, Carhartt duck pants, and Japanese denim.',
    productIds: ['prod-2', 'prod-7'],
    isPublic: true,
    createdAt: '2026-09-22',
    pinCount: 18,
  },
  {
    id: 'mb-3',
    name: 'Gorpcore & Outerwear',
    description: 'Utility vests, technical windbreakers, and tactical bags across Mindanao.',
    productIds: ['prod-3', 'prod-8'],
    isPublic: true,
    createdAt: '2026-09-24',
    pinCount: 12,
  },
];

export const storageService = {
  getSavedProducts(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAVED_PRODUCTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  toggleSaveProduct(productId: string): boolean {
    const saved = this.getSavedProducts();
    const isSaved = saved.includes(productId);
    const updated = isSaved
      ? saved.filter((id) => id !== productId)
      : [...saved, productId];
    localStorage.setItem(STORAGE_KEYS.SAVED_PRODUCTS, JSON.stringify(updated));
    return !isSaved;
  },

  isProductSaved(productId: string): boolean {
    return this.getSavedProducts().includes(productId);
  },

  getFollowedSellers(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FOLLOWED_SELLERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  toggleFollowSeller(sellerId: string): boolean {
    const followed = this.getFollowedSellers();
    const isFollowed = followed.includes(sellerId);
    const updated = isFollowed
      ? followed.filter((id) => id !== sellerId)
      : [...followed, sellerId];
    localStorage.setItem(STORAGE_KEYS.FOLLOWED_SELLERS, JSON.stringify(updated));
    return !isFollowed;
  },

  isSellerFollowed(sellerId: string): boolean {
    return this.getFollowedSellers().includes(sellerId);
  },

  getDropReminders(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DROP_REMINDERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  toggleDropReminder(dropId: string): boolean {
    const reminders = this.getDropReminders();
    const hasReminder = reminders.includes(dropId);
    const updated = hasReminder
      ? reminders.filter((id) => id !== dropId)
      : [...reminders, dropId];
    localStorage.setItem(STORAGE_KEYS.DROP_REMINDERS, JSON.stringify(updated));
    return !hasReminder;
  },

  hasDropReminder(dropId: string): boolean {
    return this.getDropReminders().includes(dropId);
  },

  // Moodboards Storage & Operations
  getMoodboards(): Moodboard[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MOODBOARDS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.MOODBOARDS, JSON.stringify(DEFAULT_MOODBOARDS));
        return DEFAULT_MOODBOARDS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_MOODBOARDS;
    }
  },

  saveMoodboards(boards: Moodboard[]): void {
    localStorage.setItem(STORAGE_KEYS.MOODBOARDS, JSON.stringify(boards));
  },

  createMoodboard(name: string, description: string = ''): Moodboard {
    const boards = this.getMoodboards();
    const newBoard: Moodboard = {
      id: `mb-${Date.now()}`,
      name,
      description,
      productIds: [],
      isPublic: true,
      createdAt: new Date().toISOString().split('T')[0],
      pinCount: 1,
    };
    const updated = [newBoard, ...boards];
    this.saveMoodboards(updated);
    return newBoard;
  },

  deleteMoodboard(id: string): void {
    const boards = this.getMoodboards();
    const updated = boards.filter((b) => b.id !== id);
    this.saveMoodboards(updated);
  },

  togglePinToMoodboard(boardId: string, productId: string): boolean {
    const boards = this.getMoodboards();
    let isPinnedNow = false;
    const updated = boards.map((board) => {
      if (board.id === boardId) {
        const exists = board.productIds.includes(productId);
        isPinnedNow = !exists;
        const newProductIds = exists
          ? board.productIds.filter((id) => id !== productId)
          : [...board.productIds, productId];
        return { ...board, productIds: newProductIds };
      }
      return board;
    });
    this.saveMoodboards(updated);
    return isPinnedNow;
  },

  isProductPinnedToMoodboard(boardId: string, productId: string): boolean {
    const boards = this.getMoodboards();
    const board = boards.find((b) => b.id === boardId);
    return board ? board.productIds.includes(productId) : false;
  },

  getProductMoodboardIds(productId: string): string[] {
    const boards = this.getMoodboards();
    return boards
      .filter((b) => b.productIds.includes(productId))
      .map((b) => b.id);
  },

  getPinCountForProduct(productId: string): number {
    const boards = this.getMoodboards();
    let localCount = 0;
    boards.forEach((b) => {
      if (b.productIds.includes(productId)) localCount += 1;
    });
    // Add baseline seed count for community social proof
    const hash = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const seedBase = (hash % 15) + 3;
    return seedBase + localCount;
  },
};

