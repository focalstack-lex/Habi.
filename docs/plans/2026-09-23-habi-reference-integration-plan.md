# Habi Reference Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the supplied clean commerce reference into Habi by adding a four-tab mobile bottom navigation bar and restructuring the product detail screen around a pinned thumb-zone inquiry action and a conditional variant model, while keeping Habi's inquiry buy model and its committed monochrome sharp-geometry design system intact.

**Architecture:** React 19 + TypeScript + Vite + Tailwind CSS v4 + Lucide React. No new dependency is introduced. A new `BottomTabBar` component is mounted once in `App.tsx` and reuses the existing `NAV_TABS` label source. `ProductDetailModal.tsx` is restructured from a centered dialog with in-flow CTAs into a flex column with a scrolling body and a pinned action footer. The data model gains two optional fields, additively, so no existing mock data breaks.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React.

**Spec:** [`docs/specs/2026-09-23-habi-reference-integration-design.md`](file:///c:/Users/User/Pictures/Habi/docs/specs/2026-09-23-habi-reference-integration-design.md)

## Global Constraints

- **Strict Zero Emoji Directive**: Never use emojis in UI, badges, buttons, logs, git commits, or comments. Use Lucide SVG vector icons only.
- **Strict Zero Em-Dash Directive**: Never introduce `—` (U+2014) or `–` (U+2013) in UI copy, code, comments, documentation, or commit messages. Use hyphens, colons, commas, or parentheses.
- **Strict Anti-Eyebrow-Pill Directive**: Never place formulaic rounded pill tags above headlines.
- **No new dependencies**: This integration is achievable with React, Tailwind, and the already-installed `lucide-react`. Do not add a package.
- **Sharp geometry**: Every new or modified surface uses `rounded-none`. Do not introduce `rounded-full`, `rounded-xl`, `rounded-lg`, `rounded-2xl`, or `rounded-3xl`.
- **Design Palette**: White canvas (`#FFFFFF`, `#FAFAFA`), Obsidian ink (`#09090B`), soft zinc surface (`#F4F4F5`), hairline border (`#E4E4E7`), muted (`#71717A`), faint (`#A1A1AA`).
- **Tab identifiers are fixed**: `feed`, `drops`, `map`, `saved`. These must match the `activeTab` string values already used in `src/App.tsx:121-294`.
- **Omnichannel Responsiveness**: Verified at 320px, 375px, 768px, 1024px, and 1440px, with no horizontal overflow and all touch targets at or above 44px.

## Anchor Basis

Every `file:line` citation in this plan was verified against commit `fe01dc3`. This repository has more than one active session, so line numbers can drift between the writing of this plan and its execution. The quoted code block in each step is the authoritative locator and the line number is only a hint. Before applying any edit, if your working state has moved past `fe01dc3`, re-verify the anchor with `grep -n` on the quoted text.

## Testing Approach (read before starting)

This project has **no test runner**. `package.json` defines only `dev`, `build`, `lint`, and `preview`, and there is no Vitest, Jest, or Playwright dependency. Do not add one: introducing a test framework is out of scope and would violate the no-new-dependency constraint.

The verification cycle for every task in this plan is therefore:

1. `npm run build` (runs `tsc -b` then `vite build`). A TypeScript error fails the task.
2. `npm run lint` (oxlint). A lint error fails the task, including an unused import.
3. An explicit check appropriate to the task, stated in the task's final step.

Where a task's behavior is visual (the bottom bar, the pinned action), the check is a manual viewport verification against the running dev server at `http://127.0.0.1:3000` (`npm run dev`). Where the behavior is logical (the variant gate, the availability gate), the check is a targeted assertion written into a temporary scratch file that is deleted before commit, because the project has no test harness to host it. Never commit a scratch file.

## Review Focus

- **Edge Case 1**: A 1-of-1 thrift item must render no size selector and no quantity stepper, and must display the `1 OF 1` statement instead. Thrift pieces are `prod-2`, `prod-3`, `prod-5`, `prod-6` in `src/data/mockProducts.ts`.
- **Edge Case 2**: A multi-stock item whose `availableQuantity` is 1 must not render a quantity stepper even though `isOneOfOne` is false. The gate is `availableQuantity > 1`, not `!isOneOfOne`.
- **Edge Case 3**: Switching between two products must reset selected size, quantity, and image index. Without a reset, opening a 1-of-1 piece after a four-image piece leaves stale selection state.
- **Edge Case 4**: An item whose `status` is `Reserved` or `Sold Out` must disable the inquiry action and show the status as the label.
- **Edge Case 5**: The `navigator.share` promise rejects when the user cancels the share sheet. That rejection must be swallowed silently and must not surface an error, while a clipboard fallback failure must report.
- **Edge Case 6**: The fixed bottom bar must not cover the footer at the bottom of the page, and must not remain focusable while the detail modal is open.

---

### Task 0: Confirm the prerequisite geometry pass is committed

**Why:** This plan assumes a working tree with no unrelated in-flight changes, so that each task's diff contains only that task's work. That prerequisite is **already satisfied**: the sharp geometry pass was committed as `fe01dc3` (14 files, 288 insertions, 286 deletions) and the working tree is clean as of the time of writing. This task verifies the precondition and changes nothing.

**Files:**
- Modify: none. If the precondition already holds, this task produces no file change and no commit.

**Interfaces:**
- Consumes: nothing.
- Produces: confirmation that the base is clean, which every later task assumes.

- [ ] **Step 1: Confirm the geometry pass is in history**

Run:
```bash
git log --oneline -3
git show --stat fe01dc3 | tail -3
```
Expected: `fe01dc3` is present and reports 14 files changed. If it is absent, the geometry pass has not landed and must be committed first, because Task 9's curvature audit assumes that pass is already in place.

- [ ] **Step 2: Confirm the working tree is clean**

```bash
git status --short
```
Expected: no output. If a file other than those this plan creates or modifies is listed, resolve it before starting. Do not begin Task 1 with unrelated modifications in flight.

---

### Task 1: Design tokens for type scale, tracking, and safe area

**Files:**
- Modify: `src/index.css`

**Interfaces:**
- Consumes: nothing.
- Produces: CSS classes `text-display`, `text-headline`, `text-title`, `text-body`, `text-meta`, `text-micro`, `tabbar-safe`, `sheet-safe`. Later tasks apply these by class name.

- [ ] **Step 1: Append the token block to `src/index.css`**

Add after the existing font utilities, before the scrollbar rules:

```css
/* Habi scale, tracking, and safe-area tokens */
:root {
  --habi-ink: #09090b;
  --habi-canvas: #ffffff;
  --habi-canvas-soft: #fafafa;
  --habi-surface: #f4f4f5;
  --habi-hairline: #e4e4e7;
  --habi-muted: #71717a;
  --habi-faint: #a1a1aa;
}

.text-display {
  font-family: 'Syne', sans-serif;
  font-size: 40px;
  line-height: 1.05;
  letter-spacing: -0.02em;
  font-weight: 800;
  text-transform: uppercase;
}

.text-headline {
  font-family: 'Syne', sans-serif;
  font-size: 28px;
  line-height: 1.15;
  letter-spacing: -0.015em;
  font-weight: 700;
  text-transform: uppercase;
}

.text-title {
  font-family: 'Syne', sans-serif;
  font-size: 20px;
  line-height: 1.25;
  letter-spacing: -0.01em;
  font-weight: 700;
  text-transform: uppercase;
}

.text-body {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 15px;
  line-height: 1.6;
  letter-spacing: 0;
}

.text-meta {
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  line-height: 1.4;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.text-micro {
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  line-height: 1.3;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

/* Safe-area padding for fixed surfaces. Uses max() so the value never collapses to zero
   on devices without an inset, and does not collide with Tailwind padding utilities. */
.tabbar-safe {
  padding-bottom: max(0.5rem, env(safe-area-inset-bottom, 0px));
}

.sheet-safe {
  padding-bottom: max(1rem, env(safe-area-inset-bottom, 0px));
}
```

The negative tracking on `text-display`, `text-headline`, and `text-title` and the positive tracking on `text-meta` and `text-micro` are mandatory. Do not remove them.

- [ ] **Step 2: Verify the build and lint pass**

Run:
```bash
npm run build
npm run lint
```
Expected: build completes with zero TypeScript errors, lint reports zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "style: add typography scale tracking and safe-area tokens"
```

---

### Task 2: Conditional variant data model

**Files:**
- Modify: `src/types/fashion.ts` (add the `Colourway` interface and two optional `Product` fields)
- Modify: `src/data/mockProducts.ts` (populate the new fields on multi-stock items only)

**Interfaces:**
- Consumes: nothing.
- Produces: `Colourway` type and the optional `Product.sizes?: string[]` and `Product.colourways?: Colourway[]` fields. Task 7 reads both.

- [ ] **Step 1: Add the `Colourway` interface and the two optional fields**

In `src/types/fashion.ts`, add above `export interface Product`:

```typescript
export interface Colourway {
  name: string;
  hex?: string;
  images: string[];
}
```

Inside the existing `Product` interface, add these two optional fields. Do not alter any existing field, and in particular leave `size: string`, `availableQuantity: number`, and `isOneOfOne: boolean` exactly as they are:

```typescript
  sizes?: string[];           // multi-stock brand items only; omit on 1-of-1 pieces
  colourways?: Colourway[];   // omit when the piece exists in a single colourway
```

- [ ] **Step 2: Populate `sizes` on the multi-stock items**

In `src/data/mockProducts.ts`, add a `sizes` array to `prod-1` (after the existing `size: 'Large',` line). The four multi-stock items are `prod-1`, `prod-4`, `prod-7`, and `prod-8` (identified by `isOneOfOne: false`). Add a `sizes` array to each, keeping the existing singular `size` as the canonical default:

```typescript
    sizes: ['Small', 'Medium', 'Large', 'Extra Large'],
```

For `prod-1` also add a two-entry `colourways` array to exercise the swatch path:

```typescript
    colourways: [
      {
        name: 'Obsidian',
        hex: '#09090b',
        images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80'],
      },
      {
        name: 'Bone',
        hex: '#f4f4f5',
        images: ['https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1000&q=80'],
      },
    ],
```

Do not add `sizes` or `colourways` to `prod-2`, `prod-3`, `prod-5`, or `prod-6`. Those are the 1-of-1 thrift pieces and must remain without variant data so the single-piece path stays exercised.

- [ ] **Step 3: Verify the build and lint pass**

Run:
```bash
npm run build
npm run lint
```
Expected: zero TypeScript errors, zero lint errors. Because both new fields are optional, every existing mock object remains valid.

- [ ] **Step 4: Commit**

```bash
git add src/types/fashion.ts src/data/mockProducts.ts
git commit -m "feat: add optional size and colourway variant fields to product model"
```

---

### Task 3: BottomTabBar component

**Files:**
- Create: `src/components/layout/BottomTabBar.tsx`

**Interfaces:**
- Consumes: `NAV_TABS` exported from `src/components/layout/NavigationHeader.tsx:26-35`, whose entries are `{ id: string; label: string }`.
- Produces: `BottomTabBar` with props `{ activeTab: string; setActiveTab: (tab: string) => void; savedCount?: number; isHidden?: boolean }`. Task 4 mounts it.

- [ ] **Step 1: Create the component**

```tsx
import React from 'react';
import { LayoutGrid, Timer, MapPin, Bookmark } from 'lucide-react';
import { NAV_TABS } from './NavigationHeader';

const BOTTOM_TAB_IDS: string[] = ['feed', 'drops', 'map', 'saved'];

const TAB_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  feed: LayoutGrid,
  drops: Timer,
  map: MapPin,
  saved: Bookmark,
};

