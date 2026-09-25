import React, { useEffect, useState } from 'react';
import { CalendarClock, Radio, Timer, Trash2 } from 'lucide-react';
import type { Drop, Product, Seller } from '../../../types/fashion';
import { catalogService, makeCatalogId } from '../../../services/catalogService';
import type { StoredDrop } from '../../../services/catalogService';
import { Alert, Button, Field, inputClass, labelClass } from '../../common/FormControls';
import { ImageUploadField } from '../../common/ImageUploadField';
import { DropCard } from '../../drops/DropCard';

interface DropsTabProps {
  seller: Seller;
  products: Product[];
  runAction: (action: () => void, message: string) => void;
}

interface DropDraft {
  title: string;
  description: string;
  /** YYYY-MM-DD in local time. */
  date: string;
  /** HH:MM in local time. */
  time: string;
  coverImage: string;
  productIds: string[];
}

const CONFIRM_WINDOW_MS = 4000;
const TICK_MS = 30000;
const DAY_MS = 24 * 60 * 60 * 1000;

function toDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function emptyDraft(): DropDraft {
  const tomorrow = new Date(Date.now() + DAY_MS);
  return { title: '', description: '', date: toDateInput(tomorrow), time: '20:00', coverImage: '', productIds: [] };
}

/** Combines the date and time inputs into a local Date, or null when either is blank or invalid. */
function parseRelease(date: string, time: string): Date | null {
  if (!date || !time) return null;
  const parsed = new Date(`${date}T${time}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatRelease(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function countdownLabel(releaseTime: string, now: number): string {
  const diff = new Date(releaseTime).getTime() - now;
  if (!Number.isFinite(diff)) return 'Date unknown';
  if (diff <= 0) return 'Live now';
  const totalMinutes = Math.floor(diff / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `Drops in ${days}d ${hours}h`;
  if (hours > 0) return `Drops in ${hours}h ${minutes}m`;
  return `Drops in ${Math.max(1, minutes)}m`;
}

export const DropsTab: React.FC<DropsTabProps> = ({ seller, products, runAction }) => {
  const [form, setForm] = useState<DropDraft>(emptyDraft);
  const [error, setError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  // Keeps the countdown text and Live badges moving without a page refresh.
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  const update = <K extends keyof DropDraft>(key: K, value: DropDraft[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const toggleProduct = (id: string) => {
    update(
      'productIds',
      form.productIds.includes(id) ? form.productIds.filter((x) => x !== id) : [...form.productIds, id]
    );
  };

  const selectedProducts = products.filter((product) => form.productIds.includes(product.id));
  const release = parseRelease(form.date, form.time);
  const coverImage = form.coverImage || selectedProducts[0]?.images[0] || seller.coverUrl;
  const myDrops = catalogService
    .getStoredDrops()
    .filter((drop) => drop.sellerId === seller.id)
    .sort((a, b) => new Date(a.releaseTime).getTime() - new Date(b.releaseTime).getTime());

  const previewDrop: Drop = {
    id: 'preview-drop',
    sellerId: seller.id,
    sellerName: seller.name,
    sellerHandle: seller.handle,
    sellerLogo: seller.logoUrl,
    title: form.title.trim() || 'Your drop title',
    description: form.description.trim() || 'A short teaser for the collection shows here.',
    releaseTime: (release ?? new Date(now + DAY_MS)).toISOString(),
    itemCount: selectedProducts.length,
    coverImage,
    items: selectedProducts,
    remindCount: 0,
    isLive: false,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const title = form.title.trim();
    const description = form.description.trim();
    if (!title) return setError('Give the drop a title.');
    if (description.length < 10) return setError('Tell buyers what is dropping in at least 10 characters.');
    if (!release) return setError('Pick a release date and time.');
    if (release.getTime() <= Date.now()) return setError('The release time has to be in the future.');
    if (selectedProducts.length === 0) return setError('Select at least one piece for the drop.');

    const stored: StoredDrop = {
      id: makeCatalogId('drop'),
      sellerId: seller.id,
      sellerName: seller.name,
      sellerHandle: seller.handle,
      sellerLogo: seller.logoUrl,
      title,
      description,
      releaseTime: release.toISOString(),
      coverImage,
      productIds: selectedProducts.map((product) => product.id),
      remindCount: 0,
      createdAt: new Date().toISOString(),
    };
    runAction(() => catalogService.addDrop(stored), `${title} is scheduled for ${formatRelease(stored.releaseTime)}.`);
    setForm(emptyDraft());
  };

  const deleteDrop = (drop: StoredDrop) => {
    if (pendingDeleteId !== drop.id) {
      setPendingDeleteId(drop.id);
      window.setTimeout(() => setPendingDeleteId((id) => (id === drop.id ? null : id)), CONFIRM_WINDOW_MS);
      return;
    }
    setPendingDeleteId(null);
    runAction(() => catalogService.removeDrop(drop.id), `${drop.title} removed from your schedule.`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 items-start">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="lg:col-span-3 bg-white border border-zinc-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 space-y-5 shadow-sm"
      >
        <div className="border-b border-zinc-100 pb-3 sm:pb-4">
          <h3 className="font-cooper text-lg sm:text-xl font-bold text-zinc-950">Schedule a Drop</h3>
          <p className="text-[11px] sm:text-xs text-zinc-500 mt-0.5">
            Buyers can set a reminder, and the pieces go live together at release time.
          </p>
        </div>

        {error && <Alert tone="error">{error}</Alert>}

        <Field label="Drop title" htmlFor="dp-title" required>
          <input
            id="dp-title"
            type="text"
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="e.g. Friday Vintage Denim Restock"
            className={inputClass}
          />
        </Field>

        <Field label="Description" htmlFor="dp-description" required hint="What is in it, how many pieces, and how to reserve.">
          <textarea
            id="dp-description"
            rows={3}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            className={`${inputClass} resize-none`}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Field label="Release date" htmlFor="dp-date" required>
            <input
              id="dp-date"
              type="date"
              min={toDateInput(new Date())}
              value={form.date}
              onChange={(e) => update('date', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field
            label="Release time"
            htmlFor="dp-time"
            required
            hint={release ? `Goes live ${formatRelease(release.toISOString())}` : 'Your local time'}
          >
            <input id="dp-time" type="time" value={form.time} onChange={(e) => update('time', e.target.value)} className={inputClass} />
          </Field>
        </div>

        <ImageUploadField
          label="Cover image"
          value={form.coverImage}
          maxEdge={1400}
          aspectClass="aspect-[16/10]"
          onChange={(value) => update('coverImage', value)}
          hint="Optional. Leave it empty to use the first selected piece's cover."
        />

        <div className="space-y-1.5">
          <span className={labelClass}>
            Pieces in this drop <span className="text-zinc-500 font-normal">({selectedProducts.length} selected)</span>
          </span>
          {products.length === 0 ? (
            <p className="text-[11px] sm:text-xs text-zinc-500">
              List a piece first. A drop needs at least one piece from your inventory.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-0.5">
              {products.map((product) => {
                const checked = form.productIds.includes(product.id);
                return (
                  <label
                    key={product.id}
                    className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-colors ${
                      checked ? 'border-zinc-950 bg-zinc-50' : 'border-zinc-200/80 hover:border-zinc-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleProduct(product.id)}
                      className="w-4 h-4 accent-zinc-950 shrink-0"
                    />
                    <img
                      src={product.images[0]}
                      alt=""
                      className="w-9 h-9 rounded-lg object-cover border border-zinc-200 shrink-0"
                    />
                    <span className="text-xs font-semibold text-zinc-900 truncate">{product.name}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <Button type="submit" className="w-full">
          <CalendarClock className="w-4 h-4" />
          <span>Schedule Drop</span>
        </Button>

        <div className="space-y-2 pt-4 border-t border-zinc-100">
          <div className="font-avantgarde text-[11px] tracking-wider uppercase font-semibold text-zinc-500">
            Live preview
          </div>
          {/* Inert: the card's reminder button must not write a reminder for the preview id. */}
          <div inert>
            <DropCard drop={previewDrop} />
          </div>
        </div>
      </form>

      <div className="lg:col-span-2 bg-white border border-zinc-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-3 sm:space-y-4 shadow-sm">
        <div className="pb-3 sm:pb-4 border-b border-zinc-100">
          <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Scheduled Drops ({myDrops.length})
          </h3>
        </div>

        {myDrops.length === 0 ? (
          <div className="py-8 sm:py-10 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div className="font-cooper text-base font-bold text-zinc-900">No drops scheduled</div>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto">
              Schedule one and it shows on your storefront with a countdown.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {myDrops.map((drop) => {
              const isLive = new Date(drop.releaseTime).getTime() <= now;
              const isPendingDelete = pendingDeleteId === drop.id;
              return (
                <div key={drop.id} className="py-3.5 sm:py-4 flex items-center gap-3">
                  <img
                    src={drop.coverImage}
                    alt=""
                    className="w-16 h-11 sm:w-20 sm:h-14 rounded-lg sm:rounded-xl object-cover border border-zinc-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h4 className="font-cooper font-bold text-sm text-zinc-950 truncate">{drop.title}</h4>
                      {isLive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-semibold">
                          <Radio className="w-3 h-3" />
                          Live
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-[11px] font-semibold">
                          <Timer className="w-3 h-3" />
                          {countdownLabel(drop.releaseTime, now)}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] sm:text-xs text-zinc-500 mt-0.5 truncate">
                      {formatRelease(drop.releaseTime)} • {drop.productIds.length}{' '}
                      {drop.productIds.length === 1 ? 'piece' : 'pieces'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteDrop(drop)}
                    aria-label={isPendingDelete ? `Confirm delete ${drop.title}` : `Delete ${drop.title}`}
                    className={`h-8 rounded-full flex items-center justify-center gap-1 border text-[11px] font-semibold transition-all shrink-0 ${
                      isPendingDelete
                        ? 'px-3 bg-red-600 text-white border-red-600'
                        : 'w-8 bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {isPendingDelete && <span>Confirm</span>}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
