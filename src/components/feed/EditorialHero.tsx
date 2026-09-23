import React from 'react';
import { ArrowRight, MapPin, Clock } from 'lucide-react';
import type { Drop } from '../../types/fashion';

interface EditorialHeroProps {
  featuredDrop?: Drop;
  onExploreDrop: (dropId: string) => void;
  onSelectBrand: (brandId: string) => void;
}

export const EditorialHero: React.FC<EditorialHeroProps> = ({
  featuredDrop,
  onExploreDrop,
  onSelectBrand,
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white rounded-3xl my-6 border border-zinc-800/60 shadow-xl font-sans">
      {/* Background Subtle Gradient & Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-zinc-800/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10 lg:p-12 items-center">
        {/* Left Column: Soft Modern Headline */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-zinc-200 text-xs font-semibold tracking-wide border border-white/10">
            <span>Davao Local Fashion Scene</span>
          </div>

          <h1 className="font-outfit text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-white">
            Discover What's Around You.
          </h1>

          <p className="text-zinc-300 text-xs sm:text-sm lg:text-base max-w-xl font-normal leading-relaxed">
            Uncover independent Davao clothing brands, 1-of-1 vintage archives, local streetwear drops, and independent creators across Davao City, Tagum, Digos, Panabo, and Mati.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {featuredDrop && (
              <button
                onClick={() => onExploreDrop(featuredDrop.id)}
                className="px-6 py-3 bg-white text-zinc-950 hover:bg-zinc-100 text-xs sm:text-sm font-semibold rounded-full transition-all flex items-center gap-2 shadow-lg group hover:scale-[1.02]"
              >
                <span>Explore Featured Drop</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            <button
              onClick={() => onSelectBrand('seller-1')}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-semibold rounded-full transition-all flex items-center gap-2 backdrop-blur-sm"
            >
              <MapPin className="w-4 h-4 text-zinc-300" />
              <span>Davao Brand Directory</span>
            </button>
          </div>
        </div>

        {/* Right Column: Featured Drop Box */}
        {featuredDrop && (
          <div className="lg:col-span-5">
            <div className="bg-zinc-900/90 backdrop-blur-md border border-zinc-800/90 rounded-2xl p-5 space-y-3.5 shadow-2xl">
              <div className="flex items-center justify-between text-xs border-b border-zinc-800/80 pb-3">
                <span className="text-zinc-400 font-medium">
                  Featured Collection Drop
                </span>
                <span className="px-2.5 py-0.5 bg-white text-zinc-950 font-bold text-[11px] rounded-full">
                  {featuredDrop.itemCount} Pieces
                </span>
              </div>

              <div className="aspect-[16/9] rounded-xl overflow-hidden relative group border border-zinc-800">
                <img
                  src={featuredDrop.coverImage}
                  alt={featuredDrop.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                  <span className="font-semibold text-xs truncate max-w-[60%]">{featuredDrop.sellerName}</span>
                  <div className="flex items-center gap-1.5 text-[10px] bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/20 font-medium">
                    <Clock className="w-3 h-3 text-zinc-300" />
                    <span>Drop Preview</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-outfit text-base font-bold text-white tracking-tight">
                  {featuredDrop.title}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                  {featuredDrop.description}
                </p>
              </div>

              <button
                onClick={() => onExploreDrop(featuredDrop.id)}
                className="w-full py-2.5 bg-white hover:bg-zinc-100 text-zinc-950 text-xs font-semibold rounded-full transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <span>Preview Drop Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
