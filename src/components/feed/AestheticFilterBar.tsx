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
    <div className="space-y-2 mb-3 sm:mb-5 font-sans">
      {/* Category: plain text tabs */}
      <div className="flex items-center gap-4 sm:gap-5 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-zinc-100">
        <span className="sr-only">{t('filter.category')}</span>
        {CATEGORY_OPTIONS.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              aria-pressed={isActive}
              className={`shrink-0 py-2 -mb-px border-b-2 text-xs font-semibold transition-colors cursor-pointer ${
                isActive
                  ? 'border-zinc-950 text-zinc-950'
                  : 'border-transparent text-zinc-500 hover:text-zinc-950'
              }`}
            >
              {cat === 'All' ? t('filter.all') : cat}
            </button>
          );
        })}
      </div>

      {/* Style chips, led by the 1-of-1 toggle */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 py-0.5">
        <span className="sr-only">{t('filter.style')}</span>
        <button
          onClick={() => setIsOneOfOneOnly(!isOneOfOneOnly)}
          aria-pressed={isOneOfOneOnly}
          className={`shrink-0 h-7 flex items-center gap-1 px-2.5 rounded-full text-[11px] sm:text-xs font-semibold border transition-colors cursor-pointer ${
            isOneOfOneOnly
              ? 'bg-zinc-950 text-white border-zinc-950'
              : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400'
          }`}
        >
          <CustomTagIcon className="w-3 h-3" />
          <span>{t('filter.oneOfOne')}</span>
        </button>

        <span className="shrink-0 w-px h-4 bg-zinc-200 mx-0.5" aria-hidden="true" />

        {AESTHETIC_OPTIONS.map((style) => {
          const isActive = selectedAesthetic === style;
          return (
            <button
              key={style}
              onClick={() => setSelectedAesthetic(style)}
              aria-pressed={isActive}
              className={`shrink-0 h-7 px-3 rounded-full text-[11px] sm:text-xs font-semibold transition-colors cursor-pointer ${
                isActive
                  ? 'bg-zinc-950 text-white'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              {style === 'All' ? t('filter.all') : style}
            </button>
          );
        })}
      </div>
    </div>
  );
};
