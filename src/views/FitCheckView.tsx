import React from 'react';
import { FitCheckCard } from '../components/community/FitCheckCard';
import type { FitCheckPost } from '../types/fashion';

interface FitCheckViewProps {
  posts: FitCheckPost[];
  onSelectSeller?: (sellerId: string) => void;
  onSelectProduct?: (productId: string) => void;
}

export const FitCheckView: React.FC<FitCheckViewProps> = ({
  posts,
  onSelectSeller,
  onSelectProduct,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-[#1A2225] text-[#FFF9E9] p-6 sm:p-8 md:p-10 rounded-3xl border border-[#1A2225]/20 shadow-xl space-y-3">
        <div className="font-avantgarde text-[11px] tracking-widest uppercase text-[#E0DFC8] font-semibold">
          DAVAO COMMUNITY FEED
        </div>

        <h1 className="font-outfit text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
          Davao Fit Check
        </h1>

        <p className="text-[#E0DFC8] text-sm sm:text-base max-w-2xl font-sans leading-relaxed">
          Real-life styling from Davao creators. Tap tag pins to shop exact pieces.
        </p>
      </div>

      {/* Outfit Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {posts.map((post) => (
          <FitCheckCard
            key={post.id}
            post={post}
            onSelectSeller={onSelectSeller}
            onSelectProduct={onSelectProduct}
          />
        ))}
      </div>
    </div>
  );
};
