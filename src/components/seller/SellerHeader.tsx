import React, { useState } from 'react';
import { ShieldCheck, MapPin, Clock, Globe, MessageCircle, UserPlus, UserCheck } from 'lucide-react';
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

  const handleFollowToggle = () => {
    const updated = storageService.toggleFollowSeller(seller.id);
    setIsFollowed(updated);
    setFollowerCount((prev) => (updated ? prev - 1 : prev + 1));
  };

  return (
    <div className="bg-white border border-zinc-200/80 rounded-3xl overflow-hidden mb-8 font-sans shadow-sm">
      {/* Cover Banner */}
      <div className="h-56 sm:h-72 relative bg-zinc-950 overflow-hidden">
        <img
          src={seller.coverUrl}
          alt={seller.name}
          className="w-full h-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* Profile Details Header Container */}
      <div className="px-6 sm:px-10 pb-8 relative -mt-16 sm:-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-zinc-100">
          {/* Avatar & Title */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-5">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white overflow-hidden bg-zinc-950 shadow-xl shrink-0">
              <img
                src={seller.logoUrl}
                alt={seller.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-outfit text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-950 tracking-tight">
                  {seller.name}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-950 text-white rounded-full text-xs font-semibold shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                  <span>{seller.verificationStatus}</span>
                </span>
              </div>

              <div className="text-xs sm:text-sm text-zinc-500 font-sans">
                @{seller.handle} • {seller.location.district}, {seller.location.city}
              </div>
            </div>
          </div>

          {/* Follow Button */}
          <button
            onClick={handleFollowToggle}
            className={`px-7 py-3 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-sm ${
              isFollowed
                ? 'bg-zinc-100 text-zinc-950 border border-zinc-200 hover:bg-zinc-200'
                : 'bg-zinc-950 text-white hover:bg-zinc-800'
            }`}
          >
            {isFollowed ? (
              <>
                <UserCheck className="w-4 h-4" />
                <span>Following Brand</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Follow Seller</span>
              </>
            )}
          </button>
        </div>

        {/* Bio & Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-6 text-sm">
          <div className="md:col-span-8 space-y-4">
            <p className="text-zinc-600 font-sans text-sm sm:text-base leading-relaxed">
              {seller.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-zinc-500 pt-2">
              <span className="font-bold text-zinc-950 text-base">
                {followerCount.toLocaleString()}{' '}
                <span className="font-normal text-zinc-500 text-sm">Followers</span>
              </span>
              <span>•</span>
              <span className="font-bold text-zinc-950 text-base">
                {seller.viewCount.toLocaleString()}{' '}
                <span className="font-normal text-zinc-500 text-sm">Store Views</span>
              </span>
            </div>
          </div>

          {/* Store Info Container */}
          <div className="md:col-span-4 bg-zinc-50 border border-zinc-200/80 p-5 rounded-2xl space-y-3">
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Store Information
            </div>

            <div className="flex items-center gap-2 text-zinc-900 font-medium text-sm">
              <MapPin className="w-4 h-4 text-zinc-950 shrink-0" />
              <span>{seller.location.city} ({seller.location.district})</span>
            </div>

            {seller.location.openingHours && (
              <div className="flex items-center gap-2 text-zinc-600 text-xs">
                <Clock className="w-4 h-4 text-zinc-500 shrink-0" />
                <span>{seller.location.openingHours}</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-3 border-t border-zinc-200/80">
              {seller.socialLinks.instagram && (
                <a
                  href={seller.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-white border border-zinc-200 rounded-full text-zinc-900 hover:bg-zinc-950 hover:text-white transition-colors shadow-sm"
                  aria-label="Instagram"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
              {seller.socialLinks.facebook && (
                <a
                  href={seller.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-white border border-zinc-200 rounded-full text-zinc-900 hover:bg-zinc-950 hover:text-white transition-colors shadow-sm"
                  aria-label="Facebook"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
