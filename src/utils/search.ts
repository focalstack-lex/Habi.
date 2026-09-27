import type { Product, Seller } from '../types/fashion';

export interface SearchSuggestion {
  type: 'recent' | 'seller' | 'tag' | 'category';
  label: string;
  value: string;
  sellerId?: string;
}

function tokens(value: string): string[] {
  return value.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 1);
}

/** Type-ahead suggestions: recent searches first, then sellers, tags, and categories that start with or contain the query. */
export function getSuggestions(
  query: string,
  products: Product[],
  sellers: Seller[],
  recent: string[],
  limit = 8
): SearchSuggestion[] {
  const q = query.trim().toLowerCase();
  const results: SearchSuggestion[] = [];
  const seen = new Set<string>();
  const push = (suggestion: SearchSuggestion) => {
    const key = `${suggestion.type}:${suggestion.value.toLowerCase()}`;
    if (seen.has(key) || results.length >= limit) return;
    seen.add(key);
    results.push(suggestion);
  };

  if (!q) {
    recent.forEach((value) => push({ type: 'recent', label: value, value }));
    return results;
  }

  recent.filter((r) => r.toLowerCase().includes(q)).forEach((value) => push({ type: 'recent', label: value, value }));

  const rank = (text: string) => (text.toLowerCase().startsWith(q) ? 0 : text.toLowerCase().includes(q) ? 1 : 2);

  sellers
    .filter((s) => s.name.toLowerCase().includes(q) || s.handle.toLowerCase().includes(q))
    .sort((a, b) => rank(a.name) - rank(b.name))
    .slice(0, 3)
    .forEach((s) => push({ type: 'seller', label: s.name, value: s.name, sellerId: s.id }));

  const tagCounts = new Map<string, number>();
  const categoryCounts = new Map<string, number>();
  for (const product of products) {
    product.tags.forEach((tag) => tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1));
    categoryCounts.set(product.category, (categoryCounts.get(product.category) ?? 0) + 1);
  }

  [...categoryCounts.keys()]
    .filter((c) => c.toLowerCase().includes(q))
    .sort((a, b) => rank(a) - rank(b))
    .slice(0, 2)
    .forEach((c) => push({ type: 'category', label: c, value: c }));

  [...tagCounts.entries()]
    .filter(([tag]) => tag.toLowerCase().includes(q))
    .sort((a, b) => rank(a[0]) - rank(b[0]) || b[1] - a[1])
    .slice(0, 4)
    .forEach(([tag]) => push({ type: 'tag', label: tag, value: tag }));

  return results;
}

/** When a search returns nothing, score every product by token overlap and prefix similarity. */
export function closestMatches(query: string, products: Product[], limit = 4): Product[] {
  const queryTokens = tokens(query);
  if (queryTokens.length === 0) return [];

  const scored = products
    .map((product) => {
      const haystack = tokens(`${product.name} ${product.sellerName} ${product.category} ${product.tags.join(' ')} ${product.aesthetics.join(' ')}`);
      let score = 0;
      for (const qt of queryTokens) {
        for (const ht of haystack) {
          if (ht === qt) score += 3;
          else if (ht.startsWith(qt) || qt.startsWith(ht)) score += 2;
          else if (ht.includes(qt) || qt.includes(ht)) score += 1;
          else if (qt.length >= 4 && ht.length >= 4 && ht.slice(0, 3) === qt.slice(0, 3)) score += 0.5;
        }
      }
      return { product, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((entry) => entry.product);
}
