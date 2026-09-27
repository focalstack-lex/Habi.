import React, { useState } from 'react';
import { ArrowLeft, Check, Copy, Layers, Link2, Pencil, Plus, Trash2, X } from 'lucide-react';
import type { OutfitBoard, Product } from '../../types/fashion';
import { catalogService } from '../../services/catalogService';
import { slugify, userPrefsService } from '../../services/userPrefsService';
import { absoluteUrl, buildHash } from '../../utils/router';
import { Button, inputClass } from '../common/FormControls';

interface BoardsTabProps {
  boards: OutfitBoard[];
  onSelectProduct: (product: Product) => void;
}

export const BoardsTab: React.FC<BoardsTabProps> = ({ boards, onSelectProduct }) => {
  const [openBoardId, setOpenBoardId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const visible = catalogService.getVisibleProducts();
  const productsOf = (board: OutfitBoard) =>
    board.productIds.map((id) => visible.find((p) => p.id === id)).filter((p): p is Product => Boolean(p));

  const shareLink = (board: OutfitBoard) =>
    absoluteUrl(buildHash(`/board/${slugify(board.name)}`, { name: board.name, items: board.productIds.join(',') }));

  const copyLink = async (board: OutfitBoard) => {
    try {
      await navigator.clipboard.writeText(shareLink(board));
      setCopiedId(board.id);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setCopiedId(null);
    }
  };

  const openBoard = boards.find((b) => b.id === openBoardId) ?? null;

  if (openBoard) {
    const products = productsOf(openBoard);
    return (
      <div className="space-y-4 font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button type="button" onClick={() => setOpenBoardId(null)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#55615D] hover:text-[#1A2225] cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
            <span>All boards</span>
          </button>
          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" onClick={() => copyLink(openBoard)} className="px-3.5 py-2 text-[11px]">
              {copiedId === openBoard.id ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
              <span>{copiedId === openBoard.id ? 'Link copied' : 'Copy share link'}</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {renaming?.id === openBoard.id ? (
            <form
              className="flex items-center gap-2 flex-1"
              onSubmit={(e) => {
                e.preventDefault();
                userPrefsService.renameBoard(openBoard.id, renaming.name);
                setRenaming(null);
              }}
            >
              <input value={renaming.name} onChange={(e) => setRenaming({ id: openBoard.id, name: e.target.value })} className={inputClass} autoFocus />
              <Button type="submit" className="px-3.5 py-2">Save</Button>
            </form>
          ) : (
            <>
              <h2 className="font-cooper text-xl sm:text-2xl font-bold text-[#1A2225] truncate">{openBoard.name}</h2>
              <button type="button" onClick={() => setRenaming({ id: openBoard.id, name: openBoard.name })} aria-label="Rename board" className="p-1.5 rounded-full text-[#55615D] hover:text-[#1A2225] hover:bg-[#F3ECD8] cursor-pointer">
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        {products.length === 0 ? (
          <div className="p-6 sm:p-10 bg-[#FFF9E9] border border-[#E6DCC0] rounded-2xl sm:rounded-3xl text-center space-y-2 shadow-sm">
            <div className="font-cooper text-base font-bold text-[#1A2225]">Empty board</div>
            <p className="text-xs text-[#55615D]">Open any piece and tap the board icon to add it here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {products.map((product) => (
              <div key={product.id} className="relative group">
                <button type="button" onClick={() => onSelectProduct(product)} className="w-full text-left bg-[#FFF9E9] border border-[#E6DCC0] rounded-2xl p-2 sm:p-3 hover:shadow-md transition-all cursor-pointer">
                  <div className="aspect-[3/4] bg-[#F3ECD8] rounded-xl overflow-hidden">
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="mt-2 text-xs font-semibold text-[#1A2225] truncate">{product.name}</div>
                  <div className="text-[11px] text-[#55615D]">₱{product.price.toLocaleString()} • {product.sellerName}</div>
                </button>
                <button
                  type="button"
                  onClick={() => userPrefsService.toggleInBoard(openBoard.id, product.id)}
                  aria-label="Remove from board"
                  className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[#FFF9E9] border border-[#E6DCC0] text-[#1A2225] flex items-center justify-center shadow hover:text-red-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!newName.trim()) return;
          const board = userPrefsService.createBoard(newName);
          setNewName('');
          setOpenBoardId(board.id);
        }}
        className="flex items-center gap-2"
      >
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New board, e.g. Weekend market fit" className={inputClass} />
        <Button type="submit" className="shrink-0 px-4 py-2.5">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Create</span>
        </Button>
      </form>

      {boards.length === 0 ? (
        <div className="p-6 sm:p-12 bg-[#FFF9E9] border border-[#E6DCC0] rounded-2xl sm:rounded-3xl text-center space-y-3 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-[#F3ECD8] flex items-center justify-center mx-auto text-[#1A2225]">
            <Layers className="w-6 h-6" />
          </div>
          <div className="font-cooper text-base sm:text-lg font-bold text-[#1A2225]">No outfit boards yet</div>
          <p className="text-xs sm:text-sm text-[#55615D] max-w-sm mx-auto">
            Group saved pieces into looks and share one link with friends or the seller.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {boards.map((board) => {
            const products = productsOf(board);
            return (
              <div key={board.id} className="bg-[#FFF9E9] border border-[#E6DCC0] rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-sm space-y-3">
                <button type="button" onClick={() => setOpenBoardId(board.id)} className="w-full text-left cursor-pointer">
                  <div className="grid grid-cols-4 gap-1.5 aspect-[4/2] rounded-xl overflow-hidden bg-[#F3ECD8]">
                    {[0, 1, 2, 3].map((slot) => {
                      const product = products[slot];
                      return product ? (
                        <img key={slot} src={product.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div key={slot} className="w-full h-full bg-[#E6DCC0]/40" />
                      );
                    })}
                  </div>
                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <span className="font-cooper font-bold text-sm sm:text-base text-[#1A2225] truncate">{board.name}</span>
                    <span className="text-[11px] text-[#55615D] shrink-0">{products.length} pieces</span>
                  </div>
                </button>
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => copyLink(board)} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F3ECD8] text-[#1A2225] text-[11px] font-semibold hover:bg-[#E8DFC6] cursor-pointer">
                    {copiedId === board.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === board.id ? 'Copied' : 'Share link'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (pendingDelete === board.id) {
                        userPrefsService.deleteBoard(board.id);
                        setPendingDelete(null);
                      } else {
                        setPendingDelete(board.id);
                        window.setTimeout(() => setPendingDelete((id) => (id === board.id ? null : id)), 3000);
                      }
                    }}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold border cursor-pointer ${
                      pendingDelete === board.id ? 'bg-red-600 text-white border-red-600' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{pendingDelete === board.id ? 'Confirm' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
