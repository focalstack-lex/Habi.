import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { Product, TaggedItem } from '../../types/fashion';
import { catalogService } from '../../services/catalogService';
import { inputClass, labelClass } from '../common/FormControls';

const MAX_PINS = 5;
const MAX_ROWS = 40;

interface TagPinPlacerProps {
  imageUrl: string;
  tags: TaggedItem[];
  onChange: (tags: TaggedItem[]) => void;
}

interface PendingPin {
  xPercentage: number;
  yPercentage: number;
}

function clampPercent(value: number): number {
  return Math.round(Math.min(100, Math.max(0, value)) * 10) / 10;
}

/** Called from the pick handler, never during render. */
function makeTagId(): string {
  return 'tag-' + Date.now().toString(36);
}

function matchesQuery(product: Product, needle: string): boolean {
  return (
    product.name.toLowerCase().includes(needle) ||
    product.sellerName.toLowerCase().includes(needle) ||
    product.sellerHandle.toLowerCase().includes(needle)
  );
}

export const TagPinPlacer: React.FC<TagPinPlacerProps> = ({ imageUrl, tags, onChange }) => {
  const [pending, setPending] = useState<PendingPin | null>(null);
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const products = useMemo(() => catalogService.getVisibleProducts(), []);

  const isFull = tags.length >= MAX_PINS;

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle ? products.filter((product) => matchesQuery(product, needle)) : products;
    return { rows: filtered.slice(0, MAX_ROWS), total: filtered.length };
  }, [products, query]);

  // Move focus into the picker whenever a new spot is tapped.
  useEffect(() => {
    if (pending) searchRef.current?.focus();
  }, [pending]);

  const handlePhotoTap = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isFull) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    setPending({
      xPercentage: clampPercent(((event.clientX - rect.left) / rect.width) * 100),
      yPercentage: clampPercent(((event.clientY - rect.top) / rect.height) * 100),
    });
  };

  const cancelPick = () => {
    setPending(null);
    setQuery('');
  };

  const removeTag = (tagId: string) => {
    onChange(tags.filter((tag) => tag.id !== tagId));
  };

  const pickProduct = (product: Product) => {
    if (!pending || isFull) return;
    onChange([
      ...tags,
      {
        id: makeTagId(),
        xPercentage: pending.xPercentage,
        yPercentage: pending.yPercentage,
        productId: product.id,
        sellerId: product.sellerId,
        sellerName: product.sellerName,
        itemTitle: product.name,
        price: product.price,
      },
    ]);
    cancelPick();
  };

  return (
    <div className="space-y-3 font-sans">
      <div className="space-y-1">
        <div className={labelClass}>Tag the pieces</div>
        <p className="text-[11px] text-zinc-500">Tap the photo where a piece is worn, then pick it from the list.</p>
      </div>

      {/* Photo with numbered pins */}
      <div
        onClick={handlePhotoTap}
        className={`relative aspect-[3/4] bg-zinc-100 rounded-xl sm:rounded-2xl overflow-hidden border border-zinc-200 select-none ${
          isFull ? 'cursor-not-allowed' : 'cursor-crosshair'
        }`}
      >
        <img src={imageUrl} alt="Your fit" draggable={false} className="w-full h-full object-cover pointer-events-none" />

        {tags.map((tag, index) => (
          <button
            key={tag.id}
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              removeTag(tag.id);
            }}
            style={{ left: `${tag.xPercentage}%`, top: `${tag.yPercentage}%` }}
            aria-label={`Remove tag ${index + 1}: ${tag.itemTitle}`}
            title="Tap to remove"
            className="absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-zinc-950 text-white text-[11px] font-bold flex items-center justify-center border-2 border-white shadow-lg hover:scale-110 active:scale-95 transition-transform"
          >
            {index + 1}
          </button>
        ))}

        {pending && (
          <span
            aria-hidden="true"
            style={{ left: `${pending.xPercentage}%`, top: `${pending.yPercentage}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-zinc-950/60 border-2 border-white shadow-lg pointer-events-none"
          />
        )}
      </div>

      {isFull && (
        <p className="text-[11px] text-zinc-500 font-medium">Maximum of {MAX_PINS} pieces per photo. Tap a pin to remove it.</p>
      )}

      {/* Inline product picker */}
      {pending && (
        <div className="border border-zinc-200/80 rounded-xl sm:rounded-2xl bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 p-2.5 border-b border-zinc-100">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search pieces or sellers"
                aria-label="Search pieces"
                className={`${inputClass} pl-9`}
              />
            </div>
            <button
              type="button"
              onClick={cancelPick}
              aria-label="Cancel tagging"
              className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-700 flex items-center justify-center hover:bg-zinc-200 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <ul className="max-h-64 overflow-y-auto divide-y divide-zinc-100">
            {matches.rows.map((product) => (
              <li key={product.id}>
                <button
                  type="button"
                  onClick={() => pickProduct(product)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-zinc-50 transition-colors"
                >
                  <img
                    src={product.images[0]}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover border border-zinc-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-zinc-950 truncate">{product.name}</div>
                    <div className="text-[11px] text-zinc-500 truncate">{product.sellerName}</div>
                  </div>
                  <div className="text-xs font-bold text-zinc-950 shrink-0">₱{product.price.toLocaleString()}</div>
                </button>
              </li>
            ))}
            {matches.rows.length === 0 && (
              <li className="px-3 py-6 text-center text-xs text-zinc-500">No pieces match that search.</li>
            )}
          </ul>

          {matches.total > MAX_ROWS && (
            <div className="px-3 py-2 border-t border-zinc-100 text-[11px] text-zinc-500">
              Showing {MAX_ROWS} of {matches.total}. Keep typing to narrow it down.
            </div>
          )}
        </div>
      )}

      {/* Placed tags */}
      {tags.length > 0 && (
        <ul className="space-y-1.5">
          {tags.map((tag, index) => (
            <li key={tag.id} className="flex items-center gap-3 bg-zinc-50 border border-zinc-200/80 rounded-xl px-3 py-2">
              <span className="w-6 h-6 rounded-full bg-zinc-950 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-zinc-950 truncate">{tag.itemTitle}</div>
                <div className="text-[11px] text-zinc-500 truncate">
                  {tag.sellerName} • ₱{tag.price.toLocaleString()}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeTag(tag.id)}
                aria-label={`Remove ${tag.itemTitle}`}
                className="w-8 h-8 rounded-full text-zinc-500 hover:text-red-600 hover:bg-red-50 flex items-center justify-center shrink-0 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
