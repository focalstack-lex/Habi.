import React, { useEffect, useId } from 'react';
import { X } from 'lucide-react';

interface DetailSheetProps {
  title: string;
  eyebrow?: string;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Secondary surface opened from inside the product detail. Sits above the
 * detail modal (z-60), pins to the bottom edge on phones and centres from `sm`
 * up. Only the body scrolls, so the title and close button stay put.
 */
export const DetailSheet: React.FC<DetailSheetProps> = ({ title, eyebrow, onClose, children }) => {
  const titleId = useId();

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-6 bg-[#1A2225]/75 backdrop-blur-sm font-sans">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full sm:max-w-md max-h-[85vh] bg-[#FFF9E9] rounded-t-3xl sm:rounded-3xl border border-[#E6DCC0] shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="w-10 h-1 rounded-full bg-[#E6DCC0] mx-auto mt-2.5 sm:hidden" aria-hidden="true" />

        <div className="flex items-start justify-between gap-3 px-4 sm:px-6 pt-3 sm:pt-6 pb-3 border-b border-[#E6DCC0] shrink-0">
          <div className="min-w-0">
            {eyebrow && (
              <span className="font-avantgarde text-[11px] tracking-wider uppercase font-semibold text-[#55615D] block mb-0.5">
                {eyebrow}
              </span>
            )}
            <h2 id={titleId} className="font-cooper font-bold text-base sm:text-lg text-[#1A2225] leading-snug">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full bg-[#F3ECD8] text-[#1A2225] hover:bg-[#E8DFC6] flex items-center justify-center shrink-0 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 sm:py-5 space-y-4 sheet-safe">
          {children}
        </div>
      </div>
    </div>
  );
};
