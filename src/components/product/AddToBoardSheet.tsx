import React, { useId, useState } from 'react';
import { Check, Plus } from 'lucide-react';
import type { Product } from '../../types/fashion';
import { userPrefsService } from '../../services/userPrefsService';
import { usePrefsVersion } from '../../hooks/usePrefsVersion';
import { inputClass } from '../common/FormControls';
import { DetailSheet } from './DetailSheet';

interface AddToBoardSheetProps {
  product: Product;
  onClose: () => void;
}

const NAME_MAX = 40;

export const AddToBoardSheet: React.FC<AddToBoardSheetProps> = ({ product, onClose }) => {
  usePrefsVersion();
  const inputId = useId();
  const [newName, setNewName] = useState('');
  const boards = userPrefsService.getBoards();
  const canCreate = newName.trim().length > 0;

  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canCreate) return;
    userPrefsService.createBoard(newName, [product.id]);
    setNewName('');
  };

  return (
    <DetailSheet eyebrow="Outfit boards" title="Add to a board" onClose={onClose}>
      <form onSubmit={handleCreate} className="space-y-1.5">
        <label htmlFor={inputId} className="block text-xs font-semibold text-zinc-700">
          New board
        </label>
        <div className="flex items-center gap-2">
          <input
            id={inputId}
            value={newName}
            onChange={(event) => setNewName(event.target.value.slice(0, NAME_MAX))}
            maxLength={NAME_MAX}
            placeholder="e.g. Rainy season fits"
            className={inputClass}
          />
          <button
            type="submit"
            disabled={!canCreate}
            className="shrink-0 inline-flex items-center gap-1.5 bg-zinc-950 text-white text-xs font-semibold px-4 py-2.5 rounded-full disabled:opacity-40 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            Create
          </button>
        </div>
      </form>

      {boards.length === 0 ? (
        <p className="text-xs text-zinc-500 leading-relaxed">Boards group saved pieces into looks you can share.</p>
      ) : (
        <ul className="space-y-2">
          {boards.map((board) => {
            const isOn = board.productIds.includes(product.id);
            return (
              <li key={board.id}>
                <label
                  className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-colors ${
                    isOn ? 'border-zinc-950 bg-zinc-50' : 'border-zinc-200/80 bg-white hover:bg-zinc-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isOn}
                    onChange={() => userPrefsService.toggleInBoard(board.id, product.id)}
                    className="w-4 h-4 accent-zinc-950 shrink-0"
                  />
                  <span className="flex-1 min-w-0">
                    <span className="block text-xs font-semibold text-zinc-950 truncate">{board.name}</span>
                    <span className="block text-[11px] text-zinc-500">
                      {board.productIds.length} {board.productIds.length === 1 ? 'piece' : 'pieces'}
                    </span>
                  </span>
                  {isOn && <Check className="w-4 h-4 text-zinc-950 shrink-0" />}
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </DetailSheet>
  );
};
