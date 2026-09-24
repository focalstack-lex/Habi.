import React, { useState } from 'react';
import { CustomTagIcon, MapIcon, SavedIcon } from '../common/CustomIcons';
import { ArrowRight } from 'lucide-react';
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
    <div className="bg-[#FFFFCC] border border-[#E1E6B6] rounded-3xl overflow-hidden font-sans space-y-4 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Post Author Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={post.authorAvatar}
            alt={post.authorName}
            className="w-10 h-10 rounded-full object-cover border border-[#E1E6B6]"
          />
          <div>
            <div className="font-outfit font-bold text-sm text-[#1A1A00]">{post.authorName}</div>
            <div className="text-xs text-[#565C38] font-sans">@{post.authorHandle} • {post.location}</div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-[#565C38] font-sans bg-[#EFF2D2] px-3 py-1 rounded-full">
          <MapIcon className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">{post.location}</span>
        </div>
      </div>

      {/* Outfit Image with Interactive Tag Pins */}
      <div className="relative aspect-[3/4] bg-[#EFF2D2] rounded-2xl overflow-hidden border border-[#E1E6B6] group shadow-inner">
        <img src={post.imageUrl} alt={post.caption} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />

        {/* Tag Pins Overlay */}
        {post.taggedItems.map((tag) => (
          <div
            key={tag.id}
            style={{ left: `${tag.xPercentage}%`, top: `${tag.yPercentage}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
          >
            <button
              onClick={() => setActiveTag(activeTag?.id === tag.id ? null : tag)}
              className="w-8 h-8 bg-[#1A1A00]/90 text-[#FFFFCC] rounded-full flex items-center justify-center border-2 border-[#FFFFCC] shadow-xl hover:scale-110 active:scale-95 transition-transform backdrop-blur-md cursor-pointer"
              aria-label="View tagged item"
            >
              <CustomTagIcon className="w-3.5 h-3.5" />
            </button>

            {/* Tag Popup Tooltip Card */}
            {activeTag?.id === tag.id && (
              <div className="absolute left-1/2 bottom-full mb-3 -translate-x-1/2 w-60 bg-[#1A1A00]/95 text-[#FFFFCC] p-4 rounded-2xl shadow-2xl z-20 space-y-2 border border-[#FFFFCC]/20 backdrop-blur-xl animate-in fade-in zoom-in-95">
                <div className="text-[11px] text-[#DCE2B8] font-medium">
                  Tagged piece from @{tag.sellerName}
                </div>
                <div className="font-outfit text-sm font-bold truncate text-[#FFFFCC]">{tag.itemTitle}</div>
                <div className="text-sm font-bold text-[#FFFFCC]">₱{tag.price.toLocaleString()}</div>
                <button
                  onClick={() => {
                    if (onSelectSeller) onSelectSeller(tag.sellerId);
                  }}
                  className="w-full mt-2 py-2 bg-[#FFFFCC] text-[#1A1A00] rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#EFF2D2] transition-colors shadow-sm cursor-pointer"
                >
                  <span>Visit Storefront</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Caption & Actions */}
      <div className="space-y-3">
        <p className="text-sm text-[#1A1A00]/80 font-sans leading-relaxed">
          {post.caption}
        </p>

        {/* Tagged Brands Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs font-semibold text-[#565C38]">
            Pieces from:
          </span>
          {post.taggedItems.map((tag) => (
            <button
              key={tag.id}
              onClick={() => {
                if (onSelectSeller) onSelectSeller(tag.sellerId);
              }}
              className="px-3 py-1 bg-[#EFF2D2] hover:bg-[#EFF2D2]/80 text-[#1A1A00] text-xs font-medium rounded-full border border-[#E1E6B6] transition-colors cursor-pointer"
            >
              @{tag.sellerName}
            </button>
          ))}
        </div>

        {/* Like Action Row */}
        <div className="flex items-center justify-between pt-3 border-t border-[#E1E6B6] text-sm">
          <button
            onClick={handleLike}
            aria-label={hasLiked ? "Unlike outfit post" : "Like outfit post"}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all cursor-pointer ${
              hasLiked
                ? 'bg-[#1A1A00] text-[#FFFFCC] border-[#1A1A00] font-semibold'
                : 'bg-[#EFF2D2] text-[#1A1A00] border-[#E1E6B6] hover:bg-[#EFF2D2]/80'
            }`}
          >
            <SavedIcon className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
            <span>{likes} Fit Checks</span>
          </button>
        </div>
      </div>
    </div>
  );
};
