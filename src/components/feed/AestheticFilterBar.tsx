import React from 'react';
import { CustomTagIcon } from '../common/CustomIcons';
import { useI18n } from '../../i18n';

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
  const { t } = useI18n();
  return (
    <div className="mb-3 sm:mb-4 font-sans">
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 py-1">
        {/* 1-of-1 Vault Chip */}
        <button
          onClick={() => setIsOneOfOneOnly(!isOneOfOneOnly)}
          aria-pressed={isOneOfOneOnly}
          className={`shrink-0 h-8 flex items-center gap-1.5 px-3 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
            isOneOfOneOnly
              ? 'bg-[#1A2225] text-[#FFF9E9] border-[#1A2225] shadow-sm font-bold'
              : 'bg-[#F3ECD8] text-[#55615D] border-[#E6DCC0] hover:bg-[#E8DFC6] hover:text-[#1A2225]'
          }`}
        >
          <CustomTagIcon className="w-3.5 h-3.5" />
          <span>{t('filter.oneOfOne')}</span>
        </button>

        <span className="shrink-0 w-px h-5 bg-[#E6DCC0] mx-0.5" aria-hidden="true" />

        {/* Categories */}
        {CATEGORY_OPTIONS.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              aria-pressed={isActive}
              className={`shrink-0 h-8 px-3.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#1A2225] text-[#FFF9E9] border border-[#1A2225] shadow-sm font-bold'
                  : 'bg-[#FFF9E9] text-[#55615D] border border-[#E6DCC0] hover:bg-[#F3ECD8] hover:text-[#1A2225]'
              }`}
            >
              {cat === 'All' ? t('filter.all') : cat}
            </button>
          );
        })}

        <span className="shrink-0 w-px h-5 bg-[#E6DCC0] mx-0.5" aria-hidden="true" />

        {/* Aesthetic styles */}
        {AESTHETIC_OPTIONS.filter((s) => s !== 'All').map((style) => {
          const isActive = selectedAesthetic === style;
          return (
            <button
              key={style}
              onClick={() => setSelectedAesthetic(isActive ? 'All' : style)}
              aria-pressed={isActive}
              className={`shrink-0 h-8 px-3.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#1A2225] text-[#FFF9E9] border border-[#1A2225] shadow-sm font-bold'
                  : 'bg-[#F3ECD8] text-[#55615D] border border-transparent hover:bg-[#E8DFC6] hover:text-[#1A2225]'
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
