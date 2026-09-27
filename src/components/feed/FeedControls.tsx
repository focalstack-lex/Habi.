import React from 'react';
import { ArrowDownUp, Ruler, Sparkles, Users } from 'lucide-react';
import { useI18n } from '../../i18n';

export type FeedMode = 'forYou' | 'following';
export type SortKey = 'newest' | 'priceLow' | 'priceHigh' | 'mostSaved';
export type PriceRange = 'any' | 'under500' | '500-1000' | '1000-2000' | 'over2000';

export const PRICE_RANGES: { id: PriceRange; label: string; min: number; max: number }[] = [
  { id: 'any', label: 'Any price', min: 0, max: Infinity },
  { id: 'under500', label: 'Under ₱500', min: 0, max: 499 },
  { id: '500-1000', label: '₱500 to ₱1,000', min: 500, max: 1000 },
  { id: '1000-2000', label: '₱1,000 to ₱2,000', min: 1000, max: 2000 },
  { id: 'over2000', label: 'Over ₱2,000', min: 2001, max: Infinity },
];

interface FeedControlsProps {
  mode: FeedMode;
  onModeChange: (mode: FeedMode) => void;
  followingNewCount: number;
  fitsMe: boolean;
  hasSizeProfile: boolean;
  onFitsMeChange: (enabled: boolean) => void;
  onSetSizes: () => void;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
  priceRange: PriceRange;
  onPriceRangeChange: (range: PriceRange) => void;
}

const chipBase =
  'shrink-0 h-8 flex items-center gap-1.5 px-3 rounded-full text-xs font-semibold border transition-colors';
const chipIdle = 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400';
const chipActive = 'bg-zinc-950 text-white border-zinc-950';
const selectClass =
  'appearance-none h-8 bg-white text-zinc-700 text-xs font-semibold rounded-full pl-7 pr-6 border border-zinc-200 hover:border-zinc-400 focus:outline-none focus:border-zinc-500 cursor-pointer';

export const FeedControls: React.FC<FeedControlsProps> = ({
  mode,
  onModeChange,
  followingNewCount,
  fitsMe,
  hasSizeProfile,
  onFitsMeChange,
  onSetSizes,
  sort,
  onSortChange,
  priceRange,
  onPriceRangeChange,
}) => {
  const { t } = useI18n();

  return (
    <div className="space-y-3 mb-3 font-sans">
      {/* For You / Following: underline tabs */}
      <div className="flex items-center border-b border-zinc-200">
        <button
          type="button"
          onClick={() => onModeChange('forYou')}
          aria-pressed={mode === 'forYou'}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 -mb-px border-b-2 text-xs font-semibold transition-colors ${
            mode === 'forYou' ? 'border-zinc-950 text-zinc-950' : 'border-transparent text-zinc-500 hover:text-zinc-950'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('feed.forYou')}</span>
        </button>
        <button
          type="button"
          onClick={() => onModeChange('following')}
          aria-pressed={mode === 'following'}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 -mb-px border-b-2 text-xs font-semibold transition-colors ${
            mode === 'following' ? 'border-zinc-950 text-zinc-950' : 'border-transparent text-zinc-500 hover:text-zinc-950'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{t('feed.following')}</span>
          {followingNewCount > 0 && (
            <span className={`ml-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${
              mode === 'following' ? 'bg-white text-zinc-950' : 'bg-zinc-950 text-white'
            }`}>
              {followingNewCount}
            </span>
          )}
        </button>
      </div>

      {/* Fits me, sort, price */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          type="button"
          onClick={() => (hasSizeProfile ? onFitsMeChange(!fitsMe) : onSetSizes())}
          aria-pressed={fitsMe}
          className={`${chipBase} ${fitsMe && hasSizeProfile ? chipActive : chipIdle}`}
        >
          <Ruler className="w-3.5 h-3.5" />
          <span>{hasSizeProfile ? t('feed.fitsMe') : t('feed.setSizes')}</span>
        </button>

        <label className="relative shrink-0">
          <ArrowDownUp className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
            aria-label={t('feed.sort')}
            className={selectClass}
          >
            <option value="newest">{t('feed.sort.newest')}</option>
            <option value="priceLow">{t('feed.sort.priceLow')}</option>
            <option value="priceHigh">{t('feed.sort.priceHigh')}</option>
            <option value="mostSaved">{t('feed.sort.mostSaved')}</option>
          </select>
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 text-[10px] pointer-events-none">▾</span>
        </label>

        <label className="relative shrink-0">
          <span className="text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-xs font-bold">₱</span>
          <select
            value={priceRange}
            onChange={(e) => onPriceRangeChange(e.target.value as PriceRange)}
            aria-label={t('feed.price')}
            className={selectClass}
          >
            {PRICE_RANGES.map((range) => (
              <option key={range.id} value={range.id}>
                {range.id === 'any' ? t('feed.priceAny') : range.label}
              </option>
            ))}
          </select>
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 text-[10px] pointer-events-none">▾</span>
        </label>
      </div>
    </div>
  );
};