interface BottomTabBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  savedCount?: number;
  isHidden?: boolean;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  setActiveTab,
  savedCount = 0,
  isHidden = false,
}) => {
  if (isHidden) return null;

  const tabs = NAV_TABS.filter((tab) => BOTTOM_TAB_IDS.includes(tab.id));

  return (
    <nav
      aria-label="Primary"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-200 tabbar-safe"
    >
      <div className="grid grid-cols-4">
        {tabs.map((tab) => {
          const Icon = TAB_ICONS[tab.id];
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center gap-1 min-h-[56px] py-2 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors duration-150 ${
                isActive
                  ? 'text-zinc-950 font-bold'
                  : 'text-zinc-400 hover:text-zinc-950 font-medium'
              }`}
            >
              {isActive && (
                <span
                  className="absolute top-0 left-0 right-0 h-0.5 bg-zinc-950"
                  aria-hidden="true"
                />
              )}
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
              {tab.id === 'saved' && savedCount > 0 && (
                <span className="absolute top-1.5 right-1/4 min-w-[16px] bg-zinc-950 text-white font-mono text-[9px] font-bold text-center">
                  {savedCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
```

Three deliberate properties of this component:

1. Labels come from `NAV_TABS` rather than being duplicated, so a label rename cannot desynchronise the top and bottom navigation. The import from a sibling layout file is intentional.
2. `isHidden` returns `null` rather than hiding with opacity. An `opacity-0` bar would still be keyboard focusable, which is the trap described in Edge Case 6.
3. The active state is a weight change plus a `0.5` (2px) top indicator, mirroring the desktop header treatment at `NavigationHeader.tsx:97-101` which uses `font-bold border-b-2 border-zinc-950`. It is **not** a pill background. This is the deliberate departure from the reference.

- [ ] **Step 2: Verify the build and lint pass**

Run:
```bash
npm run build
npm run lint
```
Expected: zero errors. If oxlint reports an unused variable, confirm every import in the file is used.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/BottomTabBar.tsx
git commit -m "feat: add four-tab mobile bottom navigation bar"
```

---

### Task 4: Mount the bar in App and reserve its space

**Files:**
- Modify: `src/App.tsx` (import, mount, and reserve layout space)

**Interfaces:**
- Consumes: `BottomTabBar` from Task 3.
- Produces: nothing consumed by later tasks. This task makes the bar visible.

- [ ] **Step 1: Add the import**

In `src/App.tsx`, add to the existing layout imports:

```typescript
import { BottomTabBar } from './components/layout/BottomTabBar';
```

- [ ] **Step 2: Mount the bar and reserve space above it**

The root `div` of the component currently ends with `<FooterSection ... />` followed by `</div>`. The `<FooterSection>` element begins at `src/App.tsx:328` and the root `div` closes a few lines later. Insert the spacer and the bar immediately after `</FooterSection>` and before the closing `</div>`:

```tsx
      {/* Reserves space so the fixed bar never covers the footer */}
      <div className="h-16 lg:hidden" aria-hidden="true" />

      {/* Persistent Mobile Bottom Navigation */}
      <BottomTabBar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'seller-profile') setSelectedSellerId(null);
        }}
        savedCount={savedCount}
        isHidden={Boolean(selectedProduct)}
      />
```

`savedCount` already exists at `src/App.tsx:42` as `storageService.getSavedProducts().length`. Do not create a second source for it. `selectedProduct` already gates `ProductDetailModal` at `src/App.tsx:319`, so reusing it for `isHidden` guarantees the bar is hidden exactly when the detail screen is open.

- [ ] **Step 3: Verify visually at two widths**

Run `npm run dev`, then:

At 375px width: the bar is pinned to the bottom, shows Feed, Drops, Map, Saved with icons and labels, and the Feed tab carries a 2px top indicator with bold text. Tapping Drops switches the view and moves the indicator. Scrolling to the page bottom shows the footer fully above the bar, not behind it.

At 1280px width: no bottom bar is present, and the header tabs behave exactly as before.

- [ ] **Step 4: Verify the modal interaction**

At 375px, open any product. Expected: the bottom bar disappears. Close the product. Expected: the bar returns.

- [ ] **Step 5: Verify the build and lint pass, then commit**

```bash
npm run build
npm run lint
git add src/App.tsx
git commit -m "feat: mount mobile bottom navigation and reserve footer space"
```

---

### Task 5: Detail screen header action row

**Files:**
- Modify: `src/components/product/ProductDetailModal.tsx` (imports, new state, share handler, header row replacing the floating close button)

**Interfaces:**
- Consumes: the existing `product: Product | null` prop.
- Produces: local `handleShare` and the `shareNote` state. Task 6 leaves both in place.

- [ ] **Step 1: Update the imports**

Replace the existing lucide import line:

```typescript
import { X, Bookmark, MapPin, Tag, MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react';
```

with:

```typescript
import { ArrowLeft, Share2, Bookmark, MapPin, Tag, MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react';
```

`X` must be removed. If it stays while unused, oxlint fails the task.

- [ ] **Step 2: Add the reset effect and the share state**

Change the React import to include `useEffect`:

```typescript
import React, { useState, useEffect } from 'react';
```

Add these state declarations alongside the existing ones, and keep them **above** the `if (!isOpen || !product) return null;` early return, which is at line 28 of the current file, because hooks must run unconditionally:

```typescript
  const [shareNote, setShareNote] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>(product?.sizes?.[0] ?? product?.size ?? '');
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);

  useEffect(() => {
    setSelectedImageIndex(0);
    setSelectedSize(product?.sizes?.[0] ?? product?.size ?? '');
    setSelectedQuantity(1);
    setShareNote('');
  }, [product?.id]);
```

This effect resolves Edge Case 3. Without it, opening a single-image piece after a four-image piece leaves `selectedImageIndex` pointing past the end of the new array, and leaves a previously chosen size selected on a different garment.

- [ ] **Step 3: Add the share handler**

Add below `handleToggleSave`:

```typescript
  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Found on Habi: ${product.name}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // The user dismissed the native share sheet. Not an error, so nothing is reported.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareNote('Link copied');
      window.setTimeout(() => setShareNote(''), 2000);
    } catch {
      setShareNote('Copy failed');
      window.setTimeout(() => setShareNote(''), 2000);
    }
  };
```

The empty `catch` here is deliberate and correct: it swallows only the `AbortError` produced by a user dismissing the share sheet, which is a normal outcome and not a failure. This is the one place in this codebase where a silent catch is acceptable, and the comment records why. The clipboard path does report, satisfying Edge Case 5.

- [ ] **Step 4: Replace the floating close button with the header action row**

Replace this block, which sits at line 44 of the current file, directly beneath the surface opening tag:

```tsx
          {/* Close Floating Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2.5 bg-zinc-950 text-white rounded-none hover:bg-zinc-800 border border-zinc-800 transition-all"
            aria-label="Close detail modal"
          >
            <X className="w-5 h-5" />
          </button>
```

with:

```tsx
          {/* Header Action Row: Back, Share, Save */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-start justify-between p-3 sm:p-4 pointer-events-none">
            <button
              type="button"
              onClick={onClose}
              className="pointer-events-auto p-2.5 bg-white/95 text-zinc-950 border border-zinc-300 hover:border-zinc-950 transition-colors duration-150"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="pointer-events-auto p-2.5 bg-white/95 text-zinc-950 border border-zinc-300 hover:border-zinc-950 transition-colors duration-150"
                aria-label="Share this piece"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleToggleSave}
                className={`pointer-events-auto p-2.5 border transition-colors duration-150 ${
                  isSaved
                    ? 'bg-zinc-950 text-white border-zinc-950'
                    : 'bg-white/95 text-zinc-950 border-zinc-300 hover:border-zinc-950'
                }`}
                aria-label={isSaved ? 'Remove from saved' : 'Save this piece'}
              >
                <Bookmark className="w-5 h-5 fill-current" />
              </button>
            </div>
          </div>
```

The `pointer-events-none` on the row with `pointer-events-auto` on each button lets the buttons sit over the image while the empty space between them remains click-through.

- [ ] **Step 5: Surface the share note**

Add immediately after the header action row, inside the same surface:

```tsx
          {shareNote && (
            <div
              role="status"
              className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-zinc-950 text-white font-mono text-[10px] uppercase tracking-[0.15em] px-3 py-2"
            >
              {shareNote}
            </div>
          )}
```

- [ ] **Step 6: Remove the now-duplicated save button**

The right column currently ends with a bottom CTA block, beginning at line 168 of the current file, containing both the inquiry button and a full-width save button. Delete only the save button from that block, because save now lives in the header row. Keep the inquiry button in place for now; Task 6 relocates it. After this step the block contains the inquiry button alone.

- [ ] **Step 7: Verify behavior**

Run `npm run build` and `npm run lint`. Expected: zero errors.

Run `npm run dev` and at 375px open a product. Expected: a back control at the top left, share and save at the top right, all three tappable at 44px or larger. The save button reflects and toggles the saved state. Tapping share either opens the OS share sheet or shows the `Link copied` note, and dismissing the share sheet produces no error text. Open a second product and confirm the saved indicator resets to that product's own state.

- [ ] **Step 8: Commit**

```bash
git add src/components/product/ProductDetailModal.tsx
git commit -m "feat: add detail header action row with back share and save controls"
```

---

### Task 6: Pinned thumb-zone inquiry action

**Files:**
- Modify: `src/components/product/ProductDetailModal.tsx` (surface becomes a flex column, action block moves out of the scroll region)

**Interfaces:**
- Consumes: the inquiry button and `InstantInquiryModal` wiring from Task 5.
- Produces: a surface structure with a scrollable body and a non-scrolling action footer. Task 8 depends on this structure to make the sheet full-screen on mobile.

- [ ] **Step 1: Convert the surface to a flex column**

Replace the surface opening tag, which is at line 43 of the current file:

```tsx
        <div className="relative w-full max-w-4xl bg-white rounded-none border border-zinc-900 shadow-2xl overflow-hidden z-10 my-auto">
```

with:

```tsx
        <div className="relative w-full max-w-4xl bg-white rounded-none border border-zinc-900 shadow-2xl overflow-hidden z-10 my-auto flex flex-col max-h-[90vh]">
```

- [ ] **Step 2: Make the body the only scrolling region**

Replace the grid opening tag, which is at line 53 of the current file:

```tsx
          <div className="grid grid-cols-1 md:grid-cols-12 max-h-[90vh] overflow-y-auto">
```

with:

```tsx
          <div className="grid grid-cols-1 md:grid-cols-12 overflow-y-auto flex-1">
```

The `max-h-[90vh]` constraint moves to the surface, so the body flexes to fill the remaining height and only the body scrolls.

- [ ] **Step 3: Move the inquiry action out of the body and pin it**

Inside the right column, delete the entire bottom CTA block, which begins at line 168 of the current file. It currently looks like this, and all of it is removed from that location:

```tsx
              {/* Bottom CTAs */}
              <div className="space-y-3 pt-4 border-t border-zinc-200 font-mono">
                <button
                  onClick={() => setIsInquiryOpen(true)}
                  className="w-full py-4 px-6 bg-zinc-950 hover:bg-zinc-800 text-white rounded-none text-xs font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>INQUIRE / RESERVE VIA MESSAGE</span>
                </button>
              </div>
```

Then insert the pinned block as a sibling of the scrolling grid, immediately after the grid's closing `</div>` and before the surface's closing `</div>`:

```tsx
          {/* Pinned Primary Action */}
          <div className="border-t border-zinc-200 bg-white p-4 sheet-safe font-mono shrink-0">
            <button
              type="button"
              onClick={() => setIsInquiryOpen(true)}
              disabled={product.status !== 'Available'}
              className={`w-full min-h-[48px] px-6 text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-150 flex items-center justify-center gap-2 ${
                product.status === 'Available'
                  ? 'bg-zinc-950 hover:bg-zinc-800 text-white'
                  : 'bg-zinc-300 text-zinc-600 cursor-not-allowed'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>
                {product.status === 'Available'
                  ? 'INQUIRE / RESERVE VIA MESSAGE'
                  : product.status.toUpperCase()}
              </span>
            </button>
          </div>
```

Two things to preserve exactly: `min-h-[48px]` on the button, which is the touch-target floor, and `shrink-0` on the wrapper, without which the flex column can squash the pinned action on short viewports. The disabled branch satisfies Edge Case 4 and implements the double-reservation guard already required by the original implementation plan's Edge Case 4.

- [ ] **Step 4: Verify the action is reachable without scrolling**

Run `npm run dev`, set the viewport to 375 by 667, and open a product with several images. Expected: the inquiry button is visible at the bottom of the screen on open, without scrolling. Scroll the body and confirm the button stays fixed while the content moves beneath it. Confirm the button is at least 48px tall.

- [ ] **Step 5: Verify the disabled state**

In `src/data/mockProducts.ts`, temporarily change `prod-1`'s `status: 'Available'` to `status: 'Reserved'`, then reload and open that item. Expected: the action is greyed, reads `RESERVED`, and does not open the inquiry modal when clicked. Revert the change before committing and confirm with `git diff src/data/mockProducts.ts` that it is clean.

- [ ] **Step 6: Verify the build and lint pass, then commit**

```bash
npm run build
npm run lint
git add src/components/product/ProductDetailModal.tsx
git commit -m "feat: pin detail inquiry action to the thumb zone with availability gate"
```

---

### Task 7: Conditional variant block

**Files:**
- Modify: `src/components/product/ProductDetailModal.tsx` (insert the variant block above the description)

**Interfaces:**
- Consumes: `Product.sizes` and `Product.colourways` from Task 2, and `selectedSize`, `selectedQuantity`, `setSelectedSize`, `setSelectedQuantity` from Task 5.
- Produces: local selection state used only within this component. Nothing downstream consumes it.

- [ ] **Step 1: Add the gate constants**

Add inside the component body, after the reset effect:

```typescript
  const isSingle = product.isOneOfOne;
  const sizes = product.sizes ?? [product.size];
  const canSelectSize = !isSingle && sizes.length > 1;
  const canSetQuantity = !isSingle && product.availableQuantity > 1;
  const colourways = product.colourways ?? [];
```

These five lines are the whole variant model. `canSetQuantity` is gated on `availableQuantity > 1` rather than on `!isSingle`, which is what resolves Edge Case 2.

- [ ] **Step 2: Insert the variant block**

Locate the existing size and location grid in the right column, which contains the `SIZE` and `LOCATION` cells, and insert this block immediately after it and before the `PIECE DESCRIPTION` heading:

```tsx
                {/* Conditional Variant Block */}
                {isSingle ? (
                  <div className="flex items-center gap-3 py-4 border-b border-zinc-200 font-mono">
                    <span className="px-3 py-1.5 bg-zinc-950 text-white text-[10px] font-bold uppercase tracking-[0.15em]">
                      1 OF 1
                    </span>
                    <span className="text-[11px] text-zinc-500 uppercase tracking-[0.08em]">
                      Single piece archive
                    </span>
                  </div>
                ) : (
                  <div className="space-y-5 py-4 border-b border-zinc-200 font-mono">
                    {canSelectSize && (
                      <div className="space-y-2">
                        <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-[0.15em] block">
                          Select Size
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {sizes.map((sizeOption) => {
                            const isSelected = selectedSize === sizeOption;
                            return (
                              <button
                                key={sizeOption}
                                type="button"
                                onClick={() => setSelectedSize(sizeOption)}
                                className={`min-h-[44px] min-w-[44px] px-3 text-[11px] uppercase border transition-colors duration-150 ${
                                  isSelected
                                    ? 'bg-zinc-950 text-white border-zinc-950 font-bold'
                                    : 'bg-white text-zinc-950 border-zinc-300 hover:border-zinc-950'
                                }`}
                              >
                                {sizeOption}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {colourways.length > 1 && (
                      <div className="space-y-2">
                        <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-[0.15em] block">
                          Colourway
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {colourways.map((colourway) => (
                            <span
                              key={colourway.name}
                              title={colourway.name}
                              className="w-8 h-8 border border-zinc-300"
                              style={{ backgroundColor: colourway.hex ?? '#f4f4f5' }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {canSetQuantity && (
                      <div className="space-y-2">
                        <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-[0.15em] block">
                          Quantity
                        </span>
                        <div className="inline-flex items-center border border-zinc-300">
                          <button
                            type="button"
                            onClick={() => setSelectedQuantity((q) => Math.max(1, q - 1))}
                            disabled={selectedQuantity <= 1}
                            aria-label="Decrease quantity"
                            className="min-h-[44px] min-w-[44px] text-zinc-950 hover:bg-zinc-100 disabled:text-zinc-300 disabled:hover:bg-white transition-colors duration-150"
                          >
                            -
                          </button>
                          <span className="min-w-[48px] text-center text-[11px] font-bold text-zinc-950">
                            {selectedQuantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedQuantity((q) => Math.min(product.availableQuantity, q + 1))
                            }
                            disabled={selectedQuantity >= product.availableQuantity}
                            aria-label="Increase quantity"
                            className="min-h-[44px] min-w-[44px] text-zinc-950 hover:bg-zinc-100 disabled:text-zinc-300 disabled:hover:bg-white transition-colors duration-150"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-[10px] text-zinc-500 block">
                          {product.availableQuantity} available
                        </span>
                      </div>
                    )}
                  </div>
                )}
```

The quantity controls clamp to a `1` minimum and a `product.availableQuantity` maximum, and each is disabled at its own bound, so the value can never exceed real stock.

- [ ] **Step 3: Verify the single-piece path**

Run `npm run dev` and open `prod-2` (the vintage Levi's, `isOneOfOne: true`). Expected: no size selector and no quantity stepper. A `1 OF 1` marker with `Single piece archive` renders instead.

- [ ] **Step 4: Verify the multi-stock path**

Open `prod-1` (the hoodie, `isOneOfOne: false`, `availableQuantity: 4`). Expected: a four-chip size row with `Large` preselected, a two-swatch colourway row, and a quantity stepper that stops at 4. Clicking the decrease control at 1 does nothing and the control is visually disabled. Confirm the size selection moves when another chip is clicked.

- [ ] **Step 5: Verify the reset between products**

With `prod-1` open and `Medium` selected and quantity at 3, close it and open `prod-2`, then close that and reopen `prod-1`. Expected: `Medium` selection and quantity 3 do not leak into either the single-piece view or a fresh open. Selection resets each time.

- [ ] **Step 6: Verify the build and lint pass, then commit**

```bash
npm run build
npm run lint
git add src/components/product/ProductDetailModal.tsx
git commit -m "feat: add conditional size colourway and quantity variant block"
```

---

### Task 8: Full-screen sheet presentation on mobile

**Files:**
- Modify: `src/components/product/ProductDetailModal.tsx` (overlay and surface responsive classes only)

**Interfaces:**
- Consumes: the flex-column surface structure from Task 6.
- Produces: nothing consumed downstream. This is the final change to this file.

- [ ] **Step 1: Change the overlay to stretch on mobile**

Replace the overlay opening tag:

```tsx
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-black/80 backdrop-blur-md font-sans overflow-y-auto">
```

with:

```tsx
      <div className="fixed inset-0 z-50 flex items-stretch md:items-center justify-center p-0 md:p-6 lg:p-10 bg-black/80 backdrop-blur-md font-sans md:overflow-y-auto">
```

- [ ] **Step 2: Make the surface full-screen below the medium breakpoint**

Replace the surface class list established in Task 6:

```tsx
        <div className="relative w-full max-w-4xl bg-white rounded-none border border-zinc-900 shadow-2xl overflow-hidden z-10 my-auto flex flex-col max-h-[90vh]">
```

with:

```tsx
        <div className="relative w-full max-w-4xl bg-white rounded-none md:border md:border-zinc-900 md:shadow-2xl overflow-hidden z-10 flex flex-col h-full md:h-auto md:my-auto md:max-h-[90vh]">
```

Below `md`, the surface fills the viewport entirely: `h-full`, no border, no shadow, since a full-screen surface needs neither. At and above `md`, the original centered bordered card is restored unchanged. The desktop presentation is not redesigned.

- [ ] **Step 3: Verify both presentations**

Run `npm run dev`. At 375px, open a product. Expected: the detail fills the entire screen edge to edge with no visible white margin or page bleed, the header actions sit against the top edge, and the inquiry action sits against the bottom edge above the safe-area inset. Close it and confirm the bottom tab bar returns.

At 1280px, open a product. Expected: the original centered card with a 1px border, `max-w-4xl`, two columns, and rounded-none corners. The pinned action still sits at the bottom of the card.

- [ ] **Step 4: Verify the build and lint pass, then commit**

```bash
npm run build
npm run lint
git add src/components/product/ProductDetailModal.tsx
git commit -m "feat: present product detail as a full-screen sheet on mobile"
```

---

### Task 9: Card ribbon condition and residual curvature

**Files:**
- Modify: `src/components/feed/ProductCard.tsx:69-71` (gate the size ribbon)
- Modify: `src/components/feed/ProductGrid.tsx:21-34` (section header plus curvature fix)
- Modify: `src/components/drops/DropCountdownTimer.tsx:38-59` (curvature fix)

**Interfaces:**
- Consumes: nothing.
- Produces: nothing. These are terminal visual corrections.

- [ ] **Step 1: Gate the size ribbon on 1-of-1 cards**

In `src/components/feed/ProductCard.tsx`, the size ribbon currently renders unconditionally at lines 69 to 71. Replace:

```tsx
        {/* Bottom Size Ribbon */}
        <div className="absolute bottom-0 right-0 bg-zinc-950 text-white px-3 py-1 font-mono text-[10px] uppercase font-bold tracking-widest border-t border-l border-zinc-800">
          SIZE: {product.size}
        </div>
```

with:

```tsx
        {/* Bottom Size Ribbon (omitted on 1-of-1 pieces, where the corner ribbon already states uniqueness) */}
        {!product.isOneOfOne && (
          <div className="absolute bottom-0 right-0 bg-zinc-950 text-white px-3 py-1 font-mono text-[10px] uppercase font-bold tracking-widest border-t border-l border-zinc-800">
            SIZE: {product.size}
          </div>
        )}
```

- [ ] **Step 2: Fix the residual curvature in the grid empty state**

`src/components/feed/ProductGrid.tsx` escaped the sharp-geometry pass. Three class values must change. In the empty-state container at line 21, change `rounded-3xl` to `rounded-none`. In the icon wrapper at line 22, change `rounded-full` to `rounded-none`. In the reset button at line 34, change `rounded-full` to `rounded-none`. Leave every other class in the file alone.

- [ ] **Step 3: Fix the residual curvature in the countdown timer**

In `src/components/drops/DropCountdownTimer.tsx`, change all four occurrences of `rounded-lg` to `rounded-none`, at lines 38, 45, 52, and 59. These are the digit boxes and they should share the sharp geometry of every other surface.

- [ ] **Step 4: Verify no curvature remains**

Run:
```bash
grep -rn "rounded-full\|rounded-2xl\|rounded-3xl\|rounded-xl\|rounded-lg" src/
```
Expected: no output. If anything is listed, fix it before committing.

- [ ] **Step 5: Verify visually**

Run `npm run dev`. Confirm the 1-of-1 cards show only the `1-OF-1 THRIFT` corner ribbon and no redundant size ribbon, while multi-stock cards still show their size. Trigger the empty state by selecting a city and aesthetic combination with no matches and confirm it renders with sharp corners. Open the Drops view and confirm the countdown digit boxes are square.

- [ ] **Step 6: Verify the build and lint pass, then commit**

```bash
npm run build
npm run lint
git add src/components/feed/ProductCard.tsx src/components/feed/ProductGrid.tsx src/components/drops/DropCountdownTimer.tsx
git commit -m "style: gate size ribbon on 1-of-1 cards and remove residual curvature"
```

---

### Task 10: Correct the stale design specification

**Files:**
- Modify: `docs/specs/2026-09-23-habi-davao-fashion-design.md` (section 3.1 only)

**Interfaces:**
- Consumes: nothing.
- Produces: an accurate brief. No code change.

- [ ] **Step 1: Correct the three stale claims in section 3.1**

In section 3.1, make exactly these three corrections:

Change the typography line, which currently reads:

```
* **Typography Hierarchy**: Bold tracked uppercase headings (e.g., `HABI`, `ESSENTIAL OVERSIZED HOODIE`, `DAVAO FIT CHECK`) paired with clean sans-serif body copy (Inter / System Sans).
```

to:

```
* **Typography Hierarchy**: Syne for display and headlines, Plus Jakarta Sans for body copy, and Space Mono for technical metadata such as prices, sizes, and labels. Negative tracking is applied to display sizes and positive tracking to uppercase micro-text.
```

Change the radius line, which currently reads:

```
* **Card & Container Radius**: Clean 12px to 16px rounded corners with subtle hairline borders (`border border-zinc-200`) and high-fashion image aspect ratios (3:4, 1:1, 16:9).
```

to:

```
* **Card & Container Geometry**: Sharp 0px corners on all structural and interactive surfaces, with 1px hairline borders (`border border-zinc-200`) and high-fashion image aspect ratios (3:4, 1:1, 16:9). No curvature is used anywhere.
```

Then append a note at the end of section 3.1:

```
* **Theme Scope**: Light monochrome only. There is no dark mode and no dark or light theme variable pair; `src/index.css` defines a single white-canvas token set. Earlier references to Dark/Light theme variables in this specification were inaccurate.
```

- [ ] **Step 2: Confirm no other stale claim remains**

Run:
```bash
grep -n -i "inter\|rounded-\|dark mode\|dark/light" docs/specs/2026-09-23-habi-davao-fashion-design.md
```
Expected: no remaining claim that Inter is the body face, that curvature is used, or that a dark theme exists. Note that `rounded-full` may still legitimately appear in the document as a description of something being avoided, which is fine.

- [ ] **Step 3: Commit**

```bash
git add docs/specs/2026-09-23-habi-davao-fashion-design.md
git commit -m "docs: correct stale typography geometry and theme claims in design spec"
```

---

### Task 11: Final verification sweep

**Files:**
- Modify: `JOURNAL.md` (append the session entry)

**Interfaces:**
- Consumes: every prior task.
- Produces: the acceptance evidence.

- [ ] **Step 1: Run the full gate**

```bash
npm run build
npm run lint
```
Expected: build succeeds with zero TypeScript errors, lint reports zero errors. Record the actual output.

- [ ] **Step 2: Verify the acceptance criteria that are machine-checkable**

```bash
grep -rn "rounded-full\|rounded-2xl\|rounded-3xl\|rounded-xl\|rounded-lg" src/
grep -rn "—\|–" src/ docs/specs/2026-09-23-habi-reference-integration-design.md
```
Expected: both return nothing. The first proves the curvature criterion and the second proves the zero em-dash criterion across all touched sources.

- [ ] **Step 3: Verify the responsive sweep**

With `npm run dev` running, check each width and record the result:

| Width | Check |
|---|---|
| 320px | No horizontal scrollbar appears anywhere, and the bottom bar labels do not wrap |
| 375px | Bar shows four tabs, detail opens as a full-screen sheet, inquiry action visible without scrolling |
| 768px | Bar still present, detail sheet reaches the full width, grid shows two columns |
| 1024px | Bar absent at this breakpoint, header tabs visible, detail renders as a centered card |
| 1440px | Grid shows four columns, layout is centered at `max-w-7xl` |

- [ ] **Step 4: Verify keyboard reachability**

Using only Tab, at 375px: reach every control in the bottom bar, confirm the active tab reports `aria-current="page"`, open a product with Enter, and confirm focus is not trapped behind the hidden bar. Confirm the inquiry action is reachable and that the disabled state is not focusable when an item is unavailable.

- [ ] **Step 5: Append the journal entry**

Add to `JOURNAL.md`, following the existing dated format in that file, a `[2026-09-23]` entry recording: the integration of the reference structure, the four-tab bottom bar with its tab ids, the detail restructure with the pinned action and variant gate, the two additive type fields, the correction of seven residual curvature instances in `ProductGrid.tsx` and `DropCountdownTimer.tsx`, the correction of the stale section 3.1 claims, and the actual build and lint output from Step 1.

- [ ] **Step 6: Commit**

```bash
git add JOURNAL.md
git commit -m "docs: journal the reference integration and design token additions"
```

---

## Definition of Done

All five of these must be true before the work is called complete:

1. `npm run build` and `npm run lint` both pass with zero errors, and the actual output has been reported.
2. All twelve acceptance criteria in section 10 of the spec are satisfied, with the machine-checkable ones evidenced by command output.
3. The responsive sweep and the keyboard check from Task 11 have been run, not assumed.
4. `JOURNAL.md` contains the entry.
5. `git status --short` is clean.
