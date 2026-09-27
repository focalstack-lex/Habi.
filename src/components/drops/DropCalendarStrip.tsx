import React, { useMemo } from 'react';
import type { Drop } from '../../types/fashion';
import { localDayKey } from '../../utils/calendar';

interface DropCalendarStripProps {
  drops: Drop[];
  /** `YYYY-MM-DD` local day key, or null for every day. */
  selectedDay: string | null;
  onSelectDay: (day: string | null) => void;
}

const DAY_COUNT = 14;
const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface StripDay {
  key: string;
  weekday: string;
  dayNumber: number;
  dropCount: number;
  isToday: boolean;
  label: string;
}

export const DropCalendarStrip: React.FC<DropCalendarStripProps> = ({ drops, selectedDay, onSelectDay }) => {
  const days = useMemo<StripDay[]>(() => {
    const countsByDay = new Map<string, number>();
    drops.forEach((drop) => {
      const releaseAt = new Date(drop.releaseTime);
      if (Number.isNaN(releaseAt.getTime())) return;
      const key = localDayKey(releaseAt);
      countsByDay.set(key, (countsByDay.get(key) ?? 0) + 1);
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Array.from({ length: DAY_COUNT }, (_, offset) => {
      const date = new Date(today);
      date.setDate(today.getDate() + offset);
      const key = localDayKey(date);
      return {
        key,
        weekday: WEEKDAY_LETTERS[date.getDay()],
        dayNumber: date.getDate(),
        dropCount: countsByDay.get(key) ?? 0,
        isToday: offset === 0,
        label: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
      };
    });
  }, [drops]);

  const isAllSelected = selectedDay === null;

  return (
    <div
      role="group"
      aria-label="Filter drops by release day"
      className="flex items-stretch gap-2 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 py-1"
    >
      <button
        type="button"
        onClick={() => onSelectDay(null)}
        aria-pressed={isAllSelected}
        className={`shrink-0 px-4 rounded-full text-xs font-semibold transition-colors cursor-pointer border ${
          isAllSelected
            ? 'bg-[#1A2225] text-[#FFF9E9] border-[#1A2225]'
            : 'bg-[#FFF9E9] text-[#1A2225] border-[#E6DCC0] hover:bg-[#F3ECD8]'
        }`}
      >
        All
      </button>

      {days.map((day) => {
        const isSelected = selectedDay === day.key;
        const pillClass = isSelected
          ? 'bg-[#1A2225] text-[#FFF9E9] border-[#1A2225]'
          : day.isToday
            ? 'bg-[#FFF9E9] text-[#1A2225] border-[#1A2225]'
            : 'bg-[#FFF9E9] text-[#1A2225] border-[#E6DCC0] hover:bg-[#F3ECD8]';
        const weekdayClass = isSelected ? 'text-[#E6DCC0]' : 'text-[#55615D]';
        const dotClass = day.dropCount > 0
          ? isSelected ? 'bg-[#FFF9E9]' : 'bg-[#1A2225]'
          : 'bg-transparent';

        return (
          <button
            key={day.key}
            type="button"
            onClick={() => onSelectDay(isSelected ? null : day.key)}
            aria-pressed={isSelected}
            aria-label={`${day.label}${day.dropCount > 0 ? `, ${day.dropCount} drop${day.dropCount === 1 ? '' : 's'}` : ''}`}
            title={day.label}
            className={`shrink-0 w-11 py-2 rounded-full border flex flex-col items-center gap-0.5 transition-colors cursor-pointer ${pillClass}`}
          >
            <span className={`font-avantgarde text-[11px] font-semibold uppercase tracking-wider leading-none ${weekdayClass}`}>
              {day.weekday}
            </span>
            <span className="text-sm font-bold leading-tight">{day.dayNumber}</span>
            <span aria-hidden="true" className={`w-3 h-0.5 rounded-full ${dotClass}`} />
          </button>
        );
      })}
    </div>
  );
};
