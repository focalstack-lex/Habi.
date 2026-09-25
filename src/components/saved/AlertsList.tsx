import React from 'react';
import { ArrowDownRight, ArrowUpRight, BellRing, PackageCheck, PackageX, Clock } from 'lucide-react';
import type { Product } from '../../types/fashion';
import { userPrefsService, type SavedAlert } from '../../services/userPrefsService';
import { Button } from '../common/FormControls';

interface AlertsListProps {
  alerts: SavedAlert[];
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

const ALERT_COPY: Record<SavedAlert['type'], { label: string; icon: React.ComponentType<{ className?: string }>; tone: string }> = {
  'price-drop': { label: 'Price drop', icon: ArrowDownRight, tone: 'bg-emerald-100 text-emerald-900 border-emerald-200' },
  'price-up': { label: 'Price went up', icon: ArrowUpRight, tone: 'bg-amber-100 text-amber-900 border-amber-200' },
  'back-in-stock': { label: 'Back in stock', icon: PackageCheck, tone: 'bg-emerald-100 text-emerald-900 border-emerald-200' },
  'sold-out': { label: 'Sold out', icon: PackageX, tone: 'bg-zinc-200 text-zinc-700 border-zinc-300' },
  reserved: { label: 'Now reserved', icon: Clock, tone: 'bg-amber-100 text-amber-900 border-amber-200' },
};

export const AlertsList: React.FC<AlertsListProps> = ({ alerts, products, onSelectProduct }) => {
  if (alerts.length === 0) {
    return (
      <div className="p-6 sm:p-12 bg-white border border-zinc-200/80 rounded-2xl sm:rounded-3xl text-center space-y-3 shadow-sm">
        <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-500">
          <BellRing className="w-6 h-6" />
        </div>
        <div className="font-cooper text-base sm:text-lg font-bold text-zinc-900">No alerts right now</div>
        <p className="text-xs sm:text-sm text-zinc-500 max-w-sm mx-auto">
          Save a piece and Habi tells you here when its price drops, it sells out, or it comes back.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-zinc-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Changes since you saved</h3>
        <Button type="button" variant="secondary" onClick={() => userPrefsService.dismissAlerts(products)} className="px-3 py-1.5 text-[11px]">
          Dismiss all
        </Button>
      </div>
      <div className="divide-y divide-zinc-100">
        {alerts.map((alert, index) => {
          const product = products.find((p) => p.id === alert.productId);
          if (!product) return null;
          const copy = ALERT_COPY[alert.type];
          const Icon = copy.icon;
          return (
            <button
              key={`${alert.productId}-${alert.type}-${index}`}
              type="button"
              onClick={() => onSelectProduct(product)}
              className="w-full py-3 flex items-center gap-3 text-left hover:bg-zinc-50 rounded-xl px-1 transition-colors"
            >
              <img src={product.images[0]} alt={product.name} className="w-12 h-12 rounded-xl object-cover border border-zinc-200 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-zinc-950 truncate">{product.name}</div>
                <div className="text-[11px] text-zinc-600 truncate">
                  {product.sellerName} • from {alert.from} to {alert.to}
                </div>
              </div>
              <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${copy.tone}`}>
                <Icon className="w-3 h-3" />
                <span>{copy.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
