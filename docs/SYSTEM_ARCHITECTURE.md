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
  - [3.11 Seller Accounts, ID Verification & Sign-In](#311-seller-accounts-id-verification--sign-in)
  - [3.12 Admin Control Room](#312-admin-control-room)
  - [3.13 Merged Catalog Layer](#313-merged-catalog-layer)
  - [3.14 Buyer Preferences, Feed Modes & Style Quiz](#314-buyer-preferences-feed-modes--style-quiz)
  - [3.15 Piece Detail Extras](#315-piece-detail-extras)
  - [3.16 Live Drops, Calendar & Reservations](#316-live-drops-calendar--reservations)
  - [3.17 Map Near Me & Pop-up Events](#317-map-near-me--pop-up-events)
  - [3.18 Community Posts, Comments & Challenges](#318-community-posts-comments--challenges)
  - [3.19 Boards, Alerts & Public Closet](#319-boards-alerts--public-closet)
  - [3.20 Seller Tools](#320-seller-tools)
  - [3.21 Routing, PWA, Dark Mode & Language](#321-routing-pwa-dark-mode--language)
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
* **Headings**: Cooper BT with the Fraunces web fallback (`font-cooper`, `font-outfit`, `text-display`, `text-headline`, `text-title`) for the logo, hero, view titles, card titles, and prices.
* **Body, Labels, Chips, Eyebrows**: Plus Jakarta Sans (`font-sans`; `font-avantgarde`, `font-syne`, and `text-meta` now resolve to the same face). The geometric Syne / Avant Garde face was dropped from micro copy because it rendered too thin below 12px on phones. Minimum label size is 11px, and labels on white use `text-zinc-500` or darker.
* **Technical Digits**: Space Mono (`font-mono`) only for the drop countdown and ID numbers in the admin view.
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
* **What It Does**: Portal for an approved, signed-in seller. Metric tiles (Profile Views, Product Saves, Followers, Available Pieces), inventory manager with status cycler (`Available` -> `Reserved` -> `Sold Out`) and two-tap delete, a listing creator with up to three downscaled photo uploads, aesthetics, sizes, and stock, and a storefront profile editor (logo, cover, bio, address, hours, social links). Listings are written to the catalog layer and appear in the public feed immediately.
* **Where to Find It**:
  - Dashboard Component: [`src/components/seller/SellerDashboard.tsx`](file:///c:/Users/User/Pictures/Habi/src/components/seller/SellerDashboard.tsx)
  - Portal Routing (sign-in, pending, dashboard, admin): `renderPortal()` in [`src/App.tsx`](file:///c:/Users/User/Pictures/Habi/src/App.tsx) (Tab: `dashboard`)

### 3.10 Personal Saved Closet & Wishlist
* **What It Does**: Displays user saved products, followed Davao creators, and drop reminders with localStorage state persistence.
* **Where to Find It**:
  - Saved View: [`src/views/SavedView.tsx`](file:///c:/Users/User/Pictures/Habi/src/views/SavedView.tsx)
  - Storage Manager: [`src/services/storageService.ts`](file:///c:/Users/User/Pictures/Habi/src/services/storageService.ts)

### 3.11 Seller Accounts, ID Verification & Sign-In
* **What It Does**: Gate for the seller portal. Sellers sign up through a three-step form (Account, Storefront, Verify ID). The ID step requires a document type from `VALID_ID_TYPES`, an ID number that matches that type's format after normalization, the name printed on the ID, a photo of the ID front (downscaled to a JPEG data URL, camera capture on phones), an optional business permit, and a declaration checkbox. Duplicate emails, handles (including bundled mock sellers), and ID numbers are refused. PhilSys National IDs are also sent (number, name, birth date, never the photo) to the backend proxy named by `VITE_ID_VERIFY_ENDPOINT`, which holds the eGov / PSA eVerify API key; a `not_matched` answer blocks sign-up, while an unconfigured or failing proxy records `not_configured` / `error` and defers to admin review (see [`docs/ID_VERIFICATION.md`](file:///c:/Users/User/Pictures/Habi/docs/ID_VERIFICATION.md)). New accounts start `pending` and see `ApplicationStatusView` until an admin decides; rejected accounts can resubmit a different ID from the same view. Passwords are salted and hashed with SHA-256 (Web Crypto, with a pure JS fallback for plain http origins). Admin registration needs the setup key from `VITE_ADMIN_SETUP_KEY`.
* **Where to Find It**:
  - Auth Shell & Mode Switch: [`src/components/auth/AuthView.tsx`](file:///c:/Users/User/Pictures/Habi/src/components/auth/AuthView.tsx)
  - Forms: [`SignInForm.tsx`](file:///c:/Users/User/Pictures/Habi/src/components/auth/SignInForm.tsx), [`SellerSignUpForm.tsx`](file:///c:/Users/User/Pictures/Habi/src/components/auth/SellerSignUpForm.tsx), [`AdminSignUpForm.tsx`](file:///c:/Users/User/Pictures/Habi/src/components/auth/AdminSignUpForm.tsx)
  - Pending / Rejected Status: [`src/components/auth/ApplicationStatusView.tsx`](file:///c:/Users/User/Pictures/Habi/src/components/auth/ApplicationStatusView.tsx)
  - Account Store, Validators, Hashing: [`src/services/authService.ts`](file:///c:/Users/User/Pictures/Habi/src/services/authService.ts)
  - eVerify Proxy Client: [`src/services/idVerificationService.ts`](file:///c:/Users/User/Pictures/Habi/src/services/idVerificationService.ts)
  - Image Downscaling: [`src/utils/image.ts`](file:///c:/Users/User/Pictures/Habi/src/utils/image.ts), [`src/components/common/ImageUploadField.tsx`](file:///c:/Users/User/Pictures/Habi/src/components/common/ImageUploadField.tsx)
  - Shared Form Primitives: [`src/components/common/FormControls.tsx`](file:///c:/Users/User/Pictures/Habi/src/components/common/FormControls.tsx)
  - Types: [`src/types/auth.ts`](file:///c:/Users/User/Pictures/Habi/src/types/auth.ts)

### 3.12 Admin Control Room
* **What It Does**: Admin-only view behind the same portal tab. Overview tiles (pending reviews, active sellers, live pieces, suspended), an Applications queue filtered by status with the full applicant record, the uploaded ID and permit (tap to enlarge), a name-mismatch warning, Approve as Local Seller or Verified Business, Reject or Revoke with a note the seller sees; a Sellers list (bundled and registered) with verification badge select, suspend and reinstate; and a Catalog list where seller-listed pieces are deleted and bundled demo pieces are hidden or restored. Approval publishes a `Seller` profile into the catalog layer under the account's `sellerProfileId`.
* **Where to Find It**:
  - Admin View: [`src/components/admin/AdminDashboard.tsx`](file:///c:/Users/User/Pictures/Habi/src/components/admin/AdminDashboard.tsx)
  - Decision Logic: `approveSeller`, `rejectSeller` in [`src/services/authService.ts`](file:///c:/Users/User/Pictures/Habi/src/services/authService.ts)

### 3.13 Merged Catalog Layer
* **What It Does**: `catalogService` merges the bundled mock dataset with seller-created sellers and products and admin moderation state (hidden products, suspended sellers, verification overrides), all persisted in `localStorage`. `fashionService` reads through it, so every public view queries the same visibility rules. Mutations call `notify()`; `useCatalogVersion()` (`useSyncExternalStore`) re-renders subscribers such as `App.tsx`, the seller dashboard, and the admin view.
* **Where to Find It**:
  - Catalog Store: [`src/services/catalogService.ts`](file:///c:/Users/User/Pictures/Habi/src/services/catalogService.ts)
  - Subscription Hook: [`src/hooks/useCatalogVersion.ts`](file:///c:/Users/User/Pictures/Habi/src/hooks/useCatalogVersion.ts)
  - Query Facade: [`src/services/fashionService.ts`](file:///c:/Users/User/Pictures/Habi/src/services/fashionService.ts)

### 3.14 Buyer Preferences, Feed Modes & Style Quiz
* **What It Does**: `FeedControls` adds For You / Following modes, a "Fits me" toggle driven by the buyer's size profile (`fitsProfile` parses "Large", "W32 L30", "US 9" into tops / waist / shoes), price range chips, and sort (newest, price, most saved). The first visit opens `StyleQuizModal` (pick up to three aesthetics); matching pieces are ranked first in For You. Following shows pieces from followed sellers and ribbons the ones added since the last visit. `RecentlyViewedStrip` sits under the grid. The header search offers recent searches, sellers, categories, and tags (`getSuggestions`), and an empty result lists `closestMatches`.
* **Where to Find It**: [`src/components/feed/FeedControls.tsx`](file:///c:/Users/User/Pictures/Habi/src/components/feed/FeedControls.tsx), [`StyleQuizModal.tsx`](file:///c:/Users/User/Pictures/Habi/src/components/feed/StyleQuizModal.tsx), [`RecentlyViewedStrip.tsx`](file:///c:/Users/User/Pictures/Habi/src/components/feed/RecentlyViewedStrip.tsx), [`src/utils/sizing.ts`](file:///c:/Users/User/Pictures/Habi/src/utils/sizing.ts), [`src/utils/search.ts`](file:///c:/Users/User/Pictures/Habi/src/utils/search.ts), the feed pipeline in [`src/App.tsx`](file:///c:/Users/User/Pictures/Habi/src/App.tsx), preferences in [`src/services/userPrefsService.ts`](file:///c:/Users/User/Pictures/Habi/src/services/userPrefsService.ts).

### 3.15 Piece Detail Extras
* **What It Does**: `ZoomableGallery` (scroll-snap swipe, dots, counter) with `ZoomOverlay` (pinch, pan, double-tap), `MeasurementsTable`, `ConditionGuideSheet` (four grades plus the seller's flaw photos and notes), `SimilarPiecesRow` (category, aesthetics, seller, and price scoring), `ReportListingModal` (writes `ProductReport`s for the admin Reports tab), `AddToBoardSheet`, share-as-image (`renderShareCard` draws a 1080x1920 PNG, `shareProductImage` uses the Web Share API or downloads), and a reservation note with cancel. Opening a piece records a view and a recent-view entry; saving snapshots price and status for alerts.
* **Where to Find It**: [`src/components/product/`](file:///c:/Users/User/Pictures/Habi/src/components/product/), [`src/utils/shareCard.ts`](file:///c:/Users/User/Pictures/Habi/src/utils/shareCard.ts).

### 3.16 Live Drops, Calendar & Reservations
* **What It Does**: `DropCard` ticks to its release time and flips into live mode: `LiveDropGrid` shows each piece with a first-come "Reserve" button (`catalogService.reserveProduct` sets the status to Reserved and remembers the reservation locally), "Yours" with cancel, and greyed sold pieces. Upcoming drops offer Google Calendar and `.ics` export. `DropCalendarStrip` filters the list by day over the next two weeks. Sellers schedule drops from the dashboard; `catalogService.getAllDrops()` merges them with the bundled ones. `drop-3` ships live for demos.
* **Where to Find It**: [`src/views/DropsView.tsx`](file:///c:/Users/User/Pictures/Habi/src/views/DropsView.tsx), [`src/components/drops/`](file:///c:/Users/User/Pictures/Habi/src/components/drops/), [`src/utils/calendar.ts`](file:///c:/Users/User/Pictures/Habi/src/utils/calendar.ts).

### 3.17 Map Near Me & Pop-up Events
* **What It Does**: A "Near me" control uses geolocation to place the buyer, append distances to pins, list the five nearest sellers, and link Google Maps directions. A "Pop-up markets" layer renders `mockEvents` (ukay markets, pop-ups, swap meets, launches) with their own drawer including calendar export.
* **Where to Find It**: [`src/components/map/DavaoFashionMap.tsx`](file:///c:/Users/User/Pictures/Habi/src/components/map/DavaoFashionMap.tsx), [`src/data/mockEvents.ts`](file:///c:/Users/User/Pictures/Habi/src/data/mockEvents.ts), [`src/utils/geo.ts`](file:///c:/Users/User/Pictures/Habi/src/utils/geo.ts).

### 3.18 Community Posts, Comments & Challenges
* **What It Does**: Buyers post fit checks (`NewFitCheckSheet`) with a photo, caption, city, and up to five tag pins placed on the photo (`TagPinPlacer` with a product picker). Likes and comments (`CommentsSheet`) persist per browser. `ChallengeBanner` shows the weekly style challenge from `communityService.getCurrentChallenge()`; posts can be submitted to it and filtered.
* **Where to Find It**: [`src/views/FitCheckView.tsx`](file:///c:/Users/User/Pictures/Habi/src/views/FitCheckView.tsx), [`src/components/community/`](file:///c:/Users/User/Pictures/Habi/src/components/community/), [`src/services/communityService.ts`](file:///c:/Users/User/Pictures/Habi/src/services/communityService.ts).

### 3.19 Boards, Alerts & Public Closet
* **What It Does**: The Saved view gained Alerts (diff of saved pieces against their saved-time snapshot: price drop, price up, back in stock, sold out, reserved), Outfit Boards (create, rename, add or remove pieces, share `#/board/...` links that encode the piece ids), and a Profile tab (display name, size profile, style profile, appearance, language, public closet toggle with a `#/closet` share link). Shared links render `SharedCollectionView`.
* **Where to Find It**: [`src/views/SavedView.tsx`](file:///c:/Users/User/Pictures/Habi/src/views/SavedView.tsx), [`src/components/saved/`](file:///c:/Users/User/Pictures/Habi/src/components/saved/), [`src/views/SharedCollectionView.tsx`](file:///c:/Users/User/Pictures/Habi/src/views/SharedCollectionView.tsx).

### 3.20 Seller Tools
* **What It Does**: The dashboard splits into Inventory (edit, duplicate, select all, bulk status, bulk delete), Add New Piece (`PieceForm` with measurements per category, condition notes, flaw photos), Drops (scheduler with live `DropCard` preview and list), Templates (quick replies with `{buyer} {piece} {price} {location}` placeholders, copied with sample values), Analytics (`MetricsChart` SVG columns over 7 days from `catalogService.getProductMetrics`, sample data flagged for bundled pieces), and Profile (storefront accent and layout picker stored on `seller.theme`, applied by `SellerHeader` and `SellerStorefront`).
* **Where to Find It**: [`src/components/seller/SellerDashboard.tsx`](file:///c:/Users/User/Pictures/Habi/src/components/seller/SellerDashboard.tsx), [`src/components/seller/dashboard/`](file:///c:/Users/User/Pictures/Habi/src/components/seller/dashboard/), [`src/components/seller/theme.ts`](file:///c:/Users/User/Pictures/Habi/src/components/seller/theme.ts), [`MetricsChart.tsx`](file:///c:/Users/User/Pictures/Habi/src/components/seller/MetricsChart.tsx).

### 3.21 Routing, PWA, Dark Mode & Language
* **What It Does**: Hash routes (`#/tab/:id`, `#/piece/:id`, `#/store/:handle`, `#/drop/:id`, `#/board/:slug?items=`, `#/closet?items=`) make pieces, storefronts, and boards shareable and give the browser back button meaning; `App.tsx` applies them on load and `hashchange`. `public/manifest.webmanifest`, generated PNG icons, and `public/sw.js` (shell cache, network-first navigations, registered in production only) make Habi installable; `InstallBanner` handles Chrome's prompt and the iOS hint. Dark mode remaps the Tailwind zinc, white, emerald, amber, and red variables under `.dark` in `index.css`, so no component needs `dark:` classes. `src/i18n` holds English and Bisaya strings with `useI18n()`; the language and theme live in `userPrefsService` and are exposed in the drawer, header, and Profile tab.
* **Where to Find It**: [`src/utils/router.ts`](file:///c:/Users/User/Pictures/Habi/src/utils/router.ts), [`src/components/layout/InstallBanner.tsx`](file:///c:/Users/User/Pictures/Habi/src/components/layout/InstallBanner.tsx), [`src/main.tsx`](file:///c:/Users/User/Pictures/Habi/src/main.tsx), [`src/index.css`](file:///c:/Users/User/Pictures/Habi/src/index.css), [`src/i18n/`](file:///c:/Users/User/Pictures/Habi/src/i18n/).

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
│   │   ├── admin/
│   │   │   └── AdminDashboard.tsx            # Admin control room: applications, sellers, catalog
│   │   ├── auth/
│   │   │   ├── AdminSignUpForm.tsx           # Admin registration with setup key
│   │   │   ├── ApplicationStatusView.tsx     # Pending / rejected seller status and ID resubmission
│   │   │   ├── AuthView.tsx                  # Portal shell switching sign-in and sign-up modes
│   │   │   ├── SellerSignUpForm.tsx          # Three-step seller application with ID upload
│   │   │   └── SignInForm.tsx                # Email and password sign-in
│   │   ├── common/
│   │   │   ├── CustomIcons.tsx               # Bespoke Habi vector icon set
│   │   │   ├── FormControls.tsx              # Field, Alert, Button, Segmented primitives
│   │   │   └── ImageUploadField.tsx          # Downscaling image picker with camera capture
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
│   ├── hooks/
│   │   └── useCatalogVersion.ts              # Re-render subscribers on catalog changes
│   ├── services/
│   │   ├── authService.ts                    # Accounts, sessions, hashing, ID validation, review decisions
│   │   ├── catalogService.ts                 # Mock + seller-created records with moderation state
│   │   ├── idVerificationService.ts          # eGov / PSA eVerify check via backend proxy
│   │   ├── fashionService.ts                 # Unified query & search service
│   │   └── storageService.ts                 # LocalStorage persistence manager
│   ├── types/
│   │   ├── auth.ts                           # Account, session, verification interfaces
│   │   └── fashion.ts                        # TypeScript domain interfaces
│   ├── utils/
│   │   └── image.ts                          # File to downscaled JPEG data URL
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

Account models are defined in [`src/types/auth.ts`](file:///c:/Users/User/Pictures/Habi/src/types/auth.ts):

```typescript
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface IdVerification {
  idTypeId: string;
  idTypeLabel: string;
  idNumber: string;          // normalized: uppercase, separators removed
  fullNameOnId: string;
  idImageDataUrl: string;    // downscaled JPEG, admin-only
  permitImageDataUrl?: string;
  submittedAt: string;
}

export interface SellerAccount {
  id: string;
  role: 'seller';
  email: string;
  passwordHash: string;      // SHA-256 of `${salt}:${password}`
  passwordSalt: string;
  ownerName: string;
  phone: string;
  businessName: string;
  handle: string;
  sellerType: 'physical-store' | 'online-creator';
  city: string;
  district: string;
  address?: string;
  description: string;
  verification: IdVerification;
  status: ApplicationStatus;
  review?: { decision: 'approved' | 'rejected'; note: string; reviewedAt: string; reviewedBy: string };
  sellerProfileId: string;   // Seller record published on approval
  createdAt: string;
}

export interface AdminAccount {
  id: string;
  role: 'admin';
  email: string;
  passwordHash: string;
  passwordSalt: string;
  name: string;
  createdAt: string;
}
```

### 5.1 LocalStorage Keys

| Key | Owner | Contents |
| --- | --- | --- |
| `habi_saved_products`, `habi_followed_sellers`, `habi_drop_reminders` | `storageService` | Buyer wishlist state (id arrays) |
| `habi_accounts` | `authService` | All seller and admin accounts, including ID images |
| `habi_session` | `authService` | `{ accountId, role, issuedAt }` for the signed-in account |
| `habi_catalog_sellers` | `catalogService` | Seller profiles published on approval and edited from the dashboard |
| `habi_catalog_products` | `catalogService` | Seller-created listings |
| `habi_hidden_products` | `catalogService` | Bundled demo pieces hidden by an admin |
| `habi_suspended_sellers` | `catalogService` | Seller ids removed from public views |
| `habi_seller_overrides` | `catalogService` | Verification badge and theme overrides for bundled sellers |
| `habi_product_overrides` | `catalogService` | Status, price, and quantity overrides for bundled pieces (reservations, bulk status) |
| `habi_catalog_drops` | `catalogService` | Seller-scheduled drops (`StoredDrop`, pieces by id) |
| `habi_reports`, `habi_my_reservations`, `habi_product_metrics`, `habi_seller_metrics` | `catalogService` | Buyer reports, this browser's live-drop reservations, per-day views and saves |
| `habi_theme`, `habi_lang`, `habi_size_profile`, `habi_fits_me`, `habi_style_profile` | `userPrefsService` | Appearance, language, size and style profiles |
| `habi_recent_views`, `habi_recent_searches`, `habi_boards`, `habi_closet`, `habi_following_seen`, `habi_saved_snapshots`, `habi_display_name`, `habi_install_dismissed` | `userPrefsService` | Recently viewed, search history, outfit boards, closet settings, Following baseline, alert snapshots |
| `habi_fitchecks`, `habi_post_likes`, `habi_post_comments` | `communityService` | Buyer fit checks, likes, comments |
| `habi_reply_templates_<sellerId>` | `TemplatesTab` | Seller quick-reply templates |

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
