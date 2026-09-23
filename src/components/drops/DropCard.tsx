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
    <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm hover:border-zinc-900 transition-all font-sans">
      <div className="grid grid-cols-1 md:grid-cols-12 items-center">
        {/* Cover Photo */}
        <div className="md:col-span-5 aspect-[16/10] md:aspect-auto md:h-full bg-zinc-950 relative overflow-hidden group">
          <img
            src={drop.coverImage}
            alt={drop.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          <div className="absolute top-3 left-3 bg-zinc-950 text-white font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border border-zinc-800">
            {drop.itemCount} Collection Pieces
          </div>
        </div>

        {/* Details & Countdown */}
        <div className="md:col-span-7 p-6 sm:p-8 space-y-5 font-mono">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-200">
            <div className="flex items-center gap-2">
              <img
                src={drop.sellerLogo}
                alt={drop.sellerName}
                className="w-6 h-6 rounded-full object-cover border border-zinc-200"
              />
              <span className="text-xs font-bold text-zinc-900">{drop.sellerName}</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-zinc-600 bg-zinc-100 px-3 py-1 rounded-full border border-zinc-200">
              <Clock className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-black text-zinc-950 tracking-tight uppercase">
              {drop.title}
            </h3>
            <p className="font-sans text-xs text-zinc-600 mt-1.5 leading-relaxed">
              {drop.description}
            </p>
          </div>

          {/* Live Countdown & Remind Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block mb-1.5">
                Drop Launch Timer:
              </span>
              <DropCountdownTimer targetDate={drop.releaseTime} />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{isPreviewOpen ? 'Hide Catalog' : 'Preview Catalog'}</span>
              </button>

              <button
                onClick={handleReminderToggle}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  hasReminder
                    ? 'bg-zinc-950 text-white border-zinc-950'
                    : 'bg-white text-zinc-900 border-zinc-300 hover:border-zinc-900'
                }`}
              >
                {hasReminder ? <BellCheck className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                <span>{hasReminder ? 'Reminder Set' : 'Remind Me'}</span>
                <span className="text-[10px] opacity-70">({remindCount})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Preview Drawer */}
      {isPreviewOpen && drop.items && drop.items.length > 0 && (
        <div className="bg-zinc-50 p-6 border-t border-zinc-200 font-mono">
          <div className="text-xs uppercase font-bold text-zinc-400 tracking-wider mb-4">
            Catalog Items Preview ({drop.items.length} previewed)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {drop.items.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-zinc-200 rounded-2xl p-3 space-y-2"
              >
                <div className="aspect-square bg-zinc-100 rounded-xl overflow-hidden">
                  <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="text-xs font-bold truncate">{item.name}</div>
                <div className="flex items-center justify-between text-[11px] text-zinc-600">
                  <span>₱{item.price.toLocaleString()}</span>
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
