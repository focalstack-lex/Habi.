import React from 'react';
import { Sparkles, ArrowRight, MapPin, Clock } from 'lucide-react';
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
    <div className="relative overflow-hidden bg-zinc-950 text-white rounded-3xl my-6 mx-4 sm:mx-6 lg:mx-8 border border-zinc-800">
      {/* Background Graphic & Accent Lighting */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 sm:p-12 items-center">
        {/* Left Column: High-Fashion Headline & Editorial Narrative */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-700 rounded-full text-xs font-mono text-zinc-300">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span className="uppercase tracking-widest text-[10px] font-bold">Davao Local Fashion Scene</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-mono font-black tracking-tighter leading-none text-white">
            DISCOVER WHAT'S AROUND YOU.
          </h1>

          <p className="text-zinc-400 text-sm sm:text-base max-w-xl font-sans leading-relaxed">
            Uncover small Davao clothing brands, 1-of-1 vintage thrift archives, local streetwear drops, and independent creators across Davao City, Tagum, Digos, Panabo, and Mati.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 font-mono">
            {featuredDrop && (
              <button
                onClick={() => onExploreDrop(featuredDrop.id)}
                className="px-6 py-3.5 bg-white text-zinc-950 hover:bg-zinc-200 text-xs uppercase tracking-wider font-bold rounded-full transition-all flex items-center gap-2 group"
              >
                <span>View Next Drop</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            <button
              onClick={() => onSelectBrand('seller-1')}
              className="px-6 py-3.5 bg-transparent border border-zinc-700 hover:border-white text-white text-xs uppercase tracking-wider font-bold rounded-full transition-all flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-zinc-400" />
              <span>Explore Davao Brands</span>
            </button>
          </div>
        </div>

        {/* Right Column: Featured Davao Drop Spotlight Card */}
        {featuredDrop && (
          <div className="lg:col-span-5">
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400 uppercase tracking-widest text-[10px]">
                  Featured Davao Drop
                </span>
                <span className="px-2 py-0.5 bg-white text-zinc-950 font-bold rounded text-[10px] uppercase">
                  {featuredDrop.itemCount} Pieces
                </span>
              </div>

              <div className="aspect-[16/9] rounded-xl overflow-hidden relative group">
                <img
                  src={featuredDrop.coverImage}
                  alt={featuredDrop.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-mono text-white">
                  <span className="font-bold truncate">{featuredDrop.sellerName}</span>
                  <div className="flex items-center gap-1 text-[11px] bg-black/60 px-2 py-1 rounded-full border border-white/20">
                    <Clock className="w-3 h-3" />
                    <span>Drop Preview</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-mono text-sm font-bold text-white tracking-tight uppercase">
                  {featuredDrop.title}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                  {featuredDrop.description}
                </p>
              </div>

              <button
                onClick={() => onExploreDrop(featuredDrop.id)}
                className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-mono font-medium transition-colors flex items-center justify-center gap-2"
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
