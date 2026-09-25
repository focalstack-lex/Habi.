# Habi: Davao Local Fashion Discovery Platform

Habi is a digital fashion community, discovery platform, and local marketplace for the Davao Region, Philippines. It connects fashion buyers with independent local fashion creators, streetwear brands, vintage stores, thrift shops, and local boutiques.

## Philosophy

Discover -> Follow -> Explore -> Drop -> Buy

Habi prioritizes visual discovery, local brand visibility, aesthetic curation, and community interaction over traditional transactional e-commerce grid layouts.

## Core Features (Phase 1 MVP)

* Visual Fashion Discovery Feed (Editorial magazine and dynamic aesthetic curation)
* Seller Storefront Profiles (Mini fashion brand websites)
* One-of-One Thrift and Vintage Inventory support
* Davao Region Interactive Map (Location-based fashion discovery)
* Search by Fashion Aesthetic (Streetwear, Vintage, Y2K, Minimalist, Techwear, Gorpcore)
* Seller Follow and Item Save/Wishlist system
* Seller Sign Up with valid government ID verification (PhilSys, driver's license, passport, UMID, and more)
* Seller Dashboard: inventory with edit, duplicate, and bulk status; listing form with measurements, condition notes, and flaw photos; drop scheduler with live preview; quick-reply templates; 7-day views and saves chart; storefront accent and layout picker
* Admin Control Room: review ID applications, approve or reject storefronts, suspend sellers, moderate the catalog, handle buyer reports
* Buyer discovery: For You and Following feeds, "Fits me" size filter, price range and sort, first-visit style quiz, recently viewed, search suggestions with closest matches
* Piece detail: swipe gallery with pinch zoom, measurements table, condition guide with flaw photos, similar pieces, report listing, share as image, outfit boards
* Drops: live drop mode with first-come reservations, 14-day calendar strip, Google Calendar and .ics export
* Map: near-me distances and directions, weekend pop-up market layer
* Community: post fit checks with tagged pieces, likes, comments, weekly style challenge
* Saved: price-drop and back-in-stock alerts, outfit boards with share links, public closet link, size and style profile
* App feel: installable PWA, dark mode, English and Bisaya, shareable hash URLs for pieces, storefronts, and boards

## Accounts and Roles

The app is a browser-only prototype: accounts, sessions, uploaded ID photos, and seller listings live in `localStorage` for the browser that created them. There is no backend yet, so treat ID checks as a manual admin review rather than a KYC integration.

* **Buyers** browse without an account.
* **Sellers** apply through the Sign In tab (or Join as Davao Seller in the footer). The three-step form collects account, storefront, and identity details, requires a photo of a valid ID plus the name and birth date printed on it, and validates the ID number format per document type. PhilSys National IDs can additionally be checked against the government **eGov / PSA eVerify** service through a backend proxy you host (`VITE_ID_VERIFY_ENDPOINT`, see [`docs/ID_VERIFICATION.md`](docs/ID_VERIFICATION.md)); a hard mismatch blocks sign-up, an outage falls back to admin review. New applications are `pending` and stay hidden from the public feed until an admin approves them. Rejected applicants can resubmit a different ID.
* **Admins** register from the Sign In page with the setup key defined by `VITE_ADMIN_SETUP_KEY` in `.env` (defaults to `habi-admin-2026` when unset). The Control Room lists applications with the uploaded ID, approves as Local Seller or Verified Business, revokes access, changes verification badges, suspends sellers, and hides or deletes pieces.

## System Architecture & Codebase Guide

For detailed feature navigation, file mapping, design system tokens, and data models, see:
* [`docs/SYSTEM_ARCHITECTURE.md`](file:///c:/Users/User/Pictures/Habi/docs/SYSTEM_ARCHITECTURE.md)

## Technology Stack

* Core: React 19 + TypeScript + Vite
* Styling: Tailwind CSS + Custom Design System Tokens
* Icons: Lucide React (High-precision SVG vector icons)
* State & Mock Data: Local storage state management with modular mock data services

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment configuration and set your own admin setup key:
   ```bash
   cp .env.example .env
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Project Standards

* Severus Lead Engineering Protocol active
* Zero Emoji Directive enforced across UI/UX and codebase
* Zero Em-Dash Directive enforced across content and copy
* Omnichannel responsive design (Mobile, Tablet, Desktop, Widescreen)
