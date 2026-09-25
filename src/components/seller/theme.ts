import type { CSSProperties } from 'react';
import type { Seller, SellerTheme } from '../../types/fashion';

/**
 * Storefront theme helpers. Obsidian is the stock accent: when a seller keeps it
 * the storefront stays on zinc utilities so dark mode can still remap them. Any
 * other accent is applied as the one permitted inline hex.
 */

export const DEFAULT_ACCENT = '#09090b';

export const ACCENT_OPTIONS: { name: string; hex: string }[] = [
  { name: 'Obsidian', hex: '#09090b' },
  { name: 'Brick', hex: '#b91c1c' },
  { name: 'Cobalt', hex: '#1d4ed8' },
  { name: 'Forest', hex: '#047857' },
  { name: 'Amber', hex: '#b45309' },
  { name: 'Violet', hex: '#6d28d9' },
];

export const LAYOUT_OPTIONS: { id: SellerTheme['layout']; label: string }[] = [
  { id: 'banner', label: 'Banner' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'split', label: 'Split' },
];

export interface ResolvedTheme extends SellerTheme {
  isDefaultAccent: boolean;
}

export function resolveSellerTheme(source: Pick<Seller, 'theme'>): ResolvedTheme {
  const accent = source.theme?.accent ?? DEFAULT_ACCENT;
  const layout = source.theme?.layout ?? 'banner';
  return { accent, layout, isDefaultAccent: accent.toLowerCase() === DEFAULT_ACCENT };
}

/** Solid accent fill with white text for buttons; undefined keeps the zinc classes. */
export function accentFillStyle(theme: ResolvedTheme): CSSProperties | undefined {
  return theme.isDefaultAccent ? undefined : { backgroundColor: theme.accent, color: '#ffffff' };
}

/** 3px accent ring around the avatar; undefined keeps the stock look. */
export function accentRingStyle(theme: ResolvedTheme): CSSProperties | undefined {
  return theme.isDefaultAccent ? undefined : { boxShadow: `0 0 0 3px ${theme.accent}` };
}

/** Accent text and underline for the active storefront tab. */
export function accentTabStyle(theme: ResolvedTheme): CSSProperties | undefined {
  return theme.isDefaultAccent ? undefined : { color: theme.accent, borderColor: theme.accent };
}
