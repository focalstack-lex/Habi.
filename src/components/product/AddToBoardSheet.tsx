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
        <label htmlFor={inputId} className="block text-xs font-semibold text-[#1A2225]">
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
            className="shrink-0 inline-flex items-center gap-1.5 bg-[#1A2225] text-[#FFF9E9] text-xs font-semibold px-4 py-2.5 rounded-full disabled:opacity-40 transition-opacity cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Create
          </button>
        </div>
      </form>

      {boards.length === 0 ? (
        <p className="text-xs text-[#55615D] leading-relaxed">Boards group saved pieces into looks you can share.</p>
      ) : (
        <ul className="space-y-2">
          {boards.map((board) => {
            const isOn = board.productIds.includes(product.id);
            return (
              <li key={board.id}>
                <label
                  className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-colors ${
                    isOn ? 'border-[#1A2225] bg-[#FFF9E9]' : 'border-[#E6DCC0] bg-[#F3ECD8] hover:bg-[#E8DFC6]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isOn}
                    onChange={() => userPrefsService.toggleInBoard(board.id, product.id)}
                    className="w-4 h-4 accent-[#1A2225] shrink-0 cursor-pointer"
                  />
                  <span className="flex-1 min-w-0">
                    <span className="block text-xs font-semibold text-[#1A2225] truncate">{board.name}</span>
                    <span className="block text-[11px] text-[#55615D]">
                      {board.productIds.length} {board.productIds.length === 1 ? 'piece' : 'pieces'}
                    </span>
                  </span>
                  {isOn && <Check className="w-4 h-4 text-[#1A2225] shrink-0" />}
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </DetailSheet>
  );
};
