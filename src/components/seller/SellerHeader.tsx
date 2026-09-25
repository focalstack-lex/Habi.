import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  Globe,
  MessageCircle,
  UserPlus,
  UserCheck,
  Bookmark,
  Briefcase,
  Star,
  Sparkles,
} from 'lucide-react';
import type { Seller } from '../../types/fashion';
import { storageService } from '../../services/storageService';
import { catalogService } from '../../services/catalogService';
import { accentFillStyle, accentRingStyle, resolveSellerTheme } from './theme';

interface SellerHeaderProps {
  seller: Seller;
}

export const SellerHeader: React.FC<SellerHeaderProps> = ({ seller }) => {
  const [isFollowed, setIsFollowed] = useState<boolean>(() =>
    storageService.isSellerFollowed(seller.id)
  );
  const [followerCount, setFollowerCount] = useState<number>(seller.followerCount);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [showContactModal, setShowContactModal] = useState<boolean>(false);
  const theme = resolveSellerTheme(seller);
  const isMinimal = theme.layout === 'minimal';
  const isSplit = theme.layout === 'split';
  const storeViews = seller.viewCount + catalogService.getSellerViews(seller.id);

  const handleFollowToggle = () => {
    const updated = storageService.toggleFollowSeller(seller.id);
    setIsFollowed(updated);
    setFollowerCount((prev) => (updated ? prev + 1 : Math.max(0, prev - 1)));
  };

  const handleBookmarkToggle = () => {
    setIsBookmarked((prev) => !prev);
  };

  const followFill = isFollowed ? undefined : accentFillStyle(theme);

  const bookmarkButton = (
    <button
      type="button"
      onClick={handleBookmarkToggle}
      aria-label="Save seller profile"
      aria-pressed={isBookmarked}
      className={`absolute top-3 right-3 sm:top-5 sm:right-5 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-md border cursor-pointer ${
        isBookmarked
          ? 'bg-zinc-950 text-white border-zinc-950 shadow-md scale-105'
          : 'bg-white/85 text-zinc-700 border-white/70 hover:bg-white hover:text-zinc-950 shadow-sm hover:scale-105'
      }`}
    >
      <Bookmark className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isBookmarked ? 'fill-white' : ''}`} />
    </button>
  );

  const avatar = (sizeClass: string) => (
    <div
      className={`${sizeClass} rounded-full border-4 border-white overflow-hidden bg-zinc-950 shadow-xl shrink-0`}
      style={accentRingStyle(theme)}
    >
      <img src={seller.logoUrl} alt={seller.name} className="w-full h-full object-cover" />
    </div>
  );

  // Name, bio and metadata line
  const identity = (
    <div className="min-w-0 space-y-1.5 sm:space-y-2 max-w-2xl">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <h1
          className={`font-cooper font-bold text-zinc-950 tracking-tight leading-tight break-words ${
            isMinimal ? 'text-xl sm:text-3xl lg:text-4xl' : 'text-2xl sm:text-3xl lg:text-4xl'
          }`}
        >
          {seller.name}
        </h1>
        <span className="text-xs text-zinc-400 font-mono shrink-0">@{seller.handle}</span>
      </div>

      <p className="text-zinc-600 text-xs sm:text-sm lg:text-base leading-relaxed">
        {seller.description}
      </p>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-sm text-zinc-500 font-medium pt-0.5 sm:pt-1">
        <div className="flex items-center gap-1.5 text-zinc-700">
          <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400 shrink-0" />
          <span>{seller.verificationStatus}</span>
        </div>

        <span className="text-zinc-300">•</span>

        <div className="flex items-center gap-1.5 text-zinc-700">
          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400 shrink-0" />
          <span>
            {seller.location.district}, {seller.location.city}
          </span>
        </div>

        {seller.location.openingHours && (
          <>
            <span className="text-zinc-300 hidden xs:inline">•</span>
            <div className="flex items-center gap-1.5 text-zinc-600 w-full xs:w-auto mt-0.5 xs:mt-0">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400 shrink-0" />
              <span>{seller.location.openingHours}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const socialLinkClass =
    'w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-100 text-zinc-700 hover:bg-zinc-950 hover:text-white transition-colors flex items-center justify-center border border-zinc-200/80 shadow-2xs cursor-pointer';

  // Category chips, aesthetics and social links
  const tagsAndSocial = (
    <div
      className={`flex flex-wrap items-center sm:items-start justify-between sm:justify-start gap-2.5 shrink-0 border-t border-zinc-100 sm:border-none pt-3 sm:pt-0 ${
        isSplit ? '' : 'lg:flex-col lg:items-end'
      }`}
    >
      <div className="flex items-center gap-1.5 flex-wrap">
        {seller.categories && seller.categories.length > 0 ? (
          seller.categories.map((cat) => (
            <span
              key={cat}
              className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-zinc-100 text-zinc-700 text-[11px] sm:text-xs font-medium border border-zinc-200/70"
            >
              {cat}
            </span>
          ))
        ) : (
          <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-zinc-100 text-zinc-700 text-[11px] sm:text-xs font-medium border border-zinc-200/70">
            Curated Archive
          </span>
        )}
        {seller.aesthetics &&
          seller.aesthetics.slice(0, 2).map((aes) => (
            <span
              key={aes}
              className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-zinc-50 text-zinc-600 text-[11px] sm:text-xs font-medium border border-zinc-200/50 hidden xs:inline-block"
            >
              {aes}
            </span>
          ))}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider mr-0.5">
          Connect
        </span>
        {seller.socialLinks.instagram && (
          <a
            href={seller.socialLinks.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className={socialLinkClass}
            aria-label="Instagram"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>
        )}
        {seller.socialLinks.facebook && (
          <a
            href={seller.socialLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className={socialLinkClass}
            aria-label="Facebook"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z" />
            </svg>
          </a>
        )}
        <a href="#store-info" className={socialLinkClass} aria-label="Website">
          <Globe className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );

  // Stats row plus Follow and Get in touch actions
  const statsAndActions = (
    <div className="border-t border-zinc-100 mt-5 sm:mt-8 pt-4 sm:pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
      <div className="grid grid-cols-3 sm:flex items-center gap-2 sm:gap-8 bg-zinc-50/70 sm:bg-transparent p-2.5 sm:p-0 rounded-2xl sm:rounded-none border border-zinc-100/90 sm:border-none divide-x divide-zinc-200/60 sm:divide-x-0 text-center sm:text-left">
        <div className="space-y-0.5 px-1 sm:px-0">
          <div className="flex items-center justify-center sm:justify-start gap-1 font-bold text-zinc-950 text-sm sm:text-base lg:text-lg tracking-tight">
            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400 shrink-0" />
            <span>4.9</span>
          </div>
          <span className="text-[10px] sm:text-xs text-zinc-400 font-medium lowercase tracking-wide block">
            rating
          </span>
        </div>

        <div className="hidden sm:block h-8 w-px bg-zinc-200/80" />

        <div className="space-y-0.5 px-1 sm:px-0">
          <div className="font-bold text-zinc-950 text-sm sm:text-base lg:text-lg tracking-tight">
            {followerCount.toLocaleString()}
          </div>
          <span className="text-[10px] sm:text-xs text-zinc-400 font-medium lowercase tracking-wide block">
            followers
          </span>
        </div>

        <div className="hidden sm:block h-8 w-px bg-zinc-200/80" />

        <div className="space-y-0.5 px-1 sm:px-0">
          <div className="font-bold text-zinc-950 text-sm sm:text-base lg:text-lg tracking-tight">
            {storeViews.toLocaleString()}
          </div>
          <span className="text-[10px] sm:text-xs text-zinc-400 font-medium lowercase tracking-wide block">
            store views
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
        <button
          type="button"
          onClick={() => setShowContactModal((prev) => !prev)}
          className="flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200 text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 border border-zinc-200/80 cursor-pointer shrink-0"
        >
          <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-700" />
          <span>Get in touch</span>
        </button>

        <button
          type="button"
          onClick={handleFollowToggle}
          style={followFill}
          className={`flex-1 sm:flex-initial px-5 sm:px-7 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer shrink-0 ${
            isFollowed
              ? 'bg-zinc-100 text-zinc-900 border border-zinc-200 hover:bg-zinc-200'
              : followFill
              ? 'hover:opacity-90'
              : 'bg-zinc-950 text-white hover:bg-zinc-800 hover:shadow-md'
          }`}
        >
          {isFollowed ? (
            <>
              <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Following</span>
            </>
          ) : (
            <>
              <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Follow Seller</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  const contactToast = showContactModal && (
    <div className="mt-4 p-3.5 sm:p-4 rounded-2xl bg-zinc-900 text-white flex items-center justify-between text-xs sm:text-sm shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center gap-2.5 sm:gap-3">
        <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
        <span>
          Contacting <strong>{seller.name}</strong>. Visit store in {seller.location.district},{' '}
          {seller.location.city} or send direct message.
        </span>
      </div>
      <button
        type="button"
        onClick={() => setShowContactModal(false)}
        className="px-3 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 transition-colors cursor-pointer shrink-0 ml-2"
      >
        Dismiss
      </button>
    </div>
  );

  // fadeToCard: misty fade into the card body, used when the avatar overlaps the cover
  const cover = (className: string, fadeToCard: boolean) => (
    <div className={`relative bg-zinc-950 overflow-hidden ${className}`}>
      <img
        src={seller.coverUrl}
        alt={seller.name}
        className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-700 hover:scale-105"
      />
      <div className="absolute inset-x-0 top-0 h-16 sm:h-20 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
      {fadeToCard ? (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/70 via-65% to-white pointer-events-none" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
      )}
    </div>
  );

  // Name/bio column beside chips and social links
  const details = (
    <div
      className={`flex flex-col ${isSplit ? '' : 'lg:flex-row lg:items-end'} justify-between gap-4 sm:gap-6`}
    >
      {identity}
      {tagsAndSocial}
    </div>
  );

  return (
    <div className="relative bg-white border border-zinc-200/80 rounded-2xl sm:rounded-3xl lg:rounded-[32px] overflow-hidden mb-5 sm:mb-8 font-sans shadow-sm hover:shadow-md transition-shadow duration-300 max-w-full">
      {bookmarkButton}

      {theme.layout === 'banner' && (
        <>
          {cover('h-44 sm:h-56 md:h-72', true)}
          <div className="px-4 sm:px-8 lg:px-10 pb-6 sm:pb-8 relative z-10 -mt-12 sm:-mt-16 lg:-mt-20">
            <div className="mb-3 sm:mb-4 lg:mb-5">{avatar('w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24')}</div>
            {details}
            {statsAndActions}
            {contactToast}
          </div>
        </>
      )}

      {isMinimal && (
        <div className="px-4 sm:px-8 lg:px-10 pt-4 sm:pt-6 pb-6 sm:pb-8">
          <div className="flex items-start gap-3 sm:gap-5 pr-12">
            {avatar('w-16 h-16 sm:w-20 sm:h-20')}
            <div className="flex-1 min-w-0">{details}</div>
          </div>
          {statsAndActions}
          {contactToast}
        </div>
      )}

      {isSplit && (
        <div className="sm:flex sm:items-stretch">
          {cover('h-36 sm:h-auto sm:w-2/5 sm:min-h-[300px] shrink-0', false)}
          <div className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 pb-5 sm:pb-6 sm:pt-6 relative">
            <div className="-mt-12 sm:mt-0 mb-3 sm:mb-4">{avatar('w-24 h-24 lg:w-28 lg:h-28')}</div>
            {details}
            {statsAndActions}
            {contactToast}
          </div>
        </div>
      )}
    </div>
  );
};
