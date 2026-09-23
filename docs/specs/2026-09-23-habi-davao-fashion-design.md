# Design Specification: Habi - Davao Local Fashion Discovery Platform

Date: 2026-09-23
Status: Proposed
Target Workspace: `c:\Users\User\Pictures\Habi`

---

## 1. Overview & Vision

Habi is a digital fashion community, visual discovery platform, and local marketplace tailored specifically for the Davao Region, Philippines. It connects fashion buyers with small independent clothing brands, thrift shops, vintage sellers, streetwear creators, and local boutiques across Davao City, Tagum, Digos, Panabo, Mati, and Samal.

The core product philosophy follows:
**DISCOVER -> FOLLOW -> EXPLORE -> DROP -> BUY**

Rather than traditional search-to-buy e-commerce grid layouts, Habi combines digital fashion magazine editorial design with social discovery, interactive map exploration, and instant local inquiry.

---

## 2. Target Persona & Use Cases

* **Fashion Buyers**: Discover thrift finds, 1-of-1 vintage garments, local streetwear, and accessories by aesthetic style, seller location, and drop countdowns.
* **Small Fashion Sellers**: Establish a professional online storefront, publish scheduled collection drops, track profile/product views and saves, and receive instant customer inquiries via Instagram DM, Facebook Messenger, or WhatsApp.

---

## 3. Technology Stack & Standards

* **Framework & Build**: React 19 + TypeScript + Vite
* **Styling**: Tailwind CSS + Custom CSS Variables Token Architecture
* **Icons & Vector Assets**: Lucide React (High-precision SVG vector icons; strict Zero Emoji Directive)
* **Map Engine**: Leaflet + React-Leaflet with custom SVG map markers
* **State & Data**: Modular TypeScript service layer with localStorage persistence for user state (saves, follows, reminders, seller inventory) and rich Davao mock dataset.
* **Design Guidelines**: 
  - Zero Emoji Directive (strict SVG vector icons)
  - Zero Em-Dash Directive (standard punctuation only)
  - Anti-Eyebrow-Pill Directive (no formulaic badges above headlines)
  - Omnichannel Responsiveness (Mobile, Tablet, Desktop, Widescreen)

### 3.1 Monochrome Aesthetic & Color System (Dominant White)
Inspired by minimalist high-fashion editorial lookbooks and reference designs:
* **Dominant Background**: Pure Crisp White (`#FFFFFF`) and Soft Off-White (`#FAFAFA`) establishing an ultra-clean, spacious canvas.
* **Primary Contrast**: Deep Obsidian Black (`#09090B`) used for high-impact typography, primary CTA buttons, active state chips, and crisp hairline borders.
* **Neutral Surface**: Soft Gray (`#F4F4F5` / `#E4E4E7`) for subtle image containers, card backgrounds, and inactive control badges.
* **Secondary Micro-Copy**: Muted Slate (`#71717A` / `#A1A1AA`) for category labels, size metadata, and secondary timestamps.
* **Typography Hierarchy**: Bold tracked uppercase headings (e.g., `HABI`, `ESSENTIAL OVERSIZED HOODIE`, `DAVAO FIT CHECK`) paired with clean sans-serif body copy (Inter / System Sans).
* **Card & Container Radius**: Clean 12px to 16px rounded corners with subtle hairline borders (`border border-zinc-200`) and high-fashion image aspect ratios (3:4, 1:1, 16:9).

---

## 4. Architecture & Component Structure

```
src/
├── assets/                  # Brand assets and visual imagery
├── components/
│   ├── layout/
│   │   ├── NavigationHeader.tsx    # Responsive header, search bar, location picker
│   │   ├── NavigationDrawer.tsx    # Mobile slide-out drawer
│   │   └── FooterSection.tsx       # Platform footer & local directory links
│   ├── feed/
│   │   ├── EditorialHero.tsx       # Magazine-style featured Davao brand/drop banner
│   │   ├── AestheticFilterBar.tsx  # Aesthetic chips (Streetwear, Y2K, Vintage, etc.)
│   │   ├── ProductCard.tsx         # Visual product card with 1-of-1 thrift badge
│   │   └── ProductGrid.tsx         # Masonry / responsive grid container
│   ├── seller/
│   │   ├── SellerHeader.tsx        # Storefront banner, logo, verification badge
│   │   ├── SellerStorefront.tsx    # Complete seller profile view
│   │   └── SellerDashboard.tsx     # Seller analytics & inventory manager
│   ├── product/
│   │   ├── ProductDetailModal.tsx  # Full-screen / modal product detail & inquiry
│   │   └── InstantInquiryModal.tsx # Pre-formatted social message generator
│   ├── drops/
│   │   ├── DropCard.tsx            # Drop countdown card with preview drawer
│   │   └── DropCountdownTimer.tsx  # Live countdown display component
│   ├── map/
│   │   └── DavaoFashionMap.tsx     # Interactive Leaflet map with dual-layer pins
│   ├── community/
│   │   └── FitCheckFeed.tsx        # Davao Fit Check outfit posts with tag pins
│   └── common/
│       ├── Badge.tsx               # Minimalist category & verification badges
│       └── StatCard.tsx            # Dashboard metric display cards
├── data/
│   ├── mockSellers.ts              # Authentic Davao seller dataset
│   ├── mockProducts.ts             # Davao local fashion catalog items
│   ├── mockDrops.ts                # Scheduled Davao collection drops
│   ├── mockOutfitPosts.ts          # Community Davao fit checks
│   └── mockEvents.ts               # Local Davao fashion market events
├── services/
│   ├── fashionService.ts           # Unified data querying & filtering service
│   └── storageService.ts           # LocalStorage state manager (saves, follows, drops)
├── types/
│   └── fashion.ts                  # Comprehensive TypeScript interfaces
├── App.tsx                         # Main app shell & tab routing
└── index.css                       # Design tokens & baseline utilities
```

