import React from 'react';
import { Filter, Tag } from 'lucide-react';

interface AestheticFilterBarProps {
  selectedAesthetic: string;
  setSelectedAesthetic: (aesthetic: string) => void;
  isOneOfOneOnly: boolean;
  setIsOneOfOneOnly: (val: boolean) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export const AESTHETIC_OPTIONS = [
  'All',
  'Streetwear',
  'Vintage',
  'Y2K',
  'Techwear',
  'Gorpcore',
  'Minimalist',
  'Workwear',
];

export const CATEGORY_OPTIONS = [
  'All',
  'Outerwear',
  'Denim',
  'Tops',
  'Pants',
  'Accessories',
  'Sportswear',
];

export const AestheticFilterBar: React.FC<AestheticFilterBarProps> = ({
  selectedAesthetic,
  setSelectedAesthetic,
  isOneOfOneOnly,
  setIsOneOfOneOnly,
  selectedCategory,
  setSelectedCategory,
}) => {
  return (
    <div className="space-y-3.5 mb-8 font-sans">
      {/* Category Pills Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-100">
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          <span className="text-xs font-semibold text-zinc-400 shrink-0 mr-1">
            Category:
          </span>
          {CATEGORY_OPTIONS.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all shrink-0 ${
                  isActive
                    ? 'bg-zinc-950 text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-950'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* 1-of-1 Thrift Capsule Toggle */}
        <button
          onClick={() => setIsOneOfOneOnly(!isOneOfOneOnly)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all shrink-0 ${
            isOneOfOneOnly
              ? 'bg-zinc-950 text-white shadow-sm'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200/80'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>1-of-1 Thrift Vault</span>
          <span className={`w-2 h-2 rounded-full ${isOneOfOneOnly ? 'bg-white' : 'bg-zinc-400'}`} />
        </button>
      </div>

      {/* Aesthetic Style Pills */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-semibold shrink-0 mr-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Style:</span>
        </div>

        {AESTHETIC_OPTIONS.map((style) => {
          const isActive = selectedAesthetic === style;
          return (
            <button
              key={style}
              onClick={() => setSelectedAesthetic(style)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                isActive
                  ? 'bg-zinc-950 text-white shadow-sm'
                  : 'bg-zinc-100/90 text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-950'
              }`}
            >
              {style}
            </button>
          );
        })}
      </div>
    </div>
  );
};
