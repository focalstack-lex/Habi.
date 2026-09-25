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
  theme?: SellerTheme;
}

export interface Colourway {
  name: string;
  hex?: string;
  images: string[];
}

/** Garment measurements in centimetres, filled by the seller. */
export interface Measurements {
  pitToPit?: number;
  length?: number;
  shoulder?: number;
  sleeve?: number;
  waist?: number;
  hips?: number;
  rise?: number;
  inseam?: number;
}

export interface FlawPhoto {
  imageUrl: string;
  note: string;
}

export interface SellerTheme {
  /** Hex accent used for the follow button, active tabs, and pills on the storefront. */
  accent: string;
  layout: 'banner' | 'minimal' | 'split';
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
  measurements?: Measurements;
  flawPhotos?: FlawPhoto[];
  conditionNotes?: string;
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
  /** Weekly style challenge tag the post was submitted to, e.g. `y2k-week`. */
  challengeTag?: string;
}

export interface FitCheckComment {
  id: string;
  postId: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export type FashionEventType = 'ukay-market' | 'pop-up' | 'launch' | 'swap-meet';

export interface FashionEvent {
  id: string;
  title: string;
  type: FashionEventType;
  location: string;      // city
  venue: string;
  address?: string;
  date: string;          // ISO start
  endDate?: string;      // ISO end
  description: string;
  organizerId?: string;
  organizerName: string;
  bannerImage: string;
  lat: number;
  lng: number;
  url?: string;
}

export interface OutfitBoard {
  id: string;
  name: string;
  productIds: string[];
  createdAt: string;
}

export type ReportReason = 'counterfeit' | 'scam' | 'wrong-photos' | 'prohibited' | 'other';

export interface ProductReport {
  id: string;
  productId: string;
  productName: string;
  sellerId: string;
  reason: ReportReason;
  note: string;
  createdAt: string;
  status: 'open' | 'dismissed' | 'actioned';
}

export interface SizeProfile {
  tops: string[];            // XS, S, M, L, XL, XXL, 3XL
  waistMin: number | null;   // inches
  waistMax: number | null;
  shoes: string[];           // US sizes as strings, e.g. "9", "9.5"
}

export interface StyleProfile {
  aesthetics: string[];
  completedAt: string | null;
}

export interface ReplyTemplate {
  id: string;
  name: string;
  text: string;
}
