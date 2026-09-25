import React, { useEffect, useState } from 'react';
import { Bell, BellCheck, CalendarPlus, Clock, Download, Eye } from 'lucide-react';
import type { Drop } from '../../types/fashion';
import { storageService } from '../../services/storageService';
import { buildIcs, downloadIcs, googleCalendarUrl, icsFilename } from '../../utils/calendar';
import { DropCountdownTimer } from './DropCountdownTimer';
import { LiveDropGrid } from './LiveDropGrid';

interface DropCardProps {
  drop: Drop;
  onExploreDrop?: (dropId: string) => void;
}

const DROP_EVENT_DURATION_MS = 2 * 60 * 60 * 1000;

export const DropCard: React.FC<DropCardProps> = ({ drop }) => {
  const [hasReminder, setHasReminder] = useState<boolean>(() =>
    storageService.hasDropReminder(drop.id)
  );
  const [remindCount, setRemindCount] = useState<number>(drop.remindCount);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [now, setNow] = useState<number>(() => Date.now());

  const releaseAt = new Date(drop.releaseTime).getTime();
  const hasValidRelease = Number.isFinite(releaseAt);
  // Live state comes from the clock, so the card flips the moment the countdown ends.
  const isLive = hasValidRelease && now >= releaseAt;

  useEffect(() => {
    if (isLive) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [isLive]);

  const handleReminderToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = storageService.toggleDropReminder(drop.id);
    setHasReminder(updated);
    setRemindCount((prev) => (updated ? prev + 1 : prev - 1));
  };

  const calendarEvent = hasValidRelease
    ? {
        title: drop.title,
        details: drop.description,
        location: drop.sellerName,
        start: new Date(releaseAt),
        end: new Date(releaseAt + DROP_EVENT_DURATION_MS),
      }
    : null;

  const handleDownloadIcs = () => {
    if (!calendarEvent) return;
    downloadIcs(icsFilename(drop.title), buildIcs({ uid: `${drop.id}@habi`, ...calendarEvent }));
  };

  const formattedDate = hasValidRelease
    ? new Date(releaseAt).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : 'Date to be announced';

  return (
    <div className="bg-white border border-zinc-200/80 rounded-2xl sm:rounded-3xl overflow-hidden hover:border-zinc-300 hover:shadow-xl transition-all font-sans">
      <div className="grid grid-cols-1 md:grid-cols-12 items-center">
        {/* Cover Photo */}
        <div className="md:col-span-5 aspect-[16/10] md:aspect-auto md:h-full bg-zinc-950 relative overflow-hidden group">
          <img
            src={drop.coverImage}
            alt={drop.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          <div className="absolute top-3.5 left-3.5 bg-zinc-950/90 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/20 shadow-sm">
            {drop.itemCount} Collection Pieces
          </div>

          {isLive && (
            <div className="absolute top-3.5 right-3.5 bg-white/95 text-zinc-950 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-sm">
              Live now
            </div>
          )}
        </div>

        {/* Details & Countdown */}
        <div className="md:col-span-7 p-4 sm:p-6 lg:p-8 space-y-3 sm:space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <img
                src={drop.sellerLogo}
                alt={drop.sellerName}
                className="w-6 h-6 rounded-full object-cover border border-zinc-200"
              />
              <span className="text-xs font-semibold text-zinc-900">{drop.sellerName}</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-zinc-600 bg-zinc-100 px-3 py-1 rounded-full">
              <Clock className="w-3.5 h-3.5" />
              <span>{isLive ? `Dropped ${formattedDate}` : formattedDate}</span>
            </div>
          </div>

          <div>
            <h3 className="font-outfit text-lg sm:text-xl lg:text-2xl font-bold text-zinc-950 tracking-tight">
              {drop.title}
            </h3>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              {drop.description}
            </p>
          </div>

          {/* Live Countdown & Remind Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            {isLive ? (
              <div>
                <span className="text-[11px] font-medium text-zinc-500 block mb-1.5">
                  Drop Status:
                </span>
                <span
                  role="status"
                  className="inline-flex items-center border border-zinc-950 text-zinc-950 text-[11px] font-bold tracking-wider uppercase px-3 py-1 rounded-full"
                >
                  Live now
                </span>
                <span className="text-[11px] text-zinc-500 block mt-1.5">
                  Reserve pieces below, first come first served.
                </span>
              </div>
            ) : (
              <div>
                <span className="text-[11px] font-medium text-zinc-500 block mb-1.5">
                  Drop Launch Timer:
                </span>
                <DropCountdownTimer targetDate={drop.releaseTime} />
              </div>
            )}

            {!isLive && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 flex-1 sm:flex-none justify-center cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isPreviewOpen ? 'Hide Catalog' : 'Preview Catalog'}</span>
                </button>

                <button
                  onClick={handleReminderToggle}
                  aria-label={hasReminder ? "Remove drop release reminder" : "Set local drop release reminder"}
                  title="Drop reminders store local browser alert preferences; toggle anytime to unsubscribe."
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm flex-1 sm:flex-none justify-center cursor-pointer ${
                    hasReminder
                      ? 'bg-zinc-950 text-white'
                      : 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200'
                  }`}
                >
                  {hasReminder ? <BellCheck className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                  <span>{hasReminder ? 'Reminder Set' : 'Remind Me'}</span>
                  <span className="text-[11px] opacity-70">({remindCount})</span>
                </button>
              </div>
            )}
          </div>

          {/* Add to calendar */}
          {!isLive && calendarEvent && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-medium text-zinc-500 mr-1">Add to calendar:</span>
              <a
                href={googleCalendarUrl(calendarEvent)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-white border border-zinc-200/80 hover:bg-zinc-100 text-zinc-800 rounded-full text-[11px] font-semibold transition-colors inline-flex items-center gap-1.5"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span>Google</span>
              </a>
              <button
                type="button"
                onClick={handleDownloadIcs}
                className="px-3 py-1.5 bg-white border border-zinc-200/80 hover:bg-zinc-100 text-zinc-800 rounded-full text-[11px] font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>.ics</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Live Reservation Grid */}
      {isLive && (
        <div className="bg-zinc-50/80 p-4 sm:p-6 border-t border-zinc-100 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="font-avantgarde text-[11px] tracking-wider uppercase font-semibold text-zinc-500">
              Reserve Now
            </span>
            <span className="text-[11px] text-zinc-500">
              {drop.items.length} of {drop.itemCount} pieces listed
            </span>
          </div>
          <LiveDropGrid items={drop.items} />
        </div>
      )}

      {/* Catalog Preview Drawer */}
      {!isLive && isPreviewOpen && drop.items && drop.items.length > 0 && (
        <div className="bg-zinc-50/80 p-4 sm:p-6 border-t border-zinc-100">
          <div className="text-xs font-semibold text-zinc-500 mb-3">
            Catalog Items Preview ({drop.items.length} previewed)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
            {drop.items.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-zinc-200/70 rounded-2xl p-3 space-y-2 shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="aspect-square bg-zinc-100 rounded-xl overflow-hidden">
                  <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="font-outfit text-xs font-semibold truncate text-zinc-950">{item.name}</div>
                <div className="flex items-center justify-between text-[11px] text-zinc-500">
                  <span className="font-bold text-zinc-900">₱{item.price.toLocaleString()}</span>
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
