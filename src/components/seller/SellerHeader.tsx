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

  const handleFollowToggle = () => {
    const updated = storageService.toggleFollowSeller(seller.id);
    setIsFollowed(updated);
    setFollowerCount((prev) => (updated ? prev - 1 : prev + 1));
  };

  const handleBookmarkToggle = () => {
    setIsBookmarked((prev) => !prev);
  };

  return (
    <div className="bg-white border border-zinc-200/80 rounded-2xl sm:rounded-3xl lg:rounded-[32px] overflow-hidden mb-6 sm:mb-8 font-sans shadow-sm hover:shadow-md transition-shadow duration-300 max-w-full">
      {/* Cover Banner with Misty Gradient Overlay & Bookmark Button */}
      <div className="h-44 sm:h-56 md:h-72 relative bg-zinc-950 overflow-hidden">
        <img
          src={seller.coverUrl}
          alt={seller.name}
          className="w-full h-full object-cover opacity-90 transition-transform duration-700 hover:scale-105"
        />

        {/* Top subtle dark gradient for bookmark visibility */}
        <div className="absolute inset-x-0 top-0 h-16 sm:h-20 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />

        {/* Bottom smooth misty gradient fade transitioning into solid card background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/70 via-65% to-white pointer-events-none" />

        {/* Floating Bookmark Button (Top-Right) */}
        <button
          onClick={handleBookmarkToggle}
          aria-label="Save seller profile"
          className={`absolute top-3 right-3 sm:top-5 sm:right-5 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-md border cursor-pointer ${
            isBookmarked
              ? 'bg-zinc-950 text-white border-zinc-950 shadow-md scale-105'
              : 'bg-white/85 text-zinc-700 border-white/70 hover:bg-white hover:text-zinc-950 shadow-sm hover:scale-105'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isBookmarked ? 'fill-white' : ''}`} />
        </button>
      </div>

      {/* Main Profile Info Section */}
      <div className="px-4 sm:px-8 lg:px-10 pb-6 sm:pb-8 relative z-10 -mt-12 sm:-mt-16 lg:-mt-20">
        {/* Avatar Circle */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full border-3 sm:border-4 border-white shadow-xl overflow-hidden bg-zinc-950 shrink-0 mb-3 sm:mb-4 lg:mb-5">
          <img
            src={seller.logoUrl}
            alt={seller.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Name, Bio, Metadata, and Tools/Tags */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6">
          {/* Left Column: Name & Description */}
          <div className="space-y-1.5 sm:space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <h1 className="font-outfit text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-zinc-950 tracking-tight leading-tight">
                {seller.name}
              </h1>
              <span className="text-xs text-zinc-400 font-mono shrink-0">@{seller.handle}</span>
            </div>

            <p className="text-zinc-600 text-xs sm:text-sm md:text-base font-normal leading-relaxed">
              {seller.description}
            </p>

            {/* Micro Metadata Line with Icons */}
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

          {/* Right Column: Category Badges & Social Links */}
          <div className="flex flex-wrap lg:flex-col items-center sm:items-start lg:items-end justify-between sm:justify-start gap-2.5 shrink-0 pt-1 lg:pt-0 border-t border-zinc-100 sm:border-none pt-3 sm:pt-0">
            {/* Category Chips / Aesthetics */}
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
              {seller.aesthetics && seller.aesthetics.slice(0, 2).map((aes) => (
                <span
                  key={aes}
                  className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-zinc-50 text-zinc-600 text-[11px] sm:text-xs font-medium border border-zinc-200/50 hidden xs:inline-block"
                >
                  {aes}
                </span>
              ))}
            </div>

            {/* Social Links & Web */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider mr-0.5">
                Connect
              </span>
              {seller.socialLinks.instagram && (
                <a
                  href={seller.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-100 text-zinc-700 hover:bg-zinc-950 hover:text-white transition-colors flex items-center justify-center border border-zinc-200/80 shadow-2xs cursor-pointer"
                  aria-label="Instagram"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}
              {seller.socialLinks.facebook && (
                <a
                  href={seller.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-100 text-zinc-700 hover:bg-zinc-950 hover:text-white transition-colors flex items-center justify-center border border-zinc-200/80 shadow-2xs cursor-pointer"
                  aria-label="Facebook"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z"/>
                  </svg>
                </a>
              )}
              <a
                href="#store-info"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-100 text-zinc-700 hover:bg-zinc-950 hover:text-white transition-colors flex items-center justify-center border border-zinc-200/80 shadow-2xs cursor-pointer"
                aria-label="Website"
              >
                <Globe className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Divider & Bottom Section (Stats + Primary Actions) */}
        <div className="border-t border-zinc-100 mt-5 sm:mt-8 pt-4 sm:pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
          {/* Stats Section with Hairline Vertical Dividers */}
          <div className="grid grid-cols-3 sm:flex items-center gap-2 sm:gap-8 bg-zinc-50/70 sm:bg-transparent p-2.5 sm:p-0 rounded-2xl sm:rounded-none border border-zinc-100/90 sm:border-none divide-x divide-zinc-200/60 sm:divide-x-0 text-center sm:text-left">
            {/* Metric 1: Rating */}
            <div className="space-y-0.5 px-1 sm:px-0">
              <div className="flex items-center justify-center sm:justify-start gap-1 font-bold text-zinc-950 text-sm sm:text-base lg:text-lg tracking-tight">
                <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400 shrink-0" />
                <span>4.9</span>
              </div>
              <span className="text-[10px] sm:text-xs text-zinc-400 font-medium lowercase tracking-wide block">
                rating
              </span>
            </div>

            {/* Vertical Divider (Desktop) */}
            <div className="hidden sm:block h-8 w-px bg-zinc-200/80" />

            {/* Metric 2: Followers */}
            <div className="space-y-0.5 px-1 sm:px-0">
              <div className="font-bold text-zinc-950 text-sm sm:text-base lg:text-lg tracking-tight">
                {followerCount.toLocaleString()}
              </div>
              <span className="text-[10px] sm:text-xs text-zinc-400 font-medium lowercase tracking-wide block">
                followers
              </span>
            </div>

            {/* Vertical Divider (Desktop) */}
            <div className="hidden sm:block h-8 w-px bg-zinc-200/80" />

            {/* Metric 3: Store Views */}
            <div className="space-y-0.5 px-1 sm:px-0">
              <div className="font-bold text-zinc-950 text-sm sm:text-base lg:text-lg tracking-tight">
                {seller.viewCount.toLocaleString()}
              </div>
              <span className="text-[10px] sm:text-xs text-zinc-400 font-medium lowercase tracking-wide block">
                store views
              </span>
            </div>
          </div>

          {/* Action Buttons: Primary Follow CTA + Secondary Message CTA */}
          <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowContactModal((prev) => !prev)}
              className="flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200 text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 border border-zinc-200/80 cursor-pointer shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-700" />
              <span>Get in touch</span>
            </button>

            <button
              onClick={handleFollowToggle}
              className={`flex-1 sm:flex-initial px-5 sm:px-7 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer shrink-0 ${
                isFollowed
                  ? 'bg-zinc-100 text-zinc-900 border border-zinc-200 hover:bg-zinc-200'
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

        {/* Contact Toast / Popover when 'Get in touch' is clicked */}
        {showContactModal && (
          <div className="mt-4 p-3.5 sm:p-4 rounded-2xl bg-zinc-900 text-white flex items-center justify-between text-xs sm:text-sm shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span>
                Contacting <strong>{seller.name}</strong>. Visit store in {seller.location.district}, {seller.location.city} or send direct message.
              </span>
            </div>
            <button
              onClick={() => setShowContactModal(false)}
              className="px-3 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 transition-colors cursor-pointer shrink-0 ml-2"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

