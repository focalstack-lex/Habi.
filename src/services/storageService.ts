const STORAGE_KEYS = {
  SAVED_PRODUCTS: 'habi_saved_products',
  FOLLOWED_SELLERS: 'habi_followed_sellers',
  DROP_REMINDERS: 'habi_drop_reminders',
};

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
  }
};
