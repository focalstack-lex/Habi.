import React, { useEffect, useRef, useState } from 'react';
import type { Product } from '../../types/fashion';
import { catalogService } from '../../services/catalogService';
import { useCatalogVersion } from '../../hooks/useCatalogVersion';

interface LiveDropGridProps {
  items: Product[];
}

const ERROR_VISIBLE_MS = 3000;

/**
 * Pieces of a drop that is live right now. Reservations are first come, first
 * served: the grid re-reads each product from the catalog on every render so a
 * status change (from this tab or a seller edit) shows without a reload.
 */
export const LiveDropGrid: React.FC<LiveDropGridProps> = ({ items }) => {
  useCatalogVersion();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const errorTimersRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const timers = errorTimersRef.current;
    return () => {
      Object.values(timers).forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const showError = (productId: string, message: string) => {
    setErrors((prev) => ({ ...prev, [productId]: message }));
    window.clearTimeout(errorTimersRef.current[productId]);
    errorTimersRef.current[productId] = window.setTimeout(() => {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
      delete errorTimersRef.current[productId];
    }, ERROR_VISIBLE_MS);
  };

  const handleReserve = (productId: string) => {
    try {
      catalogService.reserveProduct(productId);
    } catch (error) {
      showError(productId, error instanceof Error ? error.message : 'Could not reserve this piece.');
    }
  };

  const handleCancel = (productId: string) => {
    catalogService.cancelReservation(productId);
  };

  if (items.length === 0) {
    return (
      <p className="text-xs text-zinc-500">The seller has not attached pieces to this drop yet.</p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
      {items.map((item) => {
        const product = catalogService.getProductById(item.id) ?? item;
        const isMine = product.status === 'Reserved' && catalogService.isReservedByMe(product.id);
        const error = errors[product.id];

        return (
          <div key={product.id} className="space-y-1.5">
            <div className="bg-white border border-zinc-200/70 rounded-2xl p-3 space-y-2 shadow-xs">
              <div className="aspect-square bg-zinc-100 rounded-xl overflow-hidden">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className={`w-full h-full object-cover ${product.status === 'Sold Out' ? 'opacity-60' : ''}`}
                />
              </div>
              <div className="font-outfit text-xs font-semibold truncate text-zinc-950" title={product.name}>
                {product.name}
              </div>
              <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-500">
                <span className="font-bold text-zinc-900 text-xs">₱{product.price.toLocaleString()}</span>
                <span className="truncate">Size {product.size}</span>
              </div>

              {product.status === 'Available' && (
                <button
                  type="button"
                  onClick={() => handleReserve(product.id)}
                  className="w-full py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-full text-xs font-semibold transition-colors shadow-sm cursor-pointer"
                >
                  Reserve
                </button>
              )}

              {product.status === 'Reserved' && isMine && (
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
                    Yours
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCancel(product.id)}
                    className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-950 underline underline-offset-2 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {product.status === 'Reserved' && !isMine && (
                <span className="block w-full text-center px-3 py-1.5 rounded-full bg-zinc-100 text-zinc-500 text-[11px] font-semibold">
                  Reserved
                </span>
              )}

              {product.status === 'Sold Out' && (
                <span className="block w-full text-center px-3 py-1.5 rounded-full bg-zinc-100 text-zinc-500 text-[11px] font-semibold line-through">
                  Sold Out
                </span>
              )}
            </div>

            {error && (
              <p role="alert" className="text-[11px] text-red-600 font-medium leading-snug px-1">
                {error}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};
