import React, { useState } from 'react';
import { Copy, Pencil, Plus, Tag, Trash2 } from 'lucide-react';
import type { Product } from '../../../types/fashion';
import { catalogService } from '../../../services/catalogService';
import { Button } from '../../common/FormControls';

interface InventoryTabProps {
  products: Product[];
  onAddNew: () => void;
  onEdit: (product: Product) => void;
  onDuplicate: (product: Product) => void;
  runAction: (action: () => void, message: string) => void;
}

const STATUS_ORDER: Product['status'][] = ['Available', 'Reserved', 'Sold Out'];
const CONFIRM_WINDOW_MS = 4000;

const statusClass = (status: Product['status']): string =>
  status === 'Available'
    ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm'
    : status === 'Reserved'
    ? 'bg-amber-100 text-amber-900 border-amber-200'
    : 'bg-zinc-100 text-zinc-400 border-zinc-200 line-through';

const rowButtonClass =
  'h-8 px-2.5 sm:px-3 rounded-full inline-flex items-center justify-center gap-1 border border-zinc-200 bg-white text-zinc-700 text-[11px] font-semibold hover:bg-zinc-100 transition-colors';

const pieces = (count: number) => `${count} ${count === 1 ? 'piece' : 'pieces'}`;

export const InventoryTab: React.FC<InventoryTabProps> = ({ products, onAddNew, onEdit, onDuplicate, runAction }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingBulkDelete, setPendingBulkDelete] = useState(false);

  // Drop ids of pieces that were removed since they were ticked.
  const productIds = products.map((product) => product.id);
  const selected = selectedIds.filter((id) => productIds.includes(id));
  const allSelected = products.length > 0 && selected.length === products.length;

  const toggleSelected = (id: string) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleAll = () => setSelectedIds(allSelected ? [] : productIds);

  const clearSelection = () => {
    setSelectedIds([]);
    setPendingBulkDelete(false);
  };

  const cycleStatus = (product: Product) => {
    const next = STATUS_ORDER[(STATUS_ORDER.indexOf(product.status) + 1) % STATUS_ORDER.length];
    runAction(() => catalogService.updateProduct(product.id, { status: next }), `${product.name} marked ${next}.`);
  };

  const deleteProduct = (product: Product) => {
    if (pendingDeleteId !== product.id) {
      setPendingDeleteId(product.id);
      window.setTimeout(() => setPendingDeleteId((id) => (id === product.id ? null : id)), CONFIRM_WINDOW_MS);
      return;
    }
    setPendingDeleteId(null);
    runAction(() => catalogService.removeProduct(product.id), `${product.name} removed from your storefront.`);
  };

  const bulkStatus = (status: Product['status']) => {
    const ids = selected;
    if (ids.length === 0) return;
    runAction(
      () => ids.forEach((id) => catalogService.updateProduct(id, { status })),
      `${pieces(ids.length)} marked ${status}.`
    );
  };

  const bulkDelete = () => {
    const ids = selected;
    if (ids.length === 0) return;
    if (!pendingBulkDelete) {
      setPendingBulkDelete(true);
      window.setTimeout(() => setPendingBulkDelete(false), CONFIRM_WINDOW_MS);
      return;
    }
    setPendingBulkDelete(false);
    runAction(
      () => ids.forEach((id) => catalogService.removeProduct(id)),
      `${pieces(ids.length)} removed from your storefront.`
    );
    setSelectedIds([]);
  };

  return (
    <div className="bg-white border border-zinc-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 space-y-3 sm:space-y-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 sm:pb-4 border-b border-zinc-100 gap-1.5">
        <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Manage Catalog Items ({products.length})
        </h3>
        <span className="text-[11px] sm:text-xs text-zinc-500">
          Tap status to cycle: Available &rarr; Reserved &rarr; Sold Out
        </span>
      </div>

      {products.length === 0 ? (
        <div className="py-8 sm:py-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
            <Tag className="w-5 h-5" />
          </div>
          <div className="font-cooper text-base sm:text-lg font-bold text-zinc-900">No pieces listed yet</div>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Add your first piece and it appears in the Davao feed right away.
          </p>
          <Button type="button" onClick={onAddNew}>
            <Plus className="w-4 h-4" />
            <span>Add New Piece</span>
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = selected.length > 0 && !allSelected;
                }}
                onChange={toggleAll}
                className="w-4 h-4 accent-zinc-950 cursor-pointer"
              />
              <span>Select all</span>
            </label>
            <span className="text-[11px] text-zinc-500">
              {selected.length > 0 ? `${selected.length} of ${products.length} selected` : 'Tick pieces for bulk actions'}
            </span>
          </div>

          {selected.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 bg-zinc-950 text-white rounded-xl sm:rounded-2xl px-3.5 py-3">
              <span className="text-xs font-semibold shrink-0">{selected.length} selected</span>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400 mr-0.5">Mark as</span>
                {STATUS_ORDER.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => bulkStatus(status)}
                    className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-white/10 hover:bg-white/20 border border-white/15 transition-colors"
                  >
                    {status}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={bulkDelete}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-colors inline-flex items-center gap-1 ${
                    pendingBulkDelete ? 'bg-red-600 border-red-600 text-white' : 'bg-white/10 hover:bg-white/20 border-white/15'
                  }`}
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{pendingBulkDelete ? `Confirm delete ${selected.length}` : 'Delete selected'}</span>
                </button>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="px-2 py-1.5 text-[11px] font-semibold text-zinc-300 hover:text-white transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          <div className="divide-y divide-zinc-100">
            {products.map((item) => {
              const isSelected = selected.includes(item.id);
              const isPendingDelete = pendingDeleteId === item.id;
              return (
                <div
                  key={item.id}
                  className="py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelected(item.id)}
                      aria-label={`Select ${item.name}`}
                      className="w-4 h-4 accent-zinc-950 shrink-0 cursor-pointer"
                    />
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl object-cover border border-zinc-200 shadow-sm shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-cooper font-bold text-sm text-zinc-950 truncate">{item.name}</h4>
                      <div className="text-[11px] sm:text-xs text-zinc-500 mt-0.5 truncate">
                        ₱{item.price.toLocaleString()} • Size {item.size} •{' '}
                        {item.isOneOfOne ? '1-of-1' : `${item.availableQuantity} in stock`}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 sm:justify-end pl-7 sm:pl-0">
                    <span className="text-[11px] text-zinc-500">{item.saveCount} saves</span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => cycleStatus(item)}
                        className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-[11px] sm:text-xs font-semibold transition-all border ${statusClass(item.status)}`}
                      >
                        {item.status}
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        aria-label={`Edit ${item.name}`}
                        title="Edit"
                        className={rowButtonClass}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDuplicate(item)}
                        aria-label={`Duplicate ${item.name}`}
                        title="Duplicate"
                        className={rowButtonClass}
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Duplicate</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteProduct(item)}
                        aria-label={isPendingDelete ? `Confirm delete ${item.name}` : `Delete ${item.name}`}
                        className={`h-8 rounded-full flex items-center justify-center gap-1 border text-[11px] font-semibold transition-all ${
                          isPendingDelete
                            ? 'px-3 bg-red-600 text-white border-red-600'
                            : 'w-8 bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {isPendingDelete && <span>Confirm</span>}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
