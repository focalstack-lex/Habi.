import React, { useState } from 'react';
import { Bell, BellCheck, Clock, Eye } from 'lucide-react';
import type { Drop } from '../../types/fashion';
import { storageService } from '../../services/storageService';
import { DropCountdownTimer } from './DropCountdownTimer';

interface DropCardProps {
  drop: Drop;
  onExploreDrop?: (dropId: string) => void;
}

export const DropCard: React.FC<DropCardProps> = ({ drop }) => {
  const [hasReminder, setHasReminder] = useState<boolean>(() =>
    storageService.hasDropReminder(drop.id)
  );
  const [remindCount, setRemindCount] = useState<number>(drop.remindCount);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  const handleReminderToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = storageService.toggleDropReminder(drop.id);
    setHasReminder(updated);
    setRemindCount((prev) => (updated ? prev + 1 : prev - 1));
  };

  const formattedDate = new Date(drop.releaseTime).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="bg-[#FFFFCC] border border-[#E1E6B6] rounded-3xl overflow-hidden hover:border-[#1A1A00]/40 hover:shadow-xl transition-all font-sans">
      <div className="grid grid-cols-1 md:grid-cols-12 items-center">
        {/* Cover Photo */}
        <div className="md:col-span-5 aspect-[16/10] md:aspect-auto md:h-full bg-[#1A1A00] relative overflow-hidden group">
          <img
            src={drop.coverImage}
            alt={drop.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A00]/80 via-transparent to-transparent" />

          <div className="absolute top-3.5 left-3.5 bg-[#1A1A00]/90 backdrop-blur-md text-[#FFFFCC] text-xs font-semibold px-3 py-1 rounded-full border border-[#FFFFCC]/20 shadow-sm">
            {drop.itemCount} Collection Pieces
          </div>
        </div>

        {/* Details & Countdown */}
        <div className="md:col-span-7 p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E1E6B6]">
            <div className="flex items-center gap-2">
              <img
                src={drop.sellerLogo}
                alt={drop.sellerName}
                className="w-6 h-6 rounded-full object-cover border border-[#E1E6B6]"
              />
              <span className="text-xs font-semibold text-[#1A1A00]">{drop.sellerName}</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#565C38] bg-[#EFF2D2] px-3 py-1 rounded-full">
              <Clock className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>
          </div>

          <div>
            <h3 className="font-outfit text-xl sm:text-2xl font-bold text-[#1A1A00] tracking-tight">
              {drop.title}
            </h3>
            <p className="text-xs text-[#565C38] mt-1 leading-relaxed">
              {drop.description}
            </p>
          </div>

          {/* Live Countdown & Remind Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div>
              <span className="text-[11px] font-medium text-[#565C38] block mb-1.5">
                Drop Launch Timer:
              </span>
              <DropCountdownTimer targetDate={drop.releaseTime} />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                className="px-4 py-2 bg-[#EFF2D2] hover:bg-[#EFF2D2]/80 text-[#1A1A00] rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-[#1A1A00]" />
                <span>{isPreviewOpen ? 'Hide Catalog' : 'Preview Catalog'}</span>
              </button>

              <button
                onClick={handleReminderToggle}
                aria-label={hasReminder ? "Remove drop release reminder" : "Set local drop release reminder"}
                title="Drop reminders store local browser alert preferences; toggle anytime to unsubscribe."
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                  hasReminder
                    ? 'bg-[#1A1A00] text-[#FFFFCC]'
                    : 'bg-[#EFF2D2] text-[#1A1A00] hover:bg-[#EFF2D2]/80'
                }`}
              >
                {hasReminder ? <BellCheck className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                <span>{hasReminder ? 'Reminder Set' : 'Remind Me'}</span>
                <span className="text-[11px] opacity-70">({remindCount})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Preview Drawer */}
      {isPreviewOpen && drop.items && drop.items.length > 0 && (
        <div className="bg-[#EFF2D2]/60 p-6 border-t border-[#E1E6B6]">
          <div className="text-xs font-semibold text-[#565C38] mb-3">
            Catalog Items Preview ({drop.items.length} previewed)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {drop.items.map((item) => (
              <div
                key={item.id}
                className="bg-[#FFFFCC] border border-[#E1E6B6] rounded-2xl p-3 space-y-2 shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="aspect-square bg-[#EFF2D2] rounded-xl overflow-hidden">
                  <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="font-outfit text-xs font-semibold truncate text-[#1A1A00]">{item.name}</div>
                <div className="flex items-center justify-between text-[11px] text-[#565C38]">
                  <span className="font-bold text-[#1A1A00]">₱{item.price.toLocaleString()}</span>
                  <span>Size {item.size}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
