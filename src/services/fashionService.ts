import type { Product, Seller, Drop, FitCheckPost } from '../types/fashion';
import { mockProducts } from '../data/mockProducts';
import { mockSellers } from '../data/mockSellers';
import { mockDrops } from '../data/mockDrops';
import { mockOutfitPosts } from '../data/mockOutfitPosts';

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
    let result = [...mockProducts];

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
    return mockProducts.find((p) => p.id === id);
  },

  getProductsBySeller(sellerId: string): Product[] {
    return mockProducts.filter((p) => p.sellerId === sellerId);
  },

  getSellers(searchQuery?: string): Seller[] {
    if (!searchQuery || searchQuery.trim() === '') {
      return mockSellers;
    }
    const q = searchQuery.toLowerCase();
    return mockSellers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.handle.toLowerCase().includes(q) ||
        s.location.city.toLowerCase().includes(q) ||
        s.location.district.toLowerCase().includes(q) ||
        s.aesthetics.some((a) => a.toLowerCase().includes(q))
    );
  },

  getSellerById(id: string): Seller | undefined {
    return mockSellers.find((s) => s.id === id);
  },

  getDrops(): Drop[] {
    return mockDrops;
  },

  getOutfitPosts(): FitCheckPost[] {
    return mockOutfitPosts;
  }
};
