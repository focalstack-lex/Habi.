# Habi - Davao Local Fashion Discovery Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a digital fashion community, discovery platform, and local marketplace for the Davao Region, Philippines, featuring an editorial magazine discovery feed, seller storefront profiles, 1-of-1 thrift inventory inquiry, scheduled drop countdowns, interactive Davao fashion map, community outfit checks, and seller dashboard in a high-contrast monochrome design.

**Architecture:** React 19 + TypeScript + Vite + Tailwind CSS + Lucide React vector icons. Data is managed through a modular service layer (`fashionService`, `storageService`) with rich Davao seller datasets and localStorage state persistence.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Leaflet Map engine.

**Spec:** [`docs/specs/2026-09-23-habi-davao-fashion-design.md`](file:///c:/Users/User/Pictures/Habi/docs/specs/2026-09-23-habi-davao-fashion-design.md)

## Global Constraints

- **Strict Zero Emoji Directive**: Under no circumstances use emojis in UI, badges, buttons, logs, git commits, or comments. Use Lucide SVG vector icons.
- **Strict Zero Em-Dash Directive**: Under no circumstances use em-dashes (`—` or `–`). Use standard hyphens, colons, or parentheses.
- **Strict Anti-Eyebrow-Pill Directive**: Never place formulaic pill tags above headlines.
- **Design Palette**: Dominant White (`#FFFFFF`, `#FAFAFA`) canvas with deep Obsidian Black (`#09090B`) text/accents, soft zinc (`#F4F4F5`) containers, and 1px hairline borders (`#E4E4E7`).
- **Omnichannel Responsiveness**: Must look visually stunning and function seamlessly across Mobile (375px), Tablet (768px), Desktop (1024px), and Widescreen (1440px+).

## Review Focus

- **Edge Case 1**: Filtering products by aesthetic when a Davao seller has 0 matching items (Display clean empty state without layout break).
- **Edge Case 2**: Instant Message Inquiry when no phone/social handle is provided (Gracefully fallback to default copy text clip).
- **Edge Case 3**: Interactive Davao Map fallback when WebGL or Leaflet tiles load slowly (Show loading pulse container and location list view).
- **Edge Case 4**: 1-of-1 Thrift item double-reservation prevention (Disable inquiry CTA if item status is updated to 'Reserved' or 'Sold Out').
- **Edge Case 5**: Fit Check image pin overflow on mobile screen sizes (Constrain visual tag tooltips within relative image bounds).

---

### Task 1: TypeScript Data Models, Mock Dataset & Storage Services

**Files:**
- Create: `c:\Users\User\Pictures\Habi\src\types\fashion.ts`
- Create: `c:\Users\User\Pictures\Habi\src\data\mockSellers.ts`
- Create: `c:\Users\User\Pictures\Habi\src\data\mockProducts.ts`
- Create: `c:\Users\User\Pictures\Habi\src\data\mockDrops.ts`
- Create: `c:\Users\User\Pictures\Habi\src\data\mockOutfitPosts.ts`
- Create: `c:\Users\User\Pictures\Habi\src\services\storageService.ts`
- Create: `c:\Users\User\Pictures\Habi\src\services\fashionService.ts`

**Interfaces:**
- Consumes: Spec data definitions.
- Produces: `Seller`, `Product`, `Drop`, `FitCheckPost`, `TaggedItem`, `fashionService` search & filter methods, `storageService` state persistence.

- [ ] **Step 1: Define TypeScript interfaces in `src/types/fashion.ts`**
- [ ] **Step 2: Create authentic Davao seller & product mock datasets**
- [ ] **Step 3: Implement `storageService` for saves, follows, reminders, and inventory updates**
- [ ] **Step 4: Implement `fashionService` for filtering by city, district, category, price, and style aesthetic**
- [ ] **Step 5: Verify build with `npm run build`**
- [ ] **Step 6: Commit**
  ```bash
  git add src/
  git commit -m "feat: add typescript fashion data models datasets and storage services"
  ```

---

### Task 2: Layout & Navigation Components (Header, Location Picker, Drawer)

**Files:**
- Create: `c:\Users\User\Pictures\Habi\src\components\layout\NavigationHeader.tsx`
- Create: `c:\Users\User\Pictures\Habi\src\components\layout\NavigationDrawer.tsx`
- Create: `c:\Users\User\Pictures\Habi\src\components\layout\FooterSection.tsx`

**Interfaces:**
- Consumes: `LocationInfo`, active view tab state, search query state, saved items count.
- Produces: Navigation header, search input bar, Davao Region location selector, mobile navigation drawer, footer.

- [ ] **Step 1: Build `NavigationHeader.tsx` with monochrome branding, search bar, Davao location dropdown, and tab buttons**
- [ ] **Step 2: Build `NavigationDrawer.tsx` for slide-out mobile menu navigation**
- [ ] **Step 3: Build `FooterSection.tsx` with local Davao directory links**
- [ ] **Step 4: Verify layout responsiveness on 375px mobile and 1440px desktop viewports**
- [ ] **Step 5: Commit**
  ```bash
  git add src/components/layout/
  git commit -m "feat: add navigation header mobile drawer and footer layout"
  ```

---

### Task 3: Fashion Discovery Feed & Editorial Hero

**Files:**
- Create: `c:\Users\User\Pictures\Habi\src\components\feed\EditorialHero.tsx`
- Create: `c:\Users\User\Pictures\Habi\src\components\feed\AestheticFilterBar.tsx`
- Create: `c:\Users\User\Pictures\Habi\src\components\feed\ProductCard.tsx`
- Create: `c:\Users\User\Pictures\Habi\src\components\feed\ProductGrid.tsx`

**Interfaces:**
- Consumes: `Product[]`, `Drop`, selected aesthetic filter, location filter.
- Produces: Visual magazine hero banner, aesthetic filter chips, 1-of-1 thrift product cards, product grid.

- [ ] **Step 1: Build `EditorialHero.tsx` featuring Davao Brand of the Week & upcoming major drop banner**
- [ ] **Step 2: Build `AestheticFilterBar.tsx` supporting Streetwear, Y2K, Vintage, Techwear, Gorpcore, Minimalist chips**
- [ ] **Step 3: Build `ProductCard.tsx` with high-res photography, size badge, 1-of-1 thrift indicator, and save button**
- [ ] **Step 4: Build `ProductGrid.tsx` with responsive grid layout and empty filter state**
- [ ] **Step 5: Verify build with `npm run build`**
- [ ] **Step 6: Commit**
  ```bash
  git add src/components/feed/
  git commit -m "feat: add editorial magazine hero aesthetic filter bar and product grid"
  ```

---

### Task 4: Product Detail Modal & Instant Message Inquiry Generator

**Files:**
- Create: `c:\Users\User\Pictures\Habi\src\components\product\ProductDetailModal.tsx`
- Create: `c:\Users\User\Pictures\Habi\src\components\product\InstantInquiryModal.tsx`

**Interfaces:**
- Consumes: `Product`, `Seller`.
- Produces: Detailed item modal, image gallery, size/condition metadata, social message generator for Instagram DM, Facebook Messenger, and WhatsApp.

- [ ] **Step 1: Build `ProductDetailModal.tsx` with image carousel, size/condition specifications, seller info card, and Save button**
- [ ] **Step 2: Build `InstantInquiryModal.tsx` generating pre-formatted item inquiry copy for direct social messaging**
- [ ] **Step 3: Verify modal keyboard trap and background scroll lock**
- [ ] **Step 4: Commit**
  ```bash
  git add src/components/product/
  git commit -m "feat: add product detail modal and instant message inquiry generator"
  ```

---

### Task 5: Seller Storefront Profile & Verification Badges

**Files:**
- Create: `c:\Users\User\Pictures\Habi\src\components\seller\SellerHeader.tsx`
- Create: `c:\Users\User\Pictures\Habi\src\components\seller\SellerStorefront.tsx`

**Interfaces:**
- Consumes: `Seller`, `Product[]`, `Drop[]`.
- Produces: Dedicated seller storefront profile, cover photo, brand logo, verification badge, bio, social links, store location info, product collection tabs, Follow/Unfollow toggle.

- [ ] **Step 1: Build `SellerHeader.tsx` with cover image, avatar, verification status badge, bio, and social links**
- [ ] **Step 2: Build `SellerStorefront.tsx` organizing products, scheduled drops, store location, and follow action**
- [ ] **Step 3: Test follow count update persistence**
- [ ] **Step 4: Commit**
  ```bash
  git add src/components/seller/
  git commit -m "feat: add seller storefront profile and verification status components"
  ```

---

### Task 6: Drops Release Engine & Live Countdown

**Files:**
- Create: `c:\Users\User\Pictures\Habi\src\components\drops\DropCountdownTimer.tsx`
- Create: `c:\Users\User\Pictures\Habi\src\components\drops\DropCard.tsx`
- Create: `c:\Users\User\Pictures\Habi\src\views\DropsView.tsx`

**Interfaces:**
- Consumes: `Drop[]`, `Product[]`.
- Produces: Live ticking countdown timer, scheduled drop cards, preview catalog drawer, "Remind Me" toggle, drops showcase page.

- [ ] **Step 1: Build `DropCountdownTimer.tsx` with real-time second interval updates**
- [ ] **Step 2: Build `DropCard.tsx` with release info, item count, preview catalog drawer, and Remind Me action**
- [ ] **Step 3: Build `DropsView.tsx` organizing upcoming and live Davao drops**
- [ ] **Step 4: Commit**
  ```bash
  git add src/components/drops/ src/views/DropsView.tsx
  git commit -m "feat: add drops release countdown preview drawer and drops showcase view"
  ```

---

### Task 7: Interactive Davao Region Fashion Map

**Files:**
- Modify: `c:\Users\User\Pictures\Habi\index.html` (Include Leaflet CSS)
- Create: `c:\Users\User\Pictures\Habi\src\components\map\DavaoFashionMap.tsx`

**Interfaces:**
- Consumes: `Seller[]`, `LocationInfo`, user selected district/city.
- Produces: Interactive Leaflet map centered on Davao Region (`7.0707, 125.6087`) with physical store pins and online area markers.

- [ ] **Step 1: Include Leaflet stylesheet in `index.html`**
- [ ] **Step 2: Build `DavaoFashionMap.tsx` rendering physical store pins and neighborhood area markers with interactive seller popups**
- [ ] **Step 3: Add distance and city district filter controls**
- [ ] **Step 4: Verify build with `npm run build`**
- [ ] **Step 5: Commit**
  ```bash
  git add index.html src/components/map/
  git commit -m "feat: add interactive davao region fashion map with dual-layer pins"
  ```

---

### Task 8: Davao Fit Check Community Outfit Posts

**Files:**
- Create: `c:\Users\User\Pictures\Habi\src\components\community\FitCheckCard.tsx`
- Create: `c:\Users\User\Pictures\Habi\src\views\FitCheckView.tsx`

**Interfaces:**
- Consumes: `FitCheckPost[]`, `TaggedItem[]`.
- Produces: Outfit check card, interactive photo tag pins, popup garment metadata, community feed.

- [ ] **Step 1: Build `FitCheckCard.tsx` with image overlay pins that reveal tagged seller items on click/hover**
- [ ] **Step 2: Build `FitCheckView.tsx` for browsing community outfit checks**
- [ ] **Step 3: Commit**
  ```bash
  git add src/components/community/ src/views/FitCheckView.tsx
  git commit -m "feat: add davao fit check community feed with interactive item tagging"
  ```

---

### Task 9: Seller Analytics Dashboard, Saved Wishlist & App Shell Integration

**Files:**
- Create: `c:\Users\User\Pictures\Habi\src\components\seller\SellerDashboard.tsx`
- Create: `c:\Users\User\Pictures\Habi\src\views\SavedView.tsx`
- Modify: `c:\Users\User\Pictures\Habi\src\App.tsx`
- Modify: `c:\Users\User\Pictures\Habi\src\index.css`

**Interfaces:**
- Consumes: All views, services, and navigation state.
- Produces: Seller metrics dashboard, saved items wishlist view, unified App shell with tab switching.

- [ ] **Step 1: Build `SellerDashboard.tsx` displaying profile views, saves, follower stats, inventory status updates, and drop builder**
- [ ] **Step 2: Build `SavedView.tsx` displaying user saved products, followed sellers, and drop reminders**
- [ ] **Step 3: Update `App.tsx` wiring up tab router, global search, modal state, and location selector**
- [ ] **Step 4: Verify entire application build: `npm run build`**
- [ ] **Step 5: Commit**
  ```bash
  git add src/
  git commit -m "feat: add seller analytics dashboard saved view and integrate app shell"
  ```
