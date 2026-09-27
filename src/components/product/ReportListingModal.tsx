import React, { useId, useState } from 'react';
import { Flag } from 'lucide-react';
import type { Product, ReportReason } from '../../types/fashion';
import { catalogService } from '../../services/catalogService';
import { Alert, Button, Field, inputClass } from '../common/FormControls';
import { DetailSheet } from './DetailSheet';

interface ReportListingModalProps {
  product: Product;
  onClose: () => void;
}

const REASONS: { id: ReportReason; label: string }[] = [
  { id: 'counterfeit', label: 'Fake or replica' },
  { id: 'scam', label: 'Seller asks for payment outside Habi rules' },
  { id: 'wrong-photos', label: 'Photos do not match the piece' },
  { id: 'prohibited', label: 'Prohibited item' },
  { id: 'other', label: 'Something else' },
];

const NOTE_MAX = 300;

export const ReportListingModal: React.FC<ReportListingModalProps> = ({ product, onClose }) => {
  const groupName = useId();
  const noteId = useId();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!reason) {
      setError('Choose a reason first.');
      return;
    }
    if (reason === 'other' && note.trim().length === 0) {
      setError('Tell us what is wrong with this listing.');
      return;
    }
    catalogService.addReport({
      productId: product.id,
      productName: product.name,
      sellerId: product.sellerId,
      reason,
      note: note.trim(),
    });
    setIsSubmitted(true);
  };

  return (
    <DetailSheet eyebrow="Report listing" title={product.name} onClose={onClose}>
      {isSubmitted ? (
        <div className="space-y-4">
          <Alert tone="success">Thanks. A Habi admin will review this listing.</Alert>
          <Button type="button" onClick={onClose} className="w-full">
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold text-zinc-700 mb-2">What is wrong with this listing?</legend>
            {REASONS.map((option) => {
              const isSelected = reason === option.id;
              return (
                <label
                  key={option.id}
                  className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-colors ${
                    isSelected ? 'border-zinc-950 bg-zinc-50' : 'border-zinc-200/80 bg-white hover:bg-zinc-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={groupName}
                    value={option.id}
                    checked={isSelected}
                    onChange={() => {
                      setReason(option.id);
                      setError(null);
                    }}
                    className="w-4 h-4 accent-zinc-950 shrink-0"
                  />
                  <span className="text-xs font-medium text-zinc-900">{option.label}</span>
                </label>
              );
            })}
          </fieldset>

          <Field
            label="Details"
            htmlFor={noteId}
            required={reason === 'other'}
            error={error}
            hint={`${note.length}/${NOTE_MAX}. Anything that helps an admin check the listing.`}
          >
            <textarea
              id={noteId}
              value={note}
              onChange={(event) => {
                setNote(event.target.value.slice(0, NOTE_MAX));
                if (error) setError(null);
              }}
              maxLength={NOTE_MAX}
              rows={3}
              placeholder={reason === 'other' ? 'Describe the problem' : 'Optional'}
              className={`${inputClass} resize-none`}
            />
          </Field>

          <Button type="submit" className="w-full">
            <Flag className="w-4 h-4" />
            Send report
          </Button>
        </form>
      )}
    </DetailSheet>
  );
};
