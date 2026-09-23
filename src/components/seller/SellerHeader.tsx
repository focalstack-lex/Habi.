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
    setFollowerCount((prev) => (updated ? prev + 1 : prev - 1));
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-none overflow-hidden mb-8 font-sans">
      {/* Cover Banner */}
      <div className="h-56 sm:h-72 relative bg-zinc-950 overflow-hidden border-b border-zinc-200">
        <img
          src={seller.coverUrl}
          alt={seller.name}
          className="w-full h-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* Profile Details Header Container */}
      <div className="px-6 sm:px-10 pb-10 relative -mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-zinc-200">
          {/* Avatar & Title */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-6">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-none border-4 border-white overflow-hidden bg-zinc-950 shadow-xl shrink-0">
              <img
                src={seller.logoUrl}
                alt={seller.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-1.5 font-mono">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-syne text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight uppercase">
                  {seller.name}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-950 text-white font-mono text-[10px] uppercase font-bold tracking-[0.15em] border border-zinc-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                  <span>{seller.verificationStatus}</span>
                </span>
              </div>

              <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
                @{seller.handle} • {seller.location.district}, {seller.location.city}
              </div>
            </div>
          </div>

          {/* Follow Button */}
          <button
            onClick={handleFollowToggle}
            className={`px-8 py-3.5 rounded-none text-xs font-mono font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
              isFollowed
                ? 'bg-zinc-100 text-zinc-950 border border-zinc-300 hover:bg-zinc-200'
                : 'bg-zinc-950 text-white hover:bg-zinc-800'
            }`}
          >
            {isFollowed ? (
              <>
                <UserCheck className="w-4 h-4" />
                <span>FOLLOWING BRAND</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>FOLLOW SELLER</span>
              </>
            )}
          </button>
        </div>

        {/* Bio & Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-8 font-mono text-xs">
          <div className="md:col-span-8 space-y-4">
            <p className="text-zinc-700 font-sans text-xs sm:text-sm leading-relaxed">
              {seller.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-zinc-500 pt-2 border-t border-zinc-100">
              <span className="font-bold text-zinc-950 text-sm">
                {followerCount.toLocaleString()}{' '}
                <span className="font-normal text-zinc-500 text-xs">Followers</span>
              </span>
              <span>•</span>
              <span className="font-bold text-zinc-950 text-sm">
                {seller.viewCount.toLocaleString()}{' '}
                <span className="font-normal text-zinc-500 text-xs">Store Views</span>
              </span>
            </div>
          </div>

          {/* Store Info Container */}
          <div className="md:col-span-4 bg-zinc-50 border border-zinc-200 p-5 rounded-none space-y-3">
            <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-[0.2em]">
              STORE INFORMATION
            </div>

            <div className="flex items-center gap-2 text-zinc-900 font-bold">
              <MapPin className="w-4 h-4 text-zinc-950 shrink-0" />
              <span>{seller.location.city} ({seller.location.district})</span>
            </div>

            {seller.location.openingHours && (
              <div className="flex items-center gap-2 text-zinc-600 text-xs">
                <Clock className="w-4 h-4 text-zinc-500 shrink-0" />
                <span>{seller.location.openingHours}</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-3 border-t border-zinc-200">
              {seller.socialLinks.instagram && (
                <a
                  href={seller.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-white border border-zinc-300 text-zinc-900 hover:bg-zinc-950 hover:text-white transition-colors"
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
                  className="p-2.5 bg-white border border-zinc-300 text-zinc-900 hover:bg-zinc-950 hover:text-white transition-colors"
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
