# Design Specification: Habi Reference Integration (Clean Commerce Structure)

Date: 2026-09-23
Status: Proposed
Target Workspace: `c:\Users\User\Pictures\Habi`
Supersedes nothing. Amends: `docs/specs/2026-09-23-habi-davao-fashion-design.md` (see Section 8).

---

## 1. Overview and Intent

A two-screen mobile commerce reference was supplied (a home feed with hero carousel and product grid, and a product detail screen with size swatches, quantity stepper, and a pinned Add to Bag action). This specification defines how much of that reference Habi adopts, and what it explicitly refuses.

The governing decision: **Habi keeps its inquiry buy model and adopts only the reference's structure.** Habi is a discovery platform whose purchase step is a direct message to a local seller. The reference is a transactional store with a cart, a payment step, and inventory that can be counted. Those two models are not compatible, and the reference's transactional parts are precisely the parts Habi's own README rejects ("Rather than traditional search-to-buy e-commerce grid layouts").

What transfers is structural, not stylistic:

1. The persistent mobile bottom tab bar, which Habi currently lacks entirely.
2. The product detail anatomy, specifically a pinned thumb-zone primary action and a header action row.
3. The conditional variant model (size and quantity appear only when the item can logically have them).

What does not transfer is the reference's visual identity. Habi's committed design system (Syne, Plus Jakarta Sans, Space Mono, monochrome obsidian, sharp geometry) is more decided than the reference's, and adopting the reference's pill chips and rounded cards would reverse the sharp-editorial-geometry pass committed in `1473496`.

## 2. Reference Analysis

### 2.1 Where Habi is already ahead

An honest gap analysis against the reference, after reading the current implementation:

| Reference element | Habi status |
|---|---|
| Product card with image, badges, save control | Already present and sharper. `src/components/feed/ProductCard.tsx` has a 3:4 canvas, corner-pinned rectangular ribbons, a save control, a size ribbon, and a seller row |
| Detail image gallery with thumbnail rail | Already present. `src/components/product/ProductDetailModal.tsx:71` |
| Status badge row | Already present as a ribbon plus flat badges, `ProductDetailModal.tsx:63` and `:92` |
| Price display | Already present, set in Space Mono, `ProductDetailModal.tsx:106` |
| Seller context on the detail screen | Already present as a seller card, `ProductDetailModal.tsx:136`. The reference omits this entirely, which is a gap in the reference, not in Habi |
| Inquiry CTA | Already present, `ProductDetailModal.tsx:168` |
| Single-sans typography | Habi uses a three-face system. The reference is worse here |

### 2.2 Where Habi is behind

| Gap | Evidence | Severity |
|---|---|---|
| No persistent mobile navigation | Eight top-level views routed by `activeTab` in `src/App.tsx`, with a top header and `NavigationDrawer`. No bottom bar exists | High |
| Primary detail action scrolls away | The CTA sits in normal flow inside a `max-h-[90vh] overflow-y-auto` container (`ProductDetailModal.tsx:53`). On a 375x667 viewport the user must scroll to reach it | High |
| No header action row on detail | Only a close button exists, `ProductDetailModal.tsx:44`. No back affordance and no share action | Medium |
| No size selector | `product.size` renders as static metadata only, `ProductDetailModal.tsx:112`. Multi-size brand items cannot express availability per size | Medium |
| No quantity handling | `Product.availableQuantity` exists in `src/types/fashion.ts` but is never rendered | Medium |
| No colourway handling | No model exists | Low |
| Detail is a centered dialog on mobile | The overlay applies `p-4 sm:p-6 lg:p-10` with centering, `ProductDetailModal.tsx:37`. A full-screen sheet is correct for the reference's mobile pattern | Medium |

### 2.3 Reference tells to refuse

The reference carries several patterns that Habi's own directive set prohibits. These are named here so the implementer does not reintroduce them:

- Pill-shaped filter chips and a pill active-tab indicator. Habi's navigation was deliberately de-pilled.
- Rounded 12 to 16px card corners. Habi uses sharp 0px geometry.
- Discount badges implying a struck-through reference price. Habi has no verified original price to compare against.
- Autoplay hero carousel.
- A single neutral sans for every role.