---

## 5. Detailed Component Specifications

### 5.1 Main App Navigation (`NavigationHeader.tsx`)
- Platform branding: "HABI" (Monospace tracked typography logo)
- Davao Region Location Selector dropdown (All Davao Region, Davao City, Tagum, Digos, Panabo, Mati, Samal)
- Global search input for products, sellers, aesthetics, and thrift items
- Primary view tab navigation:
  1. **Feed**: Editorial magazine & visual product discovery stream
  2. **Discover**: Style aesthetic filter catalog
  3. **Drops**: Scheduled collection releases & countdowns
  4. **Map**: Interactive Davao fashion map
  5. **Brands**: Davao local seller directory
  6. **Community**: Davao Fit Check outfit posts
  7. **Saved**: User wishlist and followed brands
  8. **Seller Dashboard**: Seller management portal toggle

### 5.2 Fashion Discovery Feed (`EditorialHero.tsx`, `ProductGrid.tsx`)
- High-impact editorial hero section highlighting "Davao Brand of the Week" and upcoming major drops.
- Aesthetic filter bar supporting tags: Streetwear, Vintage, Y2K, Minimalist, Techwear, Gorpcore, Workwear, Korean-Inspired, Handmade.
- Product card displaying high-res photography, price in PHP (₱), seller name, location district, size badge, and condition indicator (e.g. 1-of-1 Vintage).

### 5.3 Seller Storefront Profile (`SellerStorefront.tsx`)
- Cover photo banner and brand logo avatar.
- Seller metadata: Brand name, handle (`@voidarchive`), verified status badge (Verified Business / Local Seller), location (e.g. Davao City - Matina), bio, and social links (Instagram, Facebook, TikTok).
- Storefront tabs: Products, Scheduled Drops, Store Location (for physical stores), and Brand Story.
- Follow / Unfollow toggle button updating follower count in real time.

### 5.4 1-of-1 Thrift Inquiry (`ProductDetailModal.tsx`, `InstantInquiryModal.tsx`)
- Full image carousel and item specifications (Price, Size, Condition, Stock Quantity, Aesthetic Tags).
- Primary CTA button: **Inquire / Reserve via Instant Message**.
- Clicking CTA opens inquiry modal with options for Instagram DM, Facebook Messenger, or WhatsApp.
- Pre-formatted inquiry message generator:
  > *"Hi! I found your item [Vintage Levi's 501 - ₱850] on Habi. Is this 1-of-1 piece still available for pickup/shipping in Davao?"*

### 5.5 Drops Countdown & Preview (`DropCard.tsx`, `DropCountdownTimer.tsx`)
- Display upcoming drop title, seller profile, release date/time, total piece count, and hero image.
- Real-time countdown timer updating every second (Days, Hours, Minutes, Seconds).
- Drop catalog preview drawer displaying items that will unlock at launch.
- "Remind Me" notification toggle and "Add Drop Items to Wishlist" action.

### 5.6 Interactive Davao Fashion Map (`DavaoFashionMap.tsx`)
- Interactive Leaflet map centered on Davao City (`7.0707° N, 125.6087° E`).
- **Physical Stores**: Custom solid pin markers showing exact addresses (e.g. Roxas Avenue, Matina Town Square, Bajada). Clicking opens store popup with opening hours, directions, and storefront link.
- **Online Creators**: Neighborhood area markers (e.g. "Davao City - Ecoland Area") providing local neighborhood context without revealing private residential addresses.
- Map filter overlay by distance, city district, and style aesthetic.

### 5.7 Davao Fit Check Community (`FitCheckFeed.tsx`)
- User outfit check feed featuring local Davao street style photos.
- Interactive photo tag markers overlaid on garments (e.g. Shirt tag, Pants tag).
- Tapping a tag pin displays seller name, product title, price, and direct link to the seller storefront.

### 5.8 Seller Dashboard (`SellerDashboard.tsx`)
- Performance metrics cards: Total Profile Views, Product Saves, Followers, Drop Views, and Top Performing Listings.
- Product Inventory Manager: Add new listings, set 1-of-1 thrift tags, update stock status (Available, Reserved, Sold).
- Drop Builder: Schedule new collection drops with release dates and piece counts.

---

## 6. Data Schema Definition (`types/fashion.ts`)

```typescript
export type VerificationStatus = 'Verified Business' | 'Local Seller' | 'Community Creator';

export interface LocationInfo {
  city: string; // e.g. 'Davao City', 'Tagum', 'Digos'
  district: string; // e.g. 'Matina', 'Bajada', 'Ecoland', 'Poblacion'
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
  xPercentage: number; // 0-100% on image
  yPercentage: number; // 0-100% on image
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
```

---

## 7. Verification Plan

### Automated Verification
* Run TypeScript type compilation check: `npx tsc --noEmit`
* Run production bundle build check: `npm run build`

### Manual Verification Matrix
1. **Responsive Viewport Testing**: Test layout across Mobile (375px), Tablet (768px), Desktop (1024px), and Widescreen (1440px+).
2. **Tab Navigation**: Confirm smooth view switching across Feed, Discover, Drops, Map, Brands, Community, Saved, and Seller Dashboard.
3. **Map Interactivity**: Verify Leaflet map renders Davao pins correctly and pops up seller cards on marker click.
4. **Drops Countdown**: Confirm live timer updates dynamically and items unlock correctly.
5. **Instant Message Inquiry**: Verify clicking "Inquire via Instant Message" generates formatted inquiry copy.
6. **State Persistence**: Verify saving products, following sellers, and setting drop reminders persist in localStorage across page reloads.
