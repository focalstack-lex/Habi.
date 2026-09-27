/**
 * Hash routes so pieces, storefronts, boards, and closets have shareable URLs
 * without server configuration:
 *
 *   #/tab/map            a top-level tab
 *   #/piece/prod-2       opens the piece over the current tab
 *   #/store/voidarchive  a storefront by handle
 *   #/drop/drop-1        the drops tab scrolled to one drop
 *   #/board/<slug>?name=Weekend&items=prod-1,prod-2   a shared outfit board
 *   #/closet?name=Maria&items=prod-1,prod-2           a shared closet
 */

export interface Route {
  kind: 'tab' | 'piece' | 'store' | 'drop' | 'board' | 'closet' | 'none';
  id: string;
  query: URLSearchParams;
}

export function parseHash(hash: string = window.location.hash): Route {
  const raw = hash.replace(/^#/, '');
  if (!raw || raw === '/') return { kind: 'none', id: '', query: new URLSearchParams() };
  const [path, queryString = ''] = raw.split('?');
  const query = new URLSearchParams(queryString);
  const parts = path.split('/').filter(Boolean);
  const [head, ...rest] = parts;
  const id = decodeURIComponent(rest.join('/'));

  switch (head) {
    case 'tab':
      return { kind: 'tab', id, query };
    case 'piece':
      return { kind: 'piece', id, query };
    case 'store':
      return { kind: 'store', id, query };
    case 'drop':
      return { kind: 'drop', id, query };
    case 'board':
      return { kind: 'board', id, query };
    case 'closet':
      return { kind: 'closet', id, query };
    default:
      return { kind: 'none', id: '', query };
  }
}

export function buildHash(path: string, query?: Record<string, string>): string {
  const params = new URLSearchParams();
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value) params.set(key, value);
    }
  }
  const queryString = params.toString();
  return `#${path}${queryString ? `?${queryString}` : ''}`;
}

/** Updates the address bar without firing hashchange (replace) or with history (push). */
export function setHash(hash: string, mode: 'replace' | 'push' = 'replace'): void {
  if (window.location.hash === hash) return;
  const url = `${window.location.pathname}${window.location.search}${hash}`;
  if (mode === 'push') window.history.pushState(null, '', url);
  else window.history.replaceState(null, '', url);
}

export function absoluteUrl(hash: string): string {
  return `${window.location.origin}${window.location.pathname}${hash}`;
}
