import React, { useState, useEffect } from 'react';
import type { Product, Moodboard } from '../../types/fashion';
import { storageService } from '../../services/storageService';
import { CustomPinIcon } from '../common/CustomIcons';
import { X, Plus, Check } from 'lucide-react';

interface PinToMoodboardModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onMoodboardUpdated?: () => void;
}

export const PinToMoodboardModal: React.FC<PinToMoodboardModalProps> = ({
  product,
  isOpen,
  onClose,
  onMoodboardUpdated,
}) => {
  const [moodboards, setMoodboards] = useState<Moodboard[]>([]);
  const [pinnedBoardIds, setPinnedBoardIds] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [newBoardName, setNewBoardName] = useState<string>('');
  const [newBoardDesc, setNewBoardDesc] = useState<string>('');
  const [pinCount, setPinCount] = useState<number>(0);

  useEffect(() => {
    if (product && isOpen) {
      const boards = storageService.getMoodboards();
      setMoodboards(boards);
      setPinnedBoardIds(storageService.getProductMoodboardIds(product.id));
      setPinCount(storageService.getPinCountForProduct(product.id));
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const handleToggleBoard = (boardId: string) => {
    const isNowPinned = storageService.togglePinToMoodboard(boardId, product.id);
    if (isNowPinned) {
      setPinnedBoardIds((prev) => [...prev, boardId]);
      setPinCount((prev) => prev + 1);
    } else {
      setPinnedBoardIds((prev) => prev.filter((id) => id !== boardId));
      setPinCount((prev) => Math.max(1, prev - 1));
    }
    const updatedBoards = storageService.getMoodboards();
    setMoodboards(updatedBoards);
    if (onMoodboardUpdated) onMoodboardUpdated();
  };

  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    const created = storageService.createMoodboard(newBoardName.trim(), newBoardDesc.trim());
    storageService.togglePinToMoodboard(created.id, product.id);
    setMoodboards(storageService.getMoodboards());
    setPinnedBoardIds((prev) => [...prev, created.id]);
    setPinCount((prev) => prev + 1);
    setNewBoardName('');
    setNewBoardDesc('');
    setIsCreating(false);
    if (onMoodboardUpdated) onMoodboardUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A2225]/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#F8F9EA] border border-[#E6DCC0] rounded-3xl shadow-2xl overflow-hidden font-sans space-y-0 text-[#1A2225]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6DCC0] bg-[#FFF9E9]">
          <div className="flex items-center gap-2">
            <CustomPinIcon className="w-5 h-5 text-[#1A2225]" />
            <h2 className="font-outfit text-lg font-bold text-[#1A2225]">
              Save to Moodboard
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#E8DFC6] text-[#55615D] hover:text-[#1A2225] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product Snapshot */}
        <div className="p-4 bg-[#F3ECD8] border-b border-[#E6DCC0] flex items-center gap-3">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-14 h-14 rounded-xl object-cover border border-[#E6DCC0] shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h3 className="font-cooper text-sm font-semibold text-[#1A2225] truncate">
              {product.name}
            </h3>
            <div className="text-xs text-[#55615D] font-mono mt-0.5">
              ₱{product.price.toLocaleString()} • Size {product.size}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#1A2225] font-semibold">
              <CustomPinIcon className="w-3 h-3 text-[#1A2225]" />
              <span>Pinned to {pinCount} Davao Moodboards</span>
            </div>
          </div>
        </div>

        {/* Board List */}
        <div className="p-4 space-y-3 max-h-[260px] overflow-y-auto">
          <div className="text-xs font-semibold text-[#55615D] uppercase tracking-wider">
            Your Davao Moodboards
          </div>

          {moodboards.map((board) => {
            const isPinned = pinnedBoardIds.includes(board.id);
            return (
              <div
                key={board.id}
                onClick={() => handleToggleBoard(board.id)}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                  isPinned
                    ? 'bg-[#FFF9E9] border-[#1A2225] shadow-sm'
                    : 'bg-[#F8F9EA] border-[#E6DCC0] hover:border-[#1A2225]/40 hover:bg-[#FFF9E9]'
                }`}
              >
                <div className="min-w-0 pr-3">
                  <div className="font-outfit text-sm font-bold text-[#1A2225] truncate">
                    {board.name}
                  </div>
                  <div className="text-xs text-[#55615D] truncate">
                    {board.productIds.length} pinned items
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                    isPinned
                      ? 'bg-[#1A2225] border-[#1A2225] text-[#FFF9E9]'
                      : 'border-[#E6DCC0] text-transparent hover:border-[#1A2225]'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer / Create Board Trigger */}
        <div className="p-4 border-t border-[#E6DCC0] bg-[#FFF9E9]">
          {!isCreating ? (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full py-2.5 px-4 bg-[#1A2225] text-[#FFF9E9] font-semibold text-xs rounded-full hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Moodboard</span>
            </button>
          ) : (
            <form onSubmit={handleCreateBoard} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#1A2225] mb-1">
                  Moodboard Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vintage Denim Inspo"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F8F9EA] border border-[#E6DCC0] rounded-xl text-[#1A2225] focus:outline-none focus:border-[#1A2225]"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A2225] mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. My favorite 90s streetwear grails"
                  value={newBoardDesc}
                  onChange={(e) => setNewBoardDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F8F9EA] border border-[#E6DCC0] rounded-xl text-[#1A2225] focus:outline-none focus:border-[#1A2225]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 bg-[#1A2225] text-[#FFF9E9] text-xs font-semibold rounded-full hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Create & Pin
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-2 text-xs font-semibold text-[#55615D] hover:text-[#1A2225] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
