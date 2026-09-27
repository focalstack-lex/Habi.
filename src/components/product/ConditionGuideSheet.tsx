import React from 'react';
import type { Product } from '../../types/fashion';
import { DetailSheet } from './DetailSheet';

interface ConditionGuideSheetProps {
  product: Product;
  onClose: () => void;
  /** Opens the zoom viewer on the tapped flaw photo. */
  onOpenFlawPhoto?: (index: number) => void;
}

const GRADES: { grade: Product['condition']; summary: string }[] = [
  { grade: 'Brand New', summary: 'Unworn, with tags or deadstock.' },
  { grade: 'Like New', summary: 'Worn once or twice, no visible wear.' },
  { grade: 'Good Vintage', summary: 'Honest age, light fading or softening, no holes.' },
  { grade: 'Fair', summary: 'Visible flaws priced accordingly, shown in photos.' },
];

const eyebrowClass = 'font-avantgarde text-[11px] tracking-wider uppercase font-semibold text-zinc-500';

export const ConditionGuideSheet: React.FC<ConditionGuideSheetProps> = ({ product, onClose, onOpenFlawPhoto }) => {
  const flawPhotos = product.flawPhotos ?? [];
  const notes = product.conditionNotes?.trim() ?? '';

  return (
    <DetailSheet eyebrow="Condition guide" title="How Habi grades a piece" onClose={onClose}>
      <ul className="space-y-2">
        {GRADES.map(({ grade, summary }) => {
          const isCurrent = grade === product.condition;
          return (
            <li
              key={grade}
              className={`rounded-2xl border p-3.5 ${isCurrent ? 'border-zinc-950 bg-zinc-50' : 'border-zinc-200/80 bg-white'}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-zinc-950">{grade}</span>
                {isCurrent && (
                  <span className="px-2 py-0.5 bg-zinc-950 text-white text-[11px] font-semibold rounded-full">This piece</span>
                )}
              </div>
              <p className="text-xs text-zinc-600 mt-1 leading-relaxed">{summary}</p>
            </li>
          );
        })}
      </ul>

      {flawPhotos.length > 0 && (
        <div className="space-y-2">
          <h3 className={eyebrowClass}>Flaw photos</h3>
          <div className="grid grid-cols-2 gap-3">
            {flawPhotos.map((flaw, idx) => (
              <button
                key={`${idx}-${flaw.imageUrl}`}
                type="button"
                onClick={() => onOpenFlawPhoto?.(idx)}
                className="text-left space-y-1.5 group"
              >
                <div className="aspect-square rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100">
                  <img
                    src={flaw.imageUrl}
                    alt={flaw.note || `Flaw photo ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                {flaw.note && <p className="text-[11px] text-zinc-600 leading-snug">{flaw.note}</p>}
              </button>
            ))}
          </div>
        </div>
      )}

      {notes && (
        <div className="space-y-1">
          <h3 className={eyebrowClass}>Notes from the seller</h3>
          <p className="text-xs text-zinc-700 leading-relaxed">{notes}</p>
        </div>
      )}
    </DetailSheet>
  );
};
