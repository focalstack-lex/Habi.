import React, { useEffect, useMemo, useState } from 'react';
import { DropCard } from '../components/drops/DropCard';
import { DropCalendarStrip } from '../components/drops/DropCalendarStrip';
import type { Drop } from '../types/fashion';
import { localDayKey } from '../utils/calendar';
import { CalendarDays, Sparkles } from 'lucide-react';

interface DropsViewProps {
  drops: Drop[];
  onExploreDrop?: (dropId: string) => void;
}

const LIVE_STATE_REFRESH_MS = 30 * 1000;

function releaseTimestamp(drop: Drop): number {
  return new Date(drop.releaseTime).getTime();
}

export const DropsView: React.FC<DropsViewProps> = ({ drops, onExploreDrop }) => {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());

  // Cards flip themselves every second; the section split only needs a coarse clock.
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), LIVE_STATE_REFRESH_MS);
    return () => window.clearInterval(timer);
  }, []);

  const { liveDrops, upcomingDrops } = useMemo(() => {
    const matchesDay = (drop: Drop) => {
      if (!selectedDay) return true;
      const releaseAt = new Date(drop.releaseTime);
      return !Number.isNaN(releaseAt.getTime()) && localDayKey(releaseAt) === selectedDay;
    };
    const isLive = (drop: Drop) => now >= releaseTimestamp(drop);

    return {
      // Most recently opened drop first.
      liveDrops: drops
        .filter((drop) => isLive(drop) && matchesDay(drop))
        .sort((a, b) => releaseTimestamp(b) - releaseTimestamp(a)),
      // Soonest release first.
      upcomingDrops: drops
        .filter((drop) => !isLive(drop) && matchesDay(drop))
        .sort((a, b) => releaseTimestamp(a) - releaseTimestamp(b)),
    };
  }, [drops, now, selectedDay]);

  const hasNothingScheduled = drops.length === 0;
  const hasNothingOnDay = !hasNothingScheduled && selectedDay !== null && liveDrops.length === 0 && upcomingDrops.length === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 font-sans space-y-4 sm:space-y-8">
      {/* Header Banner */}
      <div className="bg-[#1A2225] text-[#FFF9E9] p-6 sm:p-8 md:p-10 rounded-3xl border border-[#1A2225]/20 shadow-xl space-y-3">
        <div className="font-avantgarde text-[11px] tracking-widest uppercase text-[#E0DFC8] font-semibold">
          SCHEDULED RELEASES
        </div>

        <h1 className="font-outfit text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#FFF9E9]">
          Davao Collection Drops
        </h1>

        <p className="text-[#E0DFC8] text-xs sm:text-sm max-w-2xl leading-relaxed font-normal">
          Limited batch releases from Davao thrift vaults & streetwear brands.
        </p>
      </div>

      {/* Two-week release calendar */}
      <DropCalendarStrip drops={drops} selectedDay={selectedDay} onSelectDay={setSelectedDay} />

      {hasNothingScheduled ? (
        <div className="p-6 sm:p-12 bg-[#FFF9E9] border border-[#E6DCC0] rounded-3xl text-center space-y-3">
          <Sparkles className="w-8 h-8 text-[#1A2225] mx-auto" />
          <div className="font-outfit text-base font-bold text-[#1A2225]">No Drops Scheduled</div>
          <p className="text-xs text-[#55615D] max-w-sm mx-auto">
            Check back soon for new Davao thrift vault collection releases.
          </p>
        </div>
      ) : hasNothingOnDay ? (
        <div className="p-6 sm:p-12 bg-[#FFF9E9] border border-[#E6DCC0] rounded-3xl text-center space-y-3">
          <CalendarDays className="w-8 h-8 text-[#1A2225] mx-auto" />
          <div className="font-outfit text-base font-bold text-[#1A2225]">No drops on this day</div>
          <p className="text-xs text-[#55615D] max-w-sm mx-auto">
            Pick another day on the strip, or tap All to see every scheduled release.
          </p>
          <button
            type="button"
            onClick={() => setSelectedDay(null)}
            className="px-4 py-2 bg-[#1A2225] hover:bg-[#252E31] text-[#FFF9E9] rounded-full text-xs font-semibold transition-colors cursor-pointer"
          >
            Show all drops
          </button>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-10">
          {/* Live now */}
          {liveDrops.length > 0 && (
            <section className="space-y-4 sm:space-y-6" aria-label="Live drops">
              <h2 className="font-avantgarde text-[11px] tracking-wider uppercase font-semibold text-[#55615D]">
                <span>Live now ({liveDrops.length})</span>
              </h2>
              {liveDrops.map((drop) => (
                <DropCard key={drop.id} drop={drop} onExploreDrop={onExploreDrop} />
              ))}
            </section>
          )}

          {/* Upcoming */}
          <section className="space-y-4 sm:space-y-6" aria-label="Upcoming drops">
            <h2 className="font-avantgarde text-[11px] tracking-wider uppercase font-semibold text-[#55615D]">
              Upcoming ({upcomingDrops.length})
            </h2>
            {upcomingDrops.length > 0 ? (
              upcomingDrops.map((drop) => (
                <DropCard key={drop.id} drop={drop} onExploreDrop={onExploreDrop} />
              ))
            ) : (
              <p className="text-xs text-[#55615D]">
                {selectedDay ? 'Every drop on this day is already live.' : 'Nothing else is scheduled yet.'}
              </p>
            )}
          </section>
        </div>
      )}
    </div>
  );
};
