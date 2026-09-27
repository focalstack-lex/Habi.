import React, { useEffect, useRef, useState } from 'react';
import type { DailyMetric } from '../../services/catalogService';

interface MetricsChartProps {
  /** Consecutive days, oldest first. */
  days: DailyMetric[];
}

const HEIGHT = 176;
const PAD_TOP = 10;
const PAD_RIGHT = 8;
const PAD_BOTTOM = 24;
const BAR_GAP = 2;
const CAP_RADIUS = 4;
const MIN_WIDTH = 240;
const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function utcDate(key: string): Date {
  return new Date(`${key}T00:00:00Z`);
}

function weekdayInitial(key: string): string {
  return WEEKDAY_INITIALS[utcDate(key).getUTCDay()] ?? '';
}

function longDate(key: string): string {
  return utcDate(key).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/** Ticks from zero to a clean ceiling (1, 2 or 5 times a power of ten) in at most four steps. */
function buildTicks(max: number): number[] {
  const safeMax = Math.max(1, max);
  for (let magnitude = 1; magnitude <= 1e9; magnitude *= 10) {
    for (const base of [1, 2, 5]) {
      const step = base * magnitude;
      const steps = Math.ceil(safeMax / step);
      if (steps <= 4) return Array.from({ length: steps + 1 }, (_, i) => i * step);
    }
  }
  return [0, safeMax];
}

/** Column with a rounded cap and a square base, grown from the baseline. */
function barPath(x: number, top: number, width: number, baseline: number): string {
  const height = baseline - top;
  if (height <= 0) return '';
  const r = Math.min(CAP_RADIUS, height, width / 2);
  return [
    `M${x},${baseline}`,
    `V${top + r}`,
    `Q${x},${top} ${x + r},${top}`,
    `H${x + width - r}`,
    `Q${x + width},${top} ${x + width},${top + r}`,
    `V${baseline}`,
    'Z',
  ].join(' ');
}

const px = (value: number) => Math.round(value * 100) / 100;

/** Inline SVG grouped column chart: views (dark) and saves (light) per day, no chart library. */
export const MetricsChart: React.FC<MetricsChartProps> = ({ days }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(320);
  const [hovered, setHovered] = useState<number | null>(null);

  // Real pixels rather than a scaled viewBox so axis text never drops below 11px on phones.
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const measure = () => setWidth(Math.max(MIN_WIDTH, Math.floor(element.clientWidth)));
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const maxValue = days.reduce((max, day) => Math.max(max, day.views, day.saves), 0);
  const ticks = buildTicks(maxValue);
  const top = ticks[ticks.length - 1];
  const padLeft = Math.max(28, top.toLocaleString().length * 7 + 10);
  const plotWidth = Math.max(60, width - padLeft - PAD_RIGHT);
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const baseline = PAD_TOP + plotHeight;
  const slot = plotWidth / Math.max(1, days.length);
  const barWidth = Math.max(8, Math.min(20, Math.floor((slot - 10 - BAR_GAP) / 2)));
  const groupWidth = barWidth * 2 + BAR_GAP;
  const yFor = (value: number) => baseline - (value / top) * plotHeight;

  const activeIndex = hovered ?? days.length - 1;
  const active = days[activeIndex];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <div className="flex items-center gap-4 text-[11px] font-semibold text-zinc-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-zinc-950" aria-hidden="true" />
            Views
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-zinc-300" aria-hidden="true" />
            Saves
          </span>
        </div>
        {active && (
          <div className="text-[11px] sm:text-xs text-zinc-600" aria-live="polite">
            <span className="font-semibold text-zinc-950">{longDate(active.date)}</span>
            {' • '}
            {active.views.toLocaleString()} views
            {' • '}
            {active.saves.toLocaleString()} saves
          </div>
        )}
      </div>

      <div ref={containerRef} className="w-full">
        <svg
          width={width}
          height={HEIGHT}
          viewBox={`0 0 ${width} ${HEIGHT}`}
          role="img"
          aria-label={`Views and saves over the last ${days.length} days`}
          className="block max-w-full font-sans"
          onMouseLeave={() => setHovered(null)}
        >
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={padLeft}
                x2={width - PAD_RIGHT}
                y1={px(yFor(tick))}
                y2={px(yFor(tick))}
                strokeWidth={1}
                className={tick === 0 ? 'stroke-zinc-300' : 'stroke-zinc-200'}
              />
              <text
                x={padLeft - 6}
                y={px(yFor(tick))}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={11}
                className="fill-zinc-500"
              >
                {tick.toLocaleString()}
              </text>
            </g>
          ))}

          {days.map((day, index) => {
            const slotX = padLeft + index * slot;
            const groupX = slotX + (slot - groupWidth) / 2;
            const isActive = index === activeIndex;
            const isToday = index === days.length - 1;
            const viewsPath = barPath(px(groupX), px(yFor(day.views)), barWidth, baseline);
            const savesPath = barPath(px(groupX + barWidth + BAR_GAP), px(yFor(day.saves)), barWidth, baseline);
            return (
              <g
                key={day.date}
                className="cursor-pointer"
                onMouseEnter={() => setHovered(index)}
                onClick={() => setHovered(index)}
              >
                <title>{`${longDate(day.date)}: ${day.views} views, ${day.saves} saves`}</title>
                <rect
                  x={px(slotX)}
                  y={PAD_TOP}
                  width={px(slot)}
                  height={plotHeight}
                  rx={6}
                  className={isActive ? 'fill-zinc-100' : 'fill-transparent'}
                />
                {viewsPath && <path d={viewsPath} className="fill-zinc-950" />}
                {savesPath && <path d={savesPath} className="fill-zinc-300" />}
                <text
                  x={px(slotX + slot / 2)}
                  y={HEIGHT - 8}
                  textAnchor="middle"
                  fontSize={11}
                  className={isToday ? 'fill-zinc-950 font-semibold' : 'fill-zinc-500'}
                >
                  {weekdayInitial(day.date)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <table className="sr-only">
        <caption>Daily views and saves</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Views</th>
            <th scope="col">Saves</th>
          </tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr key={day.date}>
              <th scope="row">{longDate(day.date)}</th>
              <td>{day.views}</td>
              <td>{day.saves}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
