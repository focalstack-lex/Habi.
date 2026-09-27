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
  'shrink-0 h-8 flex items-center gap-1.5 px-3 rounded-full text-xs font-semibold border transition-colors cursor-pointer';
const chipIdle = 'bg-[#FFF9E9] text-[#1A2225] border-[#E6DCC0] hover:bg-[#F3ECD8]';
const chipActive = 'bg-[#1A2225] text-[#FFF9E9] border-[#1A2225]';
const selectClass =
  'appearance-none h-8 bg-[#FFF9E9] text-[#1A2225] text-xs font-semibold rounded-full pl-7 pr-6 border border-[#E6DCC0] hover:bg-[#F3ECD8] focus:outline-none focus:border-[#55615D] cursor-pointer';

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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 font-sans pb-3 border-b border-[#E6DCC0]">
      {/* Left: For You / Following feed mode capsule switcher */}
      <div className="flex items-center gap-1 bg-[#F3ECD8] p-1 rounded-full border border-[#E6DCC0] shrink-0 self-start sm:self-auto">
        <button
          type="button"
          onClick={() => onModeChange('forYou')}
          aria-pressed={mode === 'forYou'}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            mode === 'forYou' ? 'bg-[#1A2225] text-[#FFF9E9] shadow-sm font-bold' : 'text-[#55615D] hover:text-[#1A2225] hover:bg-[#E8DFC6]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('feed.forYou')}</span>
        </button>
        <button
          type="button"
          onClick={() => onModeChange('following')}
          aria-pressed={mode === 'following'}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            mode === 'following' ? 'bg-[#1A2225] text-[#FFF9E9] shadow-sm font-bold' : 'text-[#55615D] hover:text-[#1A2225] hover:bg-[#E8DFC6]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{t('feed.following')}</span>
          {followingNewCount > 0 && (
            <span className={`ml-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${
              mode === 'following' ? 'bg-[#FFF9E9] text-[#1A2225]' : 'bg-[#1A2225] text-[#FFF9E9]'
            }`}>
              {followingNewCount}
            </span>
          )}
        </button>
      </div>

      {/* Right: Fits me, sort, price */}
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
          <ArrowDownUp className="w-3.5 h-3.5 text-[#55615D] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#55615D] text-[10px] pointer-events-none">▾</span>
        </label>

        <label className="relative shrink-0">
          <span className="text-[#55615D] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-xs font-bold">₱</span>
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
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#55615D] text-[10px] pointer-events-none">▾</span>
        </label>
      </div>
    </div>
  );
};
