import React, { useCallback, useState } from 'react';
import { Camera } from 'lucide-react';
import { FitCheckCard } from '../components/community/FitCheckCard';
import { ChallengeBanner } from '../components/community/ChallengeBanner';
import { NewFitCheckSheet } from '../components/community/NewFitCheckSheet';
import { Button } from '../components/common/FormControls';
import { communityService } from '../services/communityService';
import { useCommunityVersion } from '../hooks/useCommunityVersion';
import type { FitCheckPost } from '../types/fashion';

type FeedFilter = 'all' | 'challenge';

const FILTERS: { id: FeedFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'challenge', label: "This week's challenge" },
];

interface FitCheckViewProps {
  /** Kept for API compatibility; the feed reads live posts from communityService. */
  posts: FitCheckPost[];
  onSelectSeller?: (sellerId: string) => void;
  onSelectProduct?: (productId: string) => void;
}

interface SheetState {
  isOpen: boolean;
  challengeTag?: string;
}

export const FitCheckView: React.FC<FitCheckViewProps> = ({
  onSelectSeller,
  onSelectProduct,
}) => {
  useCommunityVersion();
  const [filter, setFilter] = useState<FeedFilter>('all');
  const [sheet, setSheet] = useState<SheetState>({ isOpen: false });

  const challenge = communityService.getCurrentChallenge();
  const allPosts = communityService.getPosts();
  const posts = filter === 'challenge' ? allPosts.filter((post) => post.challengeTag === challenge.tag) : allPosts;

  const openSheet = (challengeTag?: string) => setSheet({ isOpen: true, challengeTag });
  const closeSheet = useCallback(() => setSheet({ isOpen: false }), []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 font-sans space-y-4 sm:space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 text-white p-5 sm:p-8 lg:p-12 rounded-2xl sm:rounded-3xl border border-zinc-800/80 shadow-xl space-y-2 sm:space-y-3">
        <div className="font-avantgarde text-[11px] tracking-widest uppercase text-zinc-400 font-semibold">
          DAVAO COMMUNITY FEED
        </div>

        <h1 className="font-outfit text-2xl sm:text-3xl lg:text-5xl font-bold tracking-tight">
          Davao Fit Check
        </h1>

        <p className="text-zinc-300 text-xs sm:text-sm lg:text-base max-w-2xl font-sans leading-relaxed">
          See how local Davao fashion buyers and creators style their vintage finds, streetwear hoodies, and independent brand pieces in real life. Tap tag pins to discover where to buy each item.
        </p>

        <div className="pt-1 sm:pt-2">
          <Button type="button" variant="inverse" onClick={() => openSheet()}>
            <Camera className="w-4 h-4" />
            Post a fit check
          </Button>
        </div>
      </div>

      <ChallengeBanner onJoin={() => openSheet(challenge.tag)} />

      {/* Filter chips */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none" role="tablist" aria-label="Filter fit checks">
        {FILTERS.map((option) => {
          const isActive = option.id === filter;
          return (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setFilter(option.id)}
              className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-full border text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-zinc-950 text-white border-zinc-950'
                  : 'bg-white text-zinc-700 border-zinc-200/80 hover:bg-zinc-100'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {/* Outfit Feed Grid */}
      {posts.length === 0 ? (
        <div className="bg-white border border-zinc-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center space-y-3">
          <div className="font-cooper font-bold text-base sm:text-lg text-zinc-950">
            {filter === 'challenge' ? 'No entries yet. Be the first.' : 'No fit checks yet.'}
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
            {filter === 'challenge'
              ? `${challenge.title}: ${challenge.prompt}`
              : 'Share how you style your Davao finds and tag where each piece came from.'}
          </p>
          <Button type="button" onClick={() => openSheet(filter === 'challenge' ? challenge.tag : undefined)}>
            <Camera className="w-4 h-4" />
            {filter === 'challenge' ? 'Join challenge' : 'Post a fit check'}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
          {posts.map((post) => (
            <FitCheckCard
              key={post.id}
              post={post}
              onSelectSeller={onSelectSeller}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </div>
      )}

      {/* Floating compose button, above the phone tab bar */}
      <button
        type="button"
        onClick={() => openSheet()}
        aria-label="Post a fit check"
        className="fixed bottom-24 right-4 lg:bottom-8 lg:right-8 z-30 w-12 h-12 rounded-full bg-zinc-950 text-white shadow-2xl flex items-center justify-center hover:bg-zinc-800 active:scale-95 transition-all"
      >
        <Camera className="w-5 h-5" />
      </button>

      <NewFitCheckSheet isOpen={sheet.isOpen} onClose={closeSheet} challengeTag={sheet.challengeTag} />
    </div>
  );
};
