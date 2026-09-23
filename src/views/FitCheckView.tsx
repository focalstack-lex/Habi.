import React from 'react';
import { FitCheckCard } from '../components/community/FitCheckCard';
import type { FitCheckPost } from '../types/fashion';
import { Camera } from 'lucide-react';

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
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 text-white p-8 sm:p-12 rounded-3xl border border-zinc-800/80 shadow-xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 backdrop-blur-md border border-white/15 rounded-full text-xs text-white">
          <Camera className="w-3.5 h-3.5 text-white" />
          <span className="font-semibold text-xs">Davao Community Feed</span>
        </div>

        <h1 className="font-outfit text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
          Davao Fit Check
        </h1>

        <p className="text-zinc-300 text-sm sm:text-base max-w-2xl font-sans leading-relaxed">
          See how local Davao fashion buyers and creators style their vintage finds, streetwear hoodies, and independent brand pieces in real life. Tap tag pins to discover where to buy each item.
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
