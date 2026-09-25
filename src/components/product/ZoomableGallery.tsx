import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Tag, ZoomIn } from 'lucide-react';

interface ZoomableGalleryProps {
  images: string[];
  alt: string;
  isOneOfOne: boolean;
  /** Called with the tapped slide so the parent can open the fullscreen zoom viewer. */
  onOpenZoom: (index: number) => void;
}

const arrowClass =
  'hidden sm:flex absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 text-zinc-950 border border-zinc-200/80 shadow-md items-center justify-center hover:scale-105 transition-all disabled:opacity-30 disabled:hover:scale-100';

/**
 * Native swipe gallery: a scroll-snap track with one photo per snap point, dot
 * and counter indicators, arrows from `sm` up, and a thumbnail rail from `md`
 * up. Tapping a slide hands the index to the parent, which owns the zoom viewer.
 */
export const ZoomableGallery: React.FC<ZoomableGalleryProps> = ({ images, alt, isOneOfOne, onOpenZoom }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const count = images.length;
  const hasMany = count > 1;

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const track = event.currentTarget;
    if (track.clientWidth === 0) return;
    const next = Math.min(count - 1, Math.max(0, Math.round(track.scrollLeft / track.clientWidth)));
    if (next !== activeIndex) setActiveIndex(next);
  };

  const scrollToIndex = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.min(count - 1, Math.max(0, index));
    track.scrollTo({ left: clamped * track.clientWidth, behavior: 'smooth' });
  };

  return (
    <div className="space-y-4">
      <div className="relative bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800">
        {count === 0 ? (
          <div className="aspect-[3/4] flex items-center justify-center text-xs font-medium text-zinc-500">No photos yet</div>
        ) : (
          <div
            ref={trackRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto scrollbar-none snap-gallery"
            aria-roledescription="carousel"
            aria-label={`${alt} photos`}
          >
            {images.map((src, idx) => (
              <button
                key={`${idx}-${src}`}
                type="button"
                onClick={() => onOpenZoom(idx)}
                aria-label={`Open photo ${idx + 1} of ${count} fullscreen`}
                className="w-full shrink-0 aspect-[3/4] relative block cursor-zoom-in"
              >
                <img src={src} alt={`${alt}, photo ${idx + 1}`} className="w-full h-full object-cover" draggable={false} />
              </button>
            ))}
          </div>
        )}

        {isOneOfOne && (
          <div className="absolute top-14 left-3 bg-zinc-950/90 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5 border border-white/20 pointer-events-none">
            <Tag className="w-3 h-3 text-white" />
            <span>1 of 1 Thrift Archive</span>
          </div>
        )}

        {hasMany && (
          <div
            className="absolute top-14 md:top-3 right-3 bg-zinc-950/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/20 pointer-events-none tabular-nums"
            aria-live="polite"
          >
            {activeIndex + 1} / {count}
          </div>
        )}

        {count > 0 && (
          <div className="absolute bottom-3 right-3 bg-zinc-950/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1 pointer-events-none">
            <ZoomIn className="w-3 h-3" />
            <span>Tap to zoom</span>
          </div>
        )}

        {hasMany && (
          <>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-zinc-950/60 backdrop-blur-md rounded-full px-2 py-1.5">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollToIndex(idx)}
                  aria-label={`Go to photo ${idx + 1}`}
                  aria-current={activeIndex === idx}
                  className={`h-1.5 rounded-full bg-white transition-all ${activeIndex === idx ? 'w-4 opacity-100' : 'w-1.5 opacity-50 hover:opacity-80'}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => scrollToIndex(activeIndex - 1)}
              disabled={activeIndex === 0}
              aria-label="Previous photo"
              className={`left-3 ${arrowClass}`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollToIndex(activeIndex + 1)}
              disabled={activeIndex === count - 1}
              aria-label="Next photo"
              className={`right-3 ${arrowClass}`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {hasMany && (
        <div className="hidden md:flex items-center gap-2 overflow-x-auto pb-1">
          {images.map((src, idx) => (
            <button
              key={`${idx}-${src}`}
              type="button"
              onClick={() => scrollToIndex(idx)}
              aria-label={`Show photo ${idx + 1}`}
              aria-current={activeIndex === idx}
              className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                activeIndex === idx ? 'border-white scale-95 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" draggable={false} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
