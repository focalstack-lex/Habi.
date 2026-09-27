import type { Product, Seller, Drop, FitCheckPost } from '../types/fashion';
import { catalogService } from './catalogService';
import { communityService } from './communityService';

export interface ProductFilters {
  city?: string;
  category?: string;
  aesthetic?: string;
  minPrice?: number;
  maxPrice?: number;
  isOneOfOne?: boolean;
  searchQuery?: string;
}

export const fashionService = {
  getProducts(filters?: ProductFilters): Product[] {
    let result = catalogService.getVisibleProducts();

    if (!filters) return result;

    if (filters.city && filters.city !== 'All Davao Region') {
      result = result.filter((p) => p.location.toLowerCase().includes(filters.city!.toLowerCase()));
    }

    if (filters.category && filters.category !== 'All') {
      result = result.filter((p) => p.category.toLowerCase() === filters.category!.toLowerCase());
    }

    if (filters.aesthetic && filters.aesthetic !== 'All') {
      result = result.filter((p) =>
        p.aesthetics.some((a) => a.toLowerCase() === filters.aesthetic!.toLowerCase())
      );
    }

    if (filters.isOneOfOne) {
      result = result.filter((p) => p.isOneOfOne);
    }

    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sellerName.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  },

  getProductById(id: string): Product | undefined {
    return catalogService.getVisibleProducts().find((p) => p.id === id);
  },

  getProductsBySeller(sellerId: string): Product[] {
    return catalogService.getVisibleProducts().filter((p) => p.sellerId === sellerId);
  },

  getSellers(searchQuery?: string): Seller[] {
    const sellers = catalogService.getVisibleSellers();
    if (!searchQuery || searchQuery.trim() === '') {
      return sellers;
    }
    const q = searchQuery.toLowerCase();
    return sellers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.handle.toLowerCase().includes(q) ||
        s.location.city.toLowerCase().includes(q) ||
        s.location.district.toLowerCase().includes(q) ||
        s.aesthetics.some((a) => a.toLowerCase().includes(q))
    );
  },

  getSellerById(id: string): Seller | undefined {
    return catalogService.getSellerById(id);
  },

  getSellerByHandle(handle: string): Seller | undefined {
    return catalogService.getSellerByHandle(handle);
  },

  /** Bundled and seller-scheduled drops, soonest first, minus suspended sellers. */
  getDrops(): Drop[] {
    return catalogService.getVisibleDrops();
  },

  getDropById(id: string): Drop | undefined {
    return catalogService.getDropById(id);
  },

  getOutfitPosts(): FitCheckPost[] {
    return communityService.getPosts();
  }
};
