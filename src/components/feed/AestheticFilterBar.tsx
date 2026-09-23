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
    <div className="space-y-4 mb-8">
      {/* Category & 1-of-1 Toggle Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-200 font-mono">
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold shrink-0 mr-1">
            Category:
          </span>
          {CATEGORY_OPTIONS.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs transition-colors shrink-0 ${
                  isActive
                    ? 'bg-zinc-900 text-white font-medium'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* 1-of-1 Thrift Filter Toggle */}
        <button
          onClick={() => setIsOneOfOneOnly(!isOneOfOneOnly)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono tracking-tight transition-all border ${
            isOneOfOneOnly
              ? 'bg-zinc-900 border-zinc-900 text-white font-medium shadow-sm'
              : 'bg-white border-zinc-300 text-zinc-700 hover:border-zinc-900'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>1-of-1 Thrift Only</span>
        </button>
      </div>

      {/* Aesthetic Style Chips */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 font-mono scrollbar-none">
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-bold uppercase tracking-widest shrink-0 mr-2">
          <Filter className="w-3.5 h-3.5" />
          <span>Style:</span>
        </div>

        {AESTHETIC_OPTIONS.map((style) => {
          const isActive = selectedAesthetic === style;
          return (
            <button
              key={style}
              onClick={() => setSelectedAesthetic(style)}
              className={`px-4 py-1.5 rounded-full text-xs tracking-tight transition-all shrink-0 ${
                isActive
                  ? 'bg-zinc-900 text-white font-medium shadow-sm'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900'
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
