import React, { useState } from 'react';
import { Bookmark, ChartColumn, Eye } from 'lucide-react';
import type { Product } from '../../../types/fashion';
import { catalogService } from '../../../services/catalogService';
import type { DailyMetric } from '../../../services/catalogService';
import { MetricsChart } from '../MetricsChart';

interface AnalyticsTabProps {
  products: Product[];
}

const WINDOW_DAYS = 7;
const ALL_PIECES = 'all';

function emptySeries(): DailyMetric[] {
  const series: DailyMetric[] = [];
  for (let offset = WINDOW_DAYS - 1; offset >= 0; offset--) {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    series.push({ date: date.toISOString().split('T')[0], views: 0, saves: 0 });
  }
  return series;
}

/** Adds the per-product series day by day; saves are clamped so un-saves cannot go negative. */
function sumSeries(all: DailyMetric[][]): DailyMetric[] {
  return emptySeries().map((day, index) => ({
    date: day.date,
    views: all.reduce((sum, series) => sum + (series[index]?.views ?? 0), 0),
    saves: Math.max(0, all.reduce((sum, series) => sum + (series[index]?.saves ?? 0), 0)),
  }));
}

const PiecePill: React.FC<{ id: string; label: string; active: boolean; onSelect: (id: string) => void }> = ({
  id,
  label,
  active,
  onSelect,
}) => (
  <button
    type="button"
    onClick={() => onSelect(id)}
    aria-pressed={active}
    title={label}
    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all shrink-0 max-w-[180px] truncate ${
      active ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm' : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-400'
    }`}
  >
    {label}
  </button>
);

const TotalTile: React.FC<{ label: string; value: number; icon: React.ComponentType<{ className?: string }> }> = ({
  label,
  value,
  icon: Icon,
}) => (
  <div className="bg-zinc-50 border border-zinc-200/70 rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-1">
    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
      <span>{label}</span>
      <Icon className="w-3.5 h-3.5" />
    </div>
    <div className="font-cooper text-2xl sm:text-3xl font-bold text-zinc-950">{value.toLocaleString()}</div>
  </div>
);

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ products }) => {
  const [selectedId, setSelectedId] = useState<string>(ALL_PIECES);

  // Fall back to all pieces if the selected one was deleted.
  const activeId = selectedId !== ALL_PIECES && products.some((p) => p.id === selectedId) ? selectedId : ALL_PIECES;
  const included = activeId === ALL_PIECES ? products : products.filter((p) => p.id === activeId);
  const metrics = included.map((product) => catalogService.getProductMetrics(product.id, WINDOW_DAYS));
  const series = sumSeries(metrics.map((m) => m.days));
  const isSample = metrics.length > 0 && metrics.every((m) => m.isSample);
  const totalViews = series.reduce((sum, day) => sum + day.views, 0);
  const totalSaves = series.reduce((sum, day) => sum + day.saves, 0);
  const activeName = activeId === ALL_PIECES ? 'All pieces' : included[0]?.name ?? 'All pieces';

  return (
    <div className="bg-white border border-zinc-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 sm:pb-4 border-b border-zinc-100">
        <div className="min-w-0">
          <h3 className="font-cooper text-lg sm:text-xl font-bold text-zinc-950">Views and saves</h3>
          <p className="text-[11px] sm:text-xs text-zinc-500 mt-0.5 truncate">
            Last {WINDOW_DAYS} days, counted on this device. Showing {activeName}.
          </p>
        </div>
        {isSample && (
          <span className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-semibold shrink-0">
            <ChartColumn className="w-3.5 h-3.5" />
            Sample data
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1" role="group" aria-label="Choose a piece">
        <PiecePill id={ALL_PIECES} label="All pieces" active={activeId === ALL_PIECES} onSelect={setSelectedId} />
        {products.map((product) => (
          <PiecePill
            key={product.id}
            id={product.id}
            label={product.name}
            active={activeId === product.id}
            onSelect={setSelectedId}
          />
        ))}
      </div>

      {products.length === 0 ? (
        <div className="py-8 sm:py-10 text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
            <ChartColumn className="w-5 h-5" />
          </div>
          <div className="font-cooper text-base font-bold text-zinc-900">Nothing to chart yet</div>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            List a piece and its views and saves show up here as buyers browse.
          </p>
        </div>
      ) : (
        <>
          <MetricsChart days={series} />

          {!isSample && totalViews === 0 && totalSaves === 0 && (
            <p className="text-[11px] sm:text-xs text-zinc-500">
              No views or saves recorded yet. Share your storefront link to get the first visits.
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-zinc-100">
            <TotalTile label={`Views, ${WINDOW_DAYS} days`} value={totalViews} icon={Eye} />
            <TotalTile label={`Saves, ${WINDOW_DAYS} days`} value={totalSaves} icon={Bookmark} />
          </div>
        </>
      )}
    </div>
  );
};
