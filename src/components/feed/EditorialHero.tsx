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
    <div className="relative overflow-hidden bg-zinc-950 text-white rounded-none my-8 mx-0 border border-zinc-900 shadow-2xl">
      {/* Background Subtle Grid Texture */}
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#333_1px,transparent_1px),linear-gradient(to_bottom,#333_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 p-8 sm:p-14 lg:p-16 items-center">
        {/* Left Column: High-Fashion Headline in Syne font */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white text-zinc-950 font-mono text-[10px] font-bold uppercase tracking-[0.2em]">
            <span>DAVAO LOCAL FASHION SCENE</span>
          </div>

          <h1 className="font-syne text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-[0.02em] leading-none text-white uppercase">
            DISCOVER WHAT'S AROUND YOU.
          </h1>

          <p className="text-zinc-400 text-sm sm:text-base max-w-xl font-sans leading-relaxed">
            Uncover independent Davao clothing brands, 1-of-1 vintage archives, local streetwear drops, and independent creators across Davao City, Tagum, Digos, Panabo, and Mati.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4 font-mono">
            {featuredDrop && (
              <button
                onClick={() => onExploreDrop(featuredDrop.id)}
                className="px-8 py-4 bg-white text-zinc-950 hover:bg-zinc-200 text-xs uppercase tracking-[0.2em] font-bold rounded-none transition-all flex items-center gap-3 group"
              >
                <span>VIEW NEXT DROP</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            <button
              onClick={() => onSelectBrand('seller-1')}
              className="px-8 py-4 bg-transparent border border-zinc-700 hover:border-white text-white text-xs uppercase tracking-[0.2em] font-bold rounded-none transition-all flex items-center gap-3"
            >
              <MapPin className="w-4 h-4 text-zinc-400" />
              <span>EXPLORE DAVAO BRANDS</span>
            </button>
          </div>
        </div>

        {/* Right Column: Featured Drop Box */}
        {featuredDrop && (
          <div className="lg:col-span-5">
            <div className="bg-zinc-900 border border-zinc-800 rounded-none p-6 space-y-4">
              <div className="flex items-center justify-between font-mono text-xs border-b border-zinc-800 pb-3">
                <span className="text-zinc-400 uppercase tracking-widest text-[10px]">
                  FEATURED DAVAO DROP
                </span>
                <span className="px-2.5 py-1 bg-white text-zinc-950 font-bold text-[10px] uppercase tracking-wider">
                  {featuredDrop.itemCount} PIECES
                </span>
              </div>

              <div className="aspect-[16/9] rounded-none overflow-hidden relative group border border-zinc-800">
                <img
                  src={featuredDrop.coverImage}
                  alt={featuredDrop.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-mono text-white">
                  <span className="font-bold uppercase tracking-wider">{featuredDrop.sellerName}</span>
                  <div className="flex items-center gap-1.5 text-[10px] uppercase bg-black px-2.5 py-1 border border-zinc-700">
                    <Clock className="w-3 h-3 text-zinc-400" />
                    <span>Drop Preview</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-syne text-base font-bold text-white tracking-tight uppercase">
                  {featuredDrop.title}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2 font-sans">
                  {featuredDrop.description}
                </p>
              </div>

              <button
                onClick={() => onExploreDrop(featuredDrop.id)}
                className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-mono font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 border border-zinc-700"
              >
                <span>Preview Drop Items</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