## 3. Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Buy model | Keep DM inquiry, no cart | Preserves the platform model and the 1-of-1 thrift constraint |
| Bottom tab bar contents | Four tabs: Feed, Drops, Map, Saved | Matches the reference's four-slot rhythm and Habi's own DISCOVER, EXPLORE, DROP, SAVE loop |
| Displaced views | Discover, Brands, Community, Seller Dashboard remain in the header, with `NavigationDrawer` as mobile overflow | No existing view becomes unreachable; no new component needed for overflow |
| Where the bottom bar shows | Below `lg` (1024px) only | The desktop header tabs already work at wide widths |
| Bottom bar during detail | Hidden | The detail screen owns the bottom edge with its pinned action, exactly as the reference does |
| Inquiry basket | Deferred to Phase 2 | Real convenience, but YAGNI until this ships |

## 4. Design System Additions

`src/index.css` currently defines three font utilities and no scale, tracking, motion, or safe-area tokens. These additions close that gap. All values extend the existing palette and introduce no new colors.

### 4.1 Type scale

| Token | Size | Line height | Tracking | Face | Use |
|---|---|---|---|---|---|
| display | 40px | 1.05 | -0.02em | Syne | Hero and section titles |
| headline | 28px | 1.15 | -0.015em | Syne | View titles |
| title | 20px | 1.25 | -0.01em | Syne | Item name on detail |
| body | 15px | 1.60 | 0 | Plus Jakarta Sans | Descriptions, paragraphs |
| meta | 11px | 1.40 | +0.08em, uppercase | Space Mono | Labels, seller handles |
| micro | 10px | 1.30 | +0.15em, uppercase | Space Mono | Ribbons, badge rows |

The negative tracking on Syne display and headline sizes and the positive tracking on Space Mono micro sizes are mandatory, not cosmetic. Large display type set at default tracking is the single most common amateur tell.

### 4.2 Spatial and surface tokens

- Section gutter: `16px` mobile, `24px` tablet, `32px` desktop.
- Vertical rhythm within a section: `12px` between related elements, `32px` between sections.
- Structural radius: `0px`. Interactive affordance radius: `0px`. Habi is intentionally sharp; do not introduce curvature.
- Borders: `1px solid #E4E4E7` for container edges, `#09090B` for hover and active.
- Elevation: no resting shadows. `hover:border-zinc-950` is the interaction cue. The reference's soft card shadows are not adopted.
- Safe area: the fixed bar uses `padding-bottom: env(safe-area-inset-bottom)`.

### 4.3 Motion

- State transitions: `150ms ease-out`.
- Image hover scale: `500ms`, unchanged from `ProductCard.tsx`.
- The bottom bar does not slide or fade in. It renders immediately. Entrance animation on fixed navigation is motion slop.
- No autoplay, no parallax, no scroll-jacking.

## 5. Component Specifications

### 5.1 `src/components/layout/BottomTabBar.tsx` (new)

Props:

```typescript
interface BottomTabBarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  savedCount?: number;
  isHidden?: boolean;
}
```

Structure: a single `nav` element fixed to the bottom with `z-40`, rendering four equal-width buttons. Tab values must match the `activeTab` values already used in `src/App.tsx`: `feed`, `drops`, `map`, `saved`.

Icons: `LayoutGrid` (feed), `Timer` (drops), `MapPin` (map), `Bookmark` (saved), all from `lucide-react`.

Active state: label and icon at `text-zinc-950` with a `2px` top indicator bar, and a weight change from normal to bold. Inactive state at `text-zinc-400`. **No pill background.** This is the deliberate departure from the reference and the reason the bar must be reviewed against `NavigationHeader.tsx` treatment rather than the reference image.

Touch targets: each button is at least `44px` tall with the label included, matching the omnichannel directive floor.

Hidden state: when `isHidden` is true, render nothing. The detail modal sets this. Do not use `opacity-0` with a pointer-events trap; conditional rendering avoids a keyboard-focusable invisible control.

`aria-label="Primary"` on the nav. Each button carries `aria-current="page"` when active.

### 5.2 `src/components/product/ProductDetailModal.tsx` (restructured)

The existing component keeps every visual token it has. Four structural changes:

**5.2.1 Header action row.** Replace the single floating close button with a row containing a back control (closes the modal), the save toggle as a compact icon button, and a share action. Order on mobile: back at the left, share and save at the right. The share action uses the Web Share API with a copy-link fallback:

```typescript
const handleShare = async () => {
  const shareData = { title: product.name, text: `Found on Habi: ${product.name}`, url: window.location.href };
  if (navigator.share) {
    try { await navigator.share(shareData); } catch { /* user cancelled, no action */ }
    return;
  }
  await navigator.clipboard.writeText(window.location.href);
  setShareNote('Link copied');
};
```

Cancellation is not an error and must not surface a message. Only the clipboard fallback reports, via a transient `shareNote` state that clears after 2000ms.

**5.2.2 Pinned primary action.** Extract the bottom CTA block out of the scrolling column into a sibling that is pinned to the bottom of the modal surface. The scrolling region (`max-h-[90vh] overflow-y-auto`) keeps its overflow; the action block does not live inside it. On a 375x667 viewport the primary action must be visible without scrolling.

The primary action keeps its current label and behavior: `INQUIRE / RESERVE VIA MESSAGE`, opening `InstantInquiryModal`. Its minimum height is `48px`, and it gains the safe-area bottom padding. The save action moves out of this block into the header action row, so the pinned block contains exactly one full-width primary action.

**5.2.3 Conditional variant block.** Insert a variant block above the description, governed by a single rule:

```typescript
const isSingle = product.isOneOfOne;
const sizes = product.sizes ?? [product.size];
const canSelectSize = !isSingle && sizes.length > 1;
const canSetQuantity = !isSingle && product.availableQuantity > 1;
```

- When `isSingle` is true, the block renders the statement `1 OF 1` with the size as static metadata. No selector and no stepper. A 1-of-1 garment has exactly one unit, so offering a quantity control would be a lie.
- When `canSelectSize` is true, render the size list as sharp rectangular chips in the Space Mono micro style. An unavailable size renders at `text-zinc-300` with a diagonal hairline and is not clickable.
- When `canSetQuantity` is true, render a quantity stepper clamped to `1` at the minimum and `product.availableQuantity` at the maximum, with the current value displayed between the controls.
- When `product.colourways` has more than one entry, render the colourway list as `32px` square swatches with a `1px` border, the selected swatch carrying a `2px` `#09090B` outline.

Selected size and quantity are component state (`selectedSize`, `selectedQuantity`), initialized to the first available size and `1`. They do not need to persist.

**5.2.4 Availability gating.** When `product.status !== 'Available'`, the primary action is disabled, renders at `bg-zinc-300 text-zinc-600`, and its label becomes the status in uppercase (`RESERVED` or `SOLD OUT`). This satisfies the double-reservation edge case already documented in the existing implementation plan.

**5.2.5 Mobile presentation.** Below `md`, the modal becomes a full-screen sheet: `inset-0`, no outer padding, no centering, and the surface fills the viewport. Above `md`, the existing centered `max-w-4xl` two-column layout is retained unchanged. This is a breakpoint change only; the desktop layout is not redesigned.

### 5.3 `src/components/feed/ProductCard.tsx` (near-unchanged)

`ProductCard.tsx` already exceeds the reference's card quality and needs no structural change. One addition: the size ribbon currently renders unconditionally (`ProductCard.tsx:69-71`) and should render only when `!product.isOneOfOne`, since the 1-OF-1 ribbon already conveys uniqueness and a duplicate size ribbon is redundant noise on those items. Everything else stays byte-identical.

### 5.4 `src/components/feed/ProductGrid.tsx` (curvature fix only)

The reference's section header pattern, a left-aligned uppercase section title with a right-aligned secondary text control, **already exists** in the Feed view. `src/App.tsx:138-149` renders `Showing N Local Davao Pieces` on the left with a `Clear Active Filters` control on the right, in the `meta` style and with no pill. No new prop or component is needed, and adding one would be dead code.

Consequently this file receives only the curvature correction described in Section 2.2. Its grid track is already correct: the reference's two-column mobile grid with a locked 3:4 ratio matches `ProductGrid.tsx` plus the card's existing `aspect-[3/4]`.

Separately noted, and deliberately out of scope: the Discover view at `src/App.tsx:182-188` renders a `ProductGrid` with no header row above it, so it is inconsistent with Feed. That is a pre-existing inconsistency unrelated to this reference integration and is left alone.

### 5.5 `src/components/feed/AestheticFilterBar.tsx` (unchanged)

Explicitly out of scope. The reference's pill chips must not be introduced here. This file is listed only to record that it was reviewed and deliberately left alone.

