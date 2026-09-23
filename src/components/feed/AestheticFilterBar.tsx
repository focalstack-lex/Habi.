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
    <div className="space-y-4 mb-8 font-mono">
      {/* Category Row with Clean Text Tabs (NO Pills) */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div className="flex items-center gap-4 overflow-x-auto py-1 scrollbar-none">
          <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold shrink-0">
            Category:
          </span>
          {CATEGORY_OPTIONS.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`py-1 text-xs uppercase tracking-wider transition-all border-b-2 shrink-0 ${
                  isActive
                    ? 'border-zinc-950 text-zinc-950 font-bold'
                    : 'border-transparent text-zinc-500 hover:text-zinc-950'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* 1-of-1 Thrift Rectangular Ribbon Toggle */}
        <button
          onClick={() => setIsOneOfOneOnly(!isOneOfOneOnly)}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-mono tracking-wider uppercase font-bold transition-all border ${
            isOneOfOneOnly
              ? 'bg-zinc-950 border-zinc-950 text-white shadow-sm'
              : 'bg-white border-zinc-300 text-zinc-800 hover:border-zinc-950'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>1-of-1 Thrift Archive Only</span>
        </button>
      </div>

      {/* Aesthetic Style Chips (Clean Rectangular Buttons, NO Pills) */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-bold uppercase tracking-[0.2em] shrink-0 mr-2">
          <Filter className="w-3.5 h-3.5" />
          <span>Style:</span>
        </div>

        {AESTHETIC_OPTIONS.map((style) => {
          const isActive = selectedAesthetic === style;
          return (
            <button
              key={style}
              onClick={() => setSelectedAesthetic(style)}
              className={`px-4 py-2 text-xs uppercase font-bold tracking-wider transition-all shrink-0 border ${
                isActive
                  ? 'bg-zinc-950 border-zinc-950 text-white shadow-sm'
                  : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:border-zinc-950 hover:text-zinc-950'
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
