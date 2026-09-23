# Habi System Architecture & Feature Reference Guide

This document serves as the comprehensive architectural reference and codebase map for **Habi: Davao Local Fashion Discovery Platform**. It outlines the visual design system, frontend architecture, data models, state persistence, and a feature-by-feature index for future developers and AI agent navigation.

---

## Quick Navigation Index

- [1. System Philosophy & Purpose](#1-system-philosophy--purpose)
- [2. Visual Design System & Tokens](#2-visual-design-system--tokens)
- [3. Feature Directory & Code Map](#3-feature-directory--code-map)
  - [3.1 Editorial Fashion Discovery Feed](#31-editorial-fashion-discovery-feed)
  - [3.2 Davao Region Location Picker](#32-davao-region-location-picker)
  - [3.3 Style Aesthetic Filtering Engine](#33-style-aesthetic-filtering-engine)
  - [3.4 1-of-1 Thrift Inventory & Instant Inquiry](#34-1-of-1-thrift-inventory--instant-inquiry)
  - [3.5 Seller Storefront Profiles & Verification](#35-seller-storefront-profiles--verification)
  - [3.6 Scheduled Drops Release Engine](#36-scheduled-drops-release-engine)
  - [3.7 Interactive Davao Region Fashion Map](#37-interactive-davao-region-fashion-map)
  - [3.8 Davao Fit Check Community Feed](#38-davao-fit-check-community-feed)
  - [3.9 Seller Analytics Dashboard Portal](#39-seller-analytics-dashboard-portal)
  - [3.10 Personal Saved Closet & Wishlist](#310-personal-saved-closet--wishlist)
- [4. Repository Directory Structure](#4-repository-directory-structure)
- [5. Data Models & TypeScript Schemas](#5-data-models--typescript-schemas)
- [6. Build, Verification & Execution Commands](#6-build-verification--execution-commands)

---

## 1. System Philosophy & Purpose

Habi is a web platform designed for the **Davao Region, Philippines** (Davao City, Tagum, Digos, Panabo, Mati, Samal) to help people discover small local clothing brands, 1-of-1 thrift archives, vintage sellers, streetwear brands, and independent fashion businesses.

### Core Philosophy
**DISCOVER -> FOLLOW -> EXPLORE -> DROP -> BUY**

Rather than a transactional search-to-buy e-commerce marketplace (like Shopee or Lazada), Habi functions as a digital fashion magazine combined with a social discovery catalog and an interactive local directory.

---

## 2. Visual Design System & Tokens

Habi adheres to a high-contrast, minimalist monochrome design system inspired by high-fashion editorial lookbooks.

### 2.1 Color System (Dominant White Canvas)
* **Dominant Canvas**: Pure Crisp White (`#FFFFFF`) and Soft Off-White (`#FAFAFA`) establishing an ultra-clean, spacious background.
* **Primary Contrast**: Deep Obsidian Black (`#09090B`) used for high-impact typography, primary action buttons, active tab indicators, and hairline borders.
* **Neutral Surface**: Soft Gray (`#F4F4F5` / `#E4E4E7`) for image card containers, metadata tags, and secondary backgrounds.
* **Muted Copy**: Slate Gray (`#71717A` / `#A1A1AA`) for secondary timestamps, category metadata, and district location labels.

### 2.2 Typography & Spacing
* **Headings & Badges**: Monospace bold tracked typography (`font-mono font-black uppercase tracking-tight`) for logo (`HABI`), hero titles, and drop badges.
* **Body Copy**: Clean sans-serif system font stack (`font-sans`) for descriptions and text readability.
* **Borders & Radii**: 12px to 24px rounded corners (`rounded-2xl`, `rounded-3xl`) with 1px hairline borders (`border border-zinc-200`).

### 2.3 Strict Project Constraints
* **Zero Emoji Directive**: 100% SVG vector icons via Lucide React (`lucide-react`). Zero emojis permitted in UI, badges, buttons, logs, or commit messages.
* **Zero Em-Dash Directive**: Clean punctuation only. Zero em-dashes (`—` or `–`) permitted in copy, code, or documentation.
* **Anti-Eyebrow-Pill Directive**: No formulaic pill badges hovering above main headlines.

---

## 3. Feature Directory & Code Map

### 3.1 Editorial Fashion Discovery Feed
* **What It Does**: Showcases trending Davao local fashion, featured seller drops, and 1-of-1 thrift pieces in a visual magazine lookbook layout.
* **Where to Find It**:
  - View Component: [`src/App.tsx`](file:///c:/Users/User/Pictures/Habi/src/App.tsx) (Tab: `feed`)
  - Hero Header: [`src/components/feed/EditorialHero.tsx`](file:///c:/Users/User/Pictures/Habi/src/components/feed/EditorialHero.tsx)
  - Product Card: [`src/components/feed/ProductCard.tsx`](file:///c:/Users/User/Pictures/Habi/src/components/feed/ProductCard.tsx)
  - Product Grid Container: [`src/components/feed/ProductGrid.tsx`](file:///c:/Users/User/Pictures/Habi/src/components/feed/ProductGrid.tsx)

### 3.2 Davao Region Location Picker
* **What It Does**: Filters all products, sellers, and map markers by Davao Region cities (All Davao Region, Davao City, Tagum City, Digos City, Panabo City, Mati City, Samal Island).
* **Where to Find It**:
  - Header Picker: [`src/components/layout/NavigationHeader.tsx`](file:///c:/Users/User/Pictures/Habi/src/components/layout/NavigationHeader.tsx)
  - Mobile Drawer: [`src/components/layout/NavigationDrawer.tsx`](file:///c:/Users/User/Pictures/Habi/src/components/layout/NavigationDrawer.tsx)
  - Query Filter: [`src/services/fashionService.ts`](file:///c:/Users/User/Pictures/Habi/src/services/fashionService.ts)

### 3.3 Style Aesthetic Filtering Engine
* **What It Does**: Filters items by fashion subcultures (Streetwear, Vintage, Y2K, Techwear, Gorpcore, Minimalist, Workwear) and toggleable 1-of-1 Thrift filter.
* **Where to Find It**:
  - Filter Bar: [`src/components/feed/AestheticFilterBar.tsx`](file:///c:/Users/User/Pictures/Habi/src/components/feed/AestheticFilterBar.tsx)
  - Filter Logic: `fashionService.getProducts()` in [`src/services/fashionService.ts`](file:///c:/Users/User/Pictures/Habi/src/services/fashionService.ts)

### 3.4 1-of-1 Thrift Inventory & Instant Inquiry
* **What It Does**: Displays detailed piece specs (Size, Condition, 1-of-1 Thrift Archive badge, PHP Price) and generates pre-formatted inquiry text for Instagram DM, Facebook Messenger, or WhatsApp. The inquiry action is pinned to the bottom of the surface so it stays reachable without scrolling, and a conditional variant block renders size chips, colourway swatches, and a stock-clamped quantity stepper only for multi-stock items. 1-of-1 pieces state `1 OF 1` instead and never offer a quantity control.
* **Where to Find It**:
  - Item Modal: [`src/components/product/ProductDetailModal.tsx`](file:///c:/Users/User/Pictures/Habi/src/components/product/ProductDetailModal.tsx)
  - Inquiry Generator: [`src/components/product/InstantInquiryModal.tsx`](file:///c:/Users/User/Pictures/Habi/src/components/product/InstantInquiryModal.tsx)

### 3.5 Seller Storefront Profiles & Verification
* **What It Does**: Dedicated storefront profile for Davao sellers with cover banner, logo avatar, verification badge (*Verified Business*, *Local Seller*), bio, social links, follower count, and item/drop tabs.
* **Where to Find It**:
  - Storefront Header: [`src/components/seller/SellerHeader.tsx`](file:///c:/Users/User/Pictures/Habi/src/components/seller/SellerHeader.tsx)
  - Storefront View: [`src/components/seller/SellerStorefront.tsx`](file:///c:/Users/User/Pictures/Habi/src/components/seller/SellerStorefront.tsx)
  - Brand Directory: [`src/App.tsx`](file:///c:/Users/User/Pictures/Habi/src/App.tsx) (Tab: `brands`)

### 3.6 Scheduled Drops Release Engine
* **What It Does**: Manages upcoming Davao collection drops with live ticking countdown timers (Days:Hours:Mins:Secs), preview catalog drawers, and "Remind Me" notification toggles.
* **Where to Find It**:
  - Countdown Timer: [`src/components/drops/DropCountdownTimer.tsx`](file:///c:/Users/User/Pictures/Habi/src/components/drops/DropCountdownTimer.tsx)
  - Drop Card: [`src/components/drops/DropCard.tsx`](file:///c:/Users/User/Pictures/Habi/src/components/drops/DropCard.tsx)
  - Drops Showcase View: [`src/views/DropsView.tsx`](file:///c:/Users/User/Pictures/Habi/src/views/DropsView.tsx)

### 3.7 Interactive Davao Region Fashion Map
* **What It Does**: Interactive Leaflet map centered on Davao (`7.0707, 125.6087`) rendering dual-layer pins (Solid black pins for physical stores & pop-ups; White outline pins for online creator neighborhood areas).
* **Where to Find It**:
  - Map Component: [`src/components/map/DavaoFashionMap.tsx`](file:///c:/Users/User/Pictures/Habi/src/components/map/DavaoFashionMap.tsx)
  - Leaflet CSS Config: [`index.html`](file:///c:/Users/User/Pictures/Habi/index.html)

### 3.8 Davao Fit Check Community Feed
* **What It Does**: Community outfit posts featuring interactive image tag pins that reveal tagged Davao seller pieces and direct storefront links.
* **Where to Find It**:
  - Outfit Card: [`src/components/community/FitCheckCard.tsx`](file:///c:/Users/User/Pictures/Habi/src/components/community/FitCheckCard.tsx)
  - Community Feed View: [`src/views/FitCheckView.tsx`](file:///c:/Users/User/Pictures/Habi/src/views/FitCheckView.tsx)

### 3.9 Seller Analytics Dashboard Portal
* **What It Does**: Seller portal with performance metrics cards (Profile Views, Product Saves, Followers, Inventory Count), inventory status cycler (`Available` -> `Reserved` -> `Sold Out`), and new item listing creator.
* **Where to Find It**:
  - Dashboard Component: [`src/components/seller/SellerDashboard.tsx`](file:///c:/Users/User/Pictures/Habi/src/components/seller/SellerDashboard.tsx)

### 3.10 Personal Saved Closet & Wishlist
* **What It Does**: Displays user saved products, followed Davao creators, and drop reminders with localStorage state persistence.
* **Where to Find It**:
  - Saved View: [`src/views/SavedView.tsx`](file:///c:/Users/User/Pictures/Habi/src/views/SavedView.tsx)
  - Storage Manager: [`src/services/storageService.ts`](file:///c:/Users/User/Pictures/Habi/src/services/storageService.ts)

---

## 4. Repository Directory Structure

```
c:\Users\User\Pictures\Habi\
├── docs/
│   ├── SYSTEM_ARCHITECTURE.md                 # System guide & feature index (this file)
│   ├── specs/2026-09-23-habi-davao-fashion-design.md # Full design specification
│   └── plans/2026-09-23-habi-davao-fashion-implementation.md # Implementation plan
├── src/
│   ├── components/
│   │   ├── community/
│   │   │   └── FitCheckCard.tsx              # Davao Fit Check outfit post card
│   │   ├── drops/
│   │   │   ├── DropCard.tsx                  # Collection drop card
│   │   │   └── DropCountdownTimer.tsx        # Live ticking countdown timer
│   │   ├── feed/
│   │   │   ├── AestheticFilterBar.tsx        # Style aesthetic filter chips
│   │   │   ├── EditorialHero.tsx             # Magazine-style discovery hero banner
│   │   │   ├── ProductCard.tsx               # 1-of-1 thrift product card
│   │   │   └── ProductGrid.tsx               # Responsive product grid container
│   │   ├── layout/
│   │   │   ├── BottomTabBar.tsx              # Persistent mobile bottom tab navigation
│   │   │   ├── FooterSection.tsx             # Directory footer
│   │   │   ├── NavigationDrawer.tsx          # Mobile menu drawer
│   │   │   └── NavigationHeader.tsx          # Responsive navigation header
│   │   ├── map/
│   │   │   └── DavaoFashionMap.tsx           # Leaflet Davao fashion map
│   │   ├── product/
│   │   │   ├── InstantInquiryModal.tsx       # Pre-formatted social message generator
│   │   │   └── ProductDetailModal.tsx        # Full item specification modal
│   │   └── seller/
│   │       ├── SellerDashboard.tsx           # Seller analytics & inventory portal
│   │       ├── SellerHeader.tsx              # Storefront profile header
│   │       └── SellerStorefront.tsx          # Storefront catalog & drops page
│   ├── data/
│   │   ├── mockDrops.ts                      # Davao drop dataset
│   │   ├── mockOutfitPosts.ts                # Community fit check dataset
│   │   ├── mockProducts.ts                   # Davao product catalog dataset
│   │   └── mockSellers.ts                    # Authentic Davao seller dataset
│   ├── services/
│   │   ├── fashionService.ts                 # Unified query & search service
│   │   └── storageService.ts                 # LocalStorage persistence manager
│   ├── types/
│   │   └── fashion.ts                        # TypeScript domain interfaces
│   ├── App.tsx                               # Application shell & view router
│   ├── index.css                             # Tailwind CSS & custom scrollbar styles
│   └── main.tsx                              # React entry point
├── index.html                                # HTML root & Leaflet stylesheet
├── package.json                              # Project dependencies
├── vite.config.ts                            # Vite config with @tailwindcss/vite plugin
└── JOURNAL.md                                # Severus development journal
```

---

## 5. Data Models & TypeScript Schemas

Defined in [`src/types/fashion.ts`](file:///c:/Users/User/Pictures/Habi/src/types/fashion.ts):

```typescript
export type VerificationStatus = 'Verified Business' | 'Local Seller' | 'Community Creator';

export interface LocationInfo {
  city: string;
  district: string;
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
  releaseTime: string;
  itemCount: number;
  coverImage: string;
  description: string;
  items: Product[];
  remindCount: number;
  isLive: boolean;
}
```

---

## 6. Build, Verification & Execution Commands

### Development Server
```bash
npm run dev -- --host 127.0.0.1 --port 3000
```

### Production Build
```bash
npm run build
```

### Linting / Type Check
```bash
npx tsc -b
```