## 6. Data Model Change

Additive only, in `src/types/fashion.ts`. The existing fields `size: string`, `availableQuantity: number`, and `isOneOfOne: boolean` stay exactly as they are, so no existing mock data breaks.

```typescript
export interface Colourway {
  name: string;
  hex?: string;
  images: string[];
}

// Added to the existing Product interface:
sizes?: string[];           // multi-stock brand items only; omit on 1-of-1
colourways?: Colourway[];   // omit when the item has a single colourway
```

`Product.size` remains the canonical displayed size for 1-of-1 items and for items without a `sizes` array.

Mock data updates in `src/data/mockProducts.ts`: at least two multi-stock brand items gain a `sizes` array and an `availableQuantity` above 1, and at least one gains a two-entry `colourways` array. Thrift items are left untouched so the 1-of-1 path stays exercised.

## 7. Explicit Rejections

Recorded so that a reviewer can reject a diff that reintroduces them:

1. Patch cart, checkout, or any payment surface. There is no backend for it and the platform model does not include it.
2. Quantity steppers or size selectors on 1-of-1 thrift items.
3. `rounded-full`, `rounded-2xl`, or `rounded-3xl` on any new or modified surface.
4. Pill filter chips or a pill active-tab indicator.
5. Discount or strike-through pricing badges.
6. Autoplay media and entrance animations on fixed navigation.
7. Any new dependency. This integration is achievable with React, Tailwind, and the already-installed `lucide-react`.

## 8. Documentation Remediation

`docs/specs/2026-09-23-habi-davao-fashion-design.md` section 3.1 is stale and contradicts the shipped code in three specific ways:

| Stale claim in section 3.1 | Shipped reality |
|---|---|
| "clean sans-serif body copy (Inter / System Sans)" | `index.html:10` loads Syne, Plus Jakarta Sans, and Space Mono, which `src/index.css` declares as utilities. Inter is absent entirely |
| "Clean 12px to 16px rounded corners" | The committed geometry pass uses sharp `rounded-none` throughout |
| "Dark/Light theme variables" (JOURNAL.md:8) | No dark mode tokens exist. `src/index.css` defines a single white-canvas set |

This matters beyond tidiness. The anti-slop review process determines whether a choice is craft or slop by consulting the project's own brief, and a brief that misdescribes the project makes every subsequent audit unreliable. Section 3.1 must be corrected to describe the shipped system. The correction is a documentation edit only and changes no code.

## 9. Accessibility and Responsive Requirements

- Touch targets at or above `44px` for every interactive element in the bar and on the detail screen.
- `aria-label="Primary"` on the bottom nav, `aria-current="page"` on the active tab.
- The pinned primary action must be reachable by keyboard and must not be obscured by the bottom bar, which is hidden while the modal is open.
- No horizontal overflow at `320px`, the narrowest supported width.
- Verified at `375px`, `768px`, `1024px`, and `1440px`, plus `320px` for the overflow check.
- All new copy uses plain punctuation only: zero em-dashes, zero en-dashes, zero emoji.

## 10. Acceptance Criteria

1. `npm run build` (which runs `tsc -b` then `vite build`) completes with zero TypeScript errors.
2. `npm run lint` (oxlint) reports zero errors.
3. The bottom tab bar renders below `1024px` and is absent at and above it.
4. The bar is absent while `ProductDetailModal` is open, and no invisible focusable control remains.
5. On a `375x667` viewport the inquiry action is visible without scrolling with the detail modal open.
6. A 1-of-1 item renders no size selector and no quantity stepper, and displays `1 OF 1`.
7. A multi-stock item renders a size selector and a quantity stepper clamped to `availableQuantity`.
8. An item with `status !== 'Available'` renders a disabled action carrying the status label.
9. No `rounded-full`, `rounded-2xl`, or `rounded-3xl` appears in any file touched by this work.
10. A grep for `—` and `–` across touched files returns nothing.
11. Section 3.1 of the original design spec matches the shipped system.
12. `JOURNAL.md` receives an entry for the work, per the Severus journaling directive.

## 11. Out of Scope

Phase 2 candidate, not part of this work: upgrading Saved into a batched inquiry that groups saved items by seller and sends one combined message per seller. That delivers the convenience of the reference's cart without a cart or payment step, and it is the natural successor to this integration. It should be specified separately once this ships.
