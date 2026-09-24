import React from 'react';
import { CustomFilterIcon, CustomTagIcon } from '../common/CustomIcons';

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
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E1E6B6] font-avantgarde">
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          <span className="text-xs font-semibold text-[#565C38] shrink-0 mr-1">
            Category:
          </span>
          {CATEGORY_OPTIONS.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#1A1A00] text-[#FFFFCC] font-bold shadow-sm'
                    : 'bg-[#EFF2D2] text-[#565C38] hover:bg-[#E2E6C2] hover:text-[#1A1A00]'
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
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer border border-[#E1E6B6] ${
            isOneOfOneOnly
              ? 'bg-[#1A1A00] text-[#FFFFCC] shadow-sm font-bold'
              : 'bg-[#EFF2D2] text-[#565C38] hover:bg-[#E2E6C2] hover:text-[#1A1A00]'
          }`}
        >
          <CustomTagIcon className="w-3.5 h-3.5" />
          <span>1-of-1 Thrift Vault</span>
          <span className={`w-2 h-2 rounded-full ${isOneOfOneOnly ? 'bg-[#FFFFCC]' : 'bg-[#565C38]'}`} />
        </button>
      </div>

      {/* Aesthetic Style Pills */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none font-avantgarde">
        <div className="flex items-center gap-1.5 text-xs text-[#565C38] font-semibold shrink-0 mr-1">
          <CustomFilterIcon className="w-3.5 h-3.5" />
          <span>Style:</span>
        </div>

        {AESTHETIC_OPTIONS.map((style) => {
          const isActive = selectedAesthetic === style;
          return (
            <button
              key={style}
              onClick={() => setSelectedAesthetic(style)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#1A1A00] text-[#FFFFCC] font-bold shadow-sm'
                  : 'bg-[#EFF2D2] text-[#565C38] hover:bg-[#E2E6C2] hover:text-[#1A1A00]'
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
