import React, { useCallback, useEffect, useState } from 'react';
import { CustomTagIcon, MapIcon, SavedIcon } from '../common/CustomIcons';
import { ArrowRight, MessageCircle, Trophy } from 'lucide-react';
import type { FitCheckPost, TaggedItem } from '../../types/fashion';
import { communityService } from '../../services/communityService';
import { useCommunityVersion } from '../../hooks/useCommunityVersion';
import { CommentsSheet } from './CommentsSheet';

interface FitCheckCardProps {
  post: FitCheckPost;
  onSelectSeller?: (sellerId: string) => void;
  onSelectProduct?: (productId: string) => void;
}

function initials(name: string): string {
  const letters = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase());
  return letters.join('') || '?';
}

export const FitCheckCard: React.FC<FitCheckCardProps> = ({
  post,
  onSelectSeller,
  onSelectProduct,
}) => {
  useCommunityVersion();
  const [activeTag, setActiveTag] = useState<TaggedItem | null>(null);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const hasLiked = communityService.hasLiked(post.id);
  const likes = communityService.getLikeCount(post);
  const commentCount = communityService.getCommentCount(post.id);
  const isOwnPost = communityService.isCustomPost(post.id);
  const challenge = post.challengeTag
    ? communityService.getAllChallenges().find((entry) => entry.tag === post.challengeTag)
    : undefined;

  // The delete confirmation quietly resets if the second tap never comes.
  useEffect(() => {
    if (!confirmDelete) return;
    const timer = window.setTimeout(() => setConfirmDelete(false), 4000);
    return () => window.clearTimeout(timer);
  }, [confirmDelete]);

  const closeComments = useCallback(() => setIsCommentsOpen(false), []);

  const handleLike = () => {
    communityService.toggleLike(post.id);
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    communityService.removePost(post.id);
  };

  return (
    <div className="bg-[#FFF9E9] border border-[#E6DCC0] rounded-2xl sm:rounded-3xl overflow-hidden font-sans space-y-3 sm:space-y-4 p-3 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Post Author Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {post.authorAvatar ? (
            <img
              src={post.authorAvatar}
              alt={post.authorName}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-[#E6DCC0] shrink-0"
            />
          ) : (
            <div
              aria-hidden="true"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1A2225] text-[#FFF9E9] text-xs font-bold flex items-center justify-center shrink-0"
            >
              {initials(post.authorName)}
            </div>
          )}
          <div className="min-w-0">
            <div className="font-outfit font-bold text-sm text-[#1A2225] truncate">{post.authorName}</div>
            <div className="text-xs text-[#55615D] font-sans truncate">@{post.authorHandle} • {post.location}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {challenge && (
            <span
              title="Style challenge entry"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-semibold"
            >
              <Trophy className="w-3 h-3" />
              <span>{challenge.title}</span>
            </span>
          )}
          <div className="hidden sm:flex items-center gap-1 text-xs text-[#55615D] font-sans bg-[#F3ECD8] px-3 py-1 rounded-full">
            <MapIcon className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{post.location}</span>
          </div>
        </div>
      </div>

      {/* Outfit Image with Interactive Tag Pins */}
      <div className="relative aspect-[3/4] bg-[#F3ECD8] rounded-2xl overflow-hidden border border-[#E6DCC0] group shadow-inner">
        <img src={post.imageUrl} alt={post.caption} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />

        {/* Tag Pins Overlay */}
        {post.taggedItems.map((tag) => (
          <div
            key={tag.id}
            style={{ left: `${tag.xPercentage}%`, top: `${tag.yPercentage}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
          >
            <button
              type="button"
              onClick={() => setActiveTag(activeTag?.id === tag.id ? null : tag)}
              className="w-8 h-8 bg-[#1A2225]/90 text-[#FFF9E9] rounded-full flex items-center justify-center border-2 border-[#FFF9E9] shadow-xl hover:scale-110 active:scale-95 transition-transform backdrop-blur-md cursor-pointer"
              aria-label="View tagged item"
            >
              <CustomTagIcon className="w-3.5 h-3.5" />
            </button>

            {/* Tag Popup Tooltip Card */}
            {activeTag?.id === tag.id && (
              <div className="absolute left-1/2 bottom-full mb-3 -translate-x-1/2 w-52 sm:w-60 bg-[#1A2225]/95 text-[#FFF9E9] p-4 rounded-2xl shadow-2xl z-20 space-y-2 border border-[#FFF9E9]/20 backdrop-blur-xl animate-in fade-in zoom-in-95">
                <div className="text-[11px] text-[#E0DFC8] font-medium">
                  Tagged piece from @{tag.sellerName}
                </div>
                <div className="font-outfit text-sm font-bold truncate text-[#FFF9E9]">{tag.itemTitle}</div>
                <div className="text-sm font-bold text-[#FFF9E9]">₱{tag.price.toLocaleString()}</div>
                <div className="space-y-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTag(null);
                      onSelectProduct?.(tag.productId);
                    }}
                    className="w-full py-2 bg-[#FFF9E9] text-[#1A2225] rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#F3ECD8] transition-colors shadow-sm cursor-pointer"
                  >
                    <span>View piece</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectSeller) onSelectSeller(tag.sellerId);
                    }}
                    className="w-full py-2 bg-[#FFF9E9]/10 text-[#FFF9E9] border border-[#FFF9E9]/15 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#FFF9E9]/20 transition-colors cursor-pointer"
                  >
                    <span>Visit Storefront</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Caption & Actions */}
      <div className="space-y-3">
        <p className="text-xs sm:text-sm text-[#1A2225]/80 font-sans leading-relaxed">
          {post.caption}
        </p>

        {/* Tagged Brands Chips */}
        {post.taggedItems.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs font-semibold text-[#55615D]">
              Pieces from:
            </span>
            {post.taggedItems.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => {
                  if (onSelectSeller) onSelectSeller(tag.sellerId);
                }}
                className="px-3 py-1 bg-[#F3ECD8] hover:bg-[#F3ECD8]/80 text-[#1A2225] text-xs font-medium rounded-full border border-[#E6DCC0] transition-colors cursor-pointer"
              >
                @{tag.sellerName}
              </button>
            ))}
          </div>
        )}

        {/* Like, Comment, Delete Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#E6DCC0] text-sm">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLike}
              aria-pressed={hasLiked}
              aria-label={hasLiked ? "Unlike outfit post" : "Like outfit post"}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all cursor-pointer ${
                hasLiked
                  ? 'bg-[#1A2225] text-[#FFF9E9] border-[#1A2225] font-semibold'
                  : 'bg-[#F3ECD8] text-[#1A2225] border-[#E6DCC0] hover:bg-[#F3ECD8]/80'
              }`}
            >
              <SavedIcon className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
              <span>{likes} Fit Checks</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCommentsOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border bg-[#F3ECD8] text-[#1A2225] border-[#E6DCC0] hover:bg-[#F3ECD8]/80 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{commentCount}</span>
              <span className="sr-only">comments</span>
            </button>
          </div>

          {isOwnPost && (
            <button
              type="button"
              onClick={handleDelete}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                confirmDelete ? 'text-red-600 bg-red-50' : 'text-[#55615D] hover:text-red-600'
              }`}
            >
              {confirmDelete ? 'Tap again to delete' : 'Delete'}
            </button>
          )}
        </div>
      </div>

      <CommentsSheet post={post} isOpen={isCommentsOpen} onClose={closeComments} />
    </div>
  );
};
