export type VerificationStatus = 'Verified Business' | 'Local Seller' | 'Community Creator';

export interface LocationInfo {
  city: string; // e.g. 'Davao City', 'Tagum', 'Digos', 'Panabo', 'Mati', 'Samal'
  district: string; // e.g. 'Matina', 'Bajada', 'Ecoland', 'Poblacion', 'Toril', 'Agdao'
  isPhysicalStore: boolean;
  address?: string;
  lat: number;
  lng: number;
  openingHours?: string;
}

export interface Seller {
  id: string;
  name: string;
  handle: string;
  logoUrl: string;
  coverUrl: string;
  description: string;
  verificationStatus: VerificationStatus;
  location: LocationInfo;
  categories: string[];
  aesthetics: string[];
  followerCount: number;
  viewCount: number;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    whatsapp?: string;
  };
}

export interface Colourway {
  name: string;
  hex?: string;
  images: string[];
}

export interface Product {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerHandle: string;
  sellerLogo: string;
  name: string;
  price: number;
  images: string[];
  description: string;
  category: string;
  condition: 'Brand New' | 'Like New' | 'Good Vintage' | 'Fair';
  size: string;
  availableQuantity: number;
  isOneOfOne: boolean;
  sizes?: string[];           // multi-stock brand items only; omit on 1-of-1 pieces
  colourways?: Colourway[];   // omit when the piece exists in a single colourway
  status: 'Available' | 'Reserved' | 'Sold Out';
  location: string;
  tags: string[];
  aesthetics: string[];
  saveCount: number;
  viewCount: number;
  dateAdded: string;
}

export interface Drop {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerHandle: string;
  sellerLogo: string;
  title: string;
  releaseTime: string; // ISO date string
  itemCount: number;
  coverImage: string;
  description: string;
  items: Product[];
  remindCount: number;
  isLive: boolean;
}

export interface TaggedItem {
  id: string;
  xPercentage: number;
  yPercentage: number;
  productId: string;
  sellerId: string;
  sellerName: string;
  itemTitle: string;
  price: number;
}

export interface FitCheckPost {
  id: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  imageUrl: string;
  caption: string;
  location: string;
  likesCount: number;
  datePosted: string;
  taggedItems: TaggedItem[];
}

export interface FashionEvent {
  id: string;
  title: string;
  location: string;
  venue: string;
  date: string;
  description: string;
  organizerId: string;
  bannerImage: string;
}
