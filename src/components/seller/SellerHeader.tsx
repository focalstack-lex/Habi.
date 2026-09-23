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
    <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm mb-8 font-sans">
      {/* Cover Image Banner */}
      <div className="h-48 sm:h-64 relative bg-zinc-900 overflow-hidden">
        <img
          src={seller.coverUrl}
          alt={seller.name}
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* Profile Details Container */}
      <div className="px-6 sm:px-8 pb-8 relative -mt-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-zinc-200">
          {/* Avatar & Title Group */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white overflow-hidden bg-white shadow-xl shrink-0">
              <img
                src={seller.logoUrl}
                alt={seller.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-1 font-mono">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                  {seller.name}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-zinc-950 text-white text-[10px] uppercase font-bold rounded-md tracking-wider">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{seller.verificationStatus}</span>
                </span>
              </div>

              <div className="text-xs text-zinc-500 font-medium">
                @{seller.handle} • {seller.location.district}, {seller.location.city}
              </div>
            </div>
          </div>

          {/* Follow CTA Button */}
          <button
            onClick={handleFollowToggle}
            className={`px-6 py-2.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm ${
              isFollowed
                ? 'bg-zinc-100 text-zinc-950 border border-zinc-300 hover:bg-zinc-200'
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

        {/* Bio, Metrics & Location Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-6 font-mono text-xs">
          <div className="md:col-span-8 space-y-3">
            <p className="text-zinc-700 font-sans text-xs sm:text-sm leading-relaxed">
              {seller.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-zinc-500">
              <span className="font-bold text-zinc-900">
                {followerCount.toLocaleString()}{' '}
                <span className="font-normal text-zinc-500">Followers</span>
              </span>
              <span>•</span>
              <span className="font-bold text-zinc-900">
                {seller.viewCount.toLocaleString()}{' '}
                <span className="font-normal text-zinc-500">Store Views</span>
              </span>
            </div>
          </div>

          {/* Social Links & Address Box */}
          <div className="md:col-span-4 bg-zinc-50 border border-zinc-200 p-4 rounded-2xl space-y-2">
            <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">
              Store Information
            </div>

            <div className="flex items-center gap-1.5 text-zinc-800">
              <MapPin className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
              <span>{seller.location.city} ({seller.location.district})</span>
            </div>

            {seller.location.openingHours && (
              <div className="flex items-center gap-1.5 text-zinc-600 text-[11px]">
                <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span>{seller.location.openingHours}</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2 border-t border-zinc-200">
              {seller.socialLinks.instagram && (
                <a
                  href={seller.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white rounded-lg border border-zinc-200 text-zinc-700 hover:text-zinc-950 hover:border-zinc-900 transition-colors"
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
                  className="p-2 bg-white rounded-lg border border-zinc-200 text-zinc-700 hover:text-zinc-950 hover:border-zinc-900 transition-colors"
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
