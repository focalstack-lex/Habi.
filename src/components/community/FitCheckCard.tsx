import React, { useState } from 'react';
import { Tag, Heart, MapPin, ArrowRight } from 'lucide-react';
import type { FitCheckPost, TaggedItem } from '../../types/fashion';

interface FitCheckCardProps {
  post: FitCheckPost;
  onSelectSeller?: (sellerId: string) => void;
  onSelectProduct?: (productId: string) => void;
}

export const FitCheckCard: React.FC<FitCheckCardProps> = ({
  post,
  onSelectSeller,
}) => {
  const [likes, setLikes] = useState<number>(post.likesCount);
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [activeTag, setActiveTag] = useState<TaggedItem | null>(null);

  const handleLike = () => {
    setLikes((prev) => (hasLiked ? prev - 1 : prev + 1));
    setHasLiked(!hasLiked);
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm font-sans space-y-4 p-5">
      {/* Post Author Header */}
      <div className="flex items-center justify-between font-mono">
        <div className="flex items-center gap-3">
          <img
            src={post.authorAvatar}
            alt={post.authorName}
            className="w-10 h-10 rounded-full object-cover border border-zinc-200"
          />
          <div>
            <div className="font-bold text-xs text-zinc-950">{post.authorName}</div>
            <div className="text-[11px] text-zinc-500">@{post.authorHandle} • {post.location}</div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-zinc-400">
          <MapPin className="w-3.5 h-3.5" />
          <span className="text-[11px]">{post.location}</span>
        </div>
      </div>

      {/* Outfit Image with Interactive Tag Pins */}
      <div className="relative aspect-[3/4] bg-zinc-100 rounded-2xl overflow-hidden border border-zinc-200 group">
        <img src={post.imageUrl} alt={post.caption} className="w-full h-full object-cover" />

        {/* Tag Pins Overlay */}
        {post.taggedItems.map((tag) => (
          <div
            key={tag.id}
            style={{ left: `${tag.xPercentage}%`, top: `${tag.yPercentage}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
          >
            <button
              onClick={() => setActiveTag(activeTag?.id === tag.id ? null : tag)}
              className="w-7 h-7 bg-zinc-950/90 text-white rounded-full flex items-center justify-center shadow-lg border border-white hover:scale-110 transition-transform animate-pulse"
              aria-label="View tagged item"
            >
              <Tag className="w-3.5 h-3.5" />
            </button>

            {/* Tag Popup Tooltip Card */}
            {activeTag?.id === tag.id && (
              <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-56 bg-zinc-950 text-white p-3 rounded-2xl shadow-2xl z-20 font-mono space-y-1.5 border border-zinc-700">
                <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
                  Tagged Item from @{tag.sellerName}
                </div>
                <div className="text-xs font-bold truncate text-white">{tag.itemTitle}</div>
                <div className="text-xs font-black text-white">₱{tag.price.toLocaleString()}</div>
                <button
                  onClick={() => {
                    if (onSelectSeller) onSelectSeller(tag.sellerId);
                  }}
                  className="w-full mt-1 py-1.5 bg-white text-zinc-950 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 hover:bg-zinc-200 transition-colors"
                >
                  <span>Visit Storefront</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Caption & Actions */}
      <div className="space-y-2 font-mono">
        <p className="text-xs text-zinc-800 font-sans leading-relaxed">
          {post.caption}
        </p>

        {/* Tagged Brands Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
            Pieces from:
          </span>
          {post.taggedItems.map((tag) => (
            <button
              key={tag.id}
              onClick={() => {
                if (onSelectSeller) onSelectSeller(tag.sellerId);
              }}
              className="px-2.5 py-0.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-[10px] font-bold rounded-full border border-zinc-200 transition-colors"
            >
              @{tag.sellerName}
            </button>
          ))}
        </div>

        {/* Like Action Row */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-xs">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 transition-colors ${
              hasLiked ? 'text-zinc-950 font-bold' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
            <span>{likes} Fit Checks</span>
          </button>
        </div>
      </div>
    </div>
  );
};
