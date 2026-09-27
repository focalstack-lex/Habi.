import React from 'react';
import type { Product } from '../../types/fashion';
import { catalogService } from '../../services/catalogService';
import { useCatalogVersion } from '../../hooks/useCatalogVersion';

interface SimilarPiecesRowProps {
  product: Product;
  onSelect: (product: Product) => void;
}

const MAX_RESULTS = 6;

/** Same category counts most, then shared aesthetics, a close price, and the same seller. */
function similarityScore(base: Product, candidate: Product): number {
  let score = base.category === candidate.category ? 2 : 0;
  score += candidate.aesthetics.filter((aesthetic) => base.aesthetics.includes(aesthetic)).length;
  if (base.sellerId === candidate.sellerId) score += 0.5;
  if (Math.abs(base.price - candidate.price) <= base.price * 0.4) score += 1;
  return score;
}

function rankSimilarPieces(base: Product, pool: Product[]): Product[] {
  return pool
    .filter((candidate) => candidate.id !== base.id)
    .map((candidate) => ({ candidate, score: similarityScore(base, candidate) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || b.candidate.dateAdded.localeCompare(a.candidate.dateAdded))
    .slice(0, MAX_RESULTS)
    .map((entry) => entry.candidate);
}

export const SimilarPiecesRow: React.FC<SimilarPiecesRowProps> = ({ product, onSelect }) => {
  useCatalogVersion();
  const similar = rankSimilarPieces(product, catalogService.getVisibleProducts());
  if (similar.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="font-avantgarde text-[11px] tracking-wider uppercase font-semibold text-zinc-500">Similar pieces</h3>
      <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
        {similar.map((piece) => (
          <button
            key={piece.id}
            type="button"
            onClick={() => onSelect(piece)}
            className="w-28 sm:w-36 shrink-0 text-left group"
          >
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200/80">
              <img
                src={piece.images[0]}
                alt={piece.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                loading="lazy"
              />
              {piece.status !== 'Available' && (
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-zinc-950/85 text-white text-[11px] font-semibold rounded-full">
                  {piece.status}
                </span>
              )}
            </div>
            <span className="block text-xs font-semibold text-zinc-900 truncate mt-1.5">{piece.name}</span>
            <span className="block text-xs text-zinc-500">₱{piece.price.toLocaleString()}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
