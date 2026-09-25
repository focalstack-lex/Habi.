import React, { useState } from 'react';
import { Check, Copy, MessageSquare, Pencil, Plus, Trash2 } from 'lucide-react';
import type { Product, ReplyTemplate, Seller } from '../../../types/fashion';
import { makeCatalogId } from '../../../services/catalogService';
import { Alert, Button, Field, inputClass } from '../../common/FormControls';

interface TemplatesTabProps {
  seller: Seller;
  products: Product[];
}

type PlaceholderKey = 'buyer' | 'piece' | 'price' | 'location';

const PLACEHOLDER_KEYS: PlaceholderKey[] = ['buyer', 'piece', 'price', 'location'];

const DEFAULT_TEMPLATES: Omit<ReplyTemplate, 'id'>[] = [
  {
    name: 'Still available',
    text: 'Hi {buyer}! Yes, {piece} (₱{price}) is still available. Pickup in {location} or ship via J&T. Reserve with 20% via GCash?',
  },
  {
    name: 'Reserved for you',
    text: 'Reserved {piece} for you until tomorrow 8 PM. Send the 20% via GCash to lock it in, thanks {buyer}!',
  },
  {
    name: 'Sold out',
    text: 'Sorry {buyer}, {piece} just got claimed. Follow the store, restocks drop every Friday.',
  },
];

interface TemplateDraft {
  name: string;
  text: string;
}

const EMPTY_DRAFT: TemplateDraft = { name: '', text: '' };
const CONFIRM_WINDOW_MS = 4000;
const COPIED_MS = 2000;

// Storage helpers. This file is the only place that reads or writes the templates key.

function storageKey(sellerId: string): string {
  return `habi_reply_templates_${sellerId}`;
}

function isTemplate(value: unknown): value is ReplyTemplate {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.id === 'string' && typeof candidate.name === 'string' && typeof candidate.text === 'string';
}

function saveTemplates(sellerId: string, templates: ReplyTemplate[]): void {
  try {
    localStorage.setItem(storageKey(sellerId), JSON.stringify(templates));
  } catch {
    // Storage full or blocked: the in-memory list still works for this session.
  }
}

/** Reads the seller's templates, seeding the defaults the first time the key is missing. */
function loadTemplates(sellerId: string): ReplyTemplate[] {
  try {
    const raw = localStorage.getItem(storageKey(sellerId));
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter(isTemplate);
    }
  } catch {
    // Corrupt value: fall through and reseed.
  }
  const seeded = DEFAULT_TEMPLATES.map((template) => ({ ...template, id: makeCatalogId('tpl') }));
  saveTemplates(sellerId, seeded);
  return seeded;
}

function fillTemplate(text: string, values: Record<PlaceholderKey, string>): string {
  return text.replace(/\{(buyer|piece|price|location)\}/g, (_match, key: string) => values[key as PlaceholderKey]);
}

export const TemplatesTab: React.FC<TemplatesTabProps> = ({ seller, products }) => {
  const [templates, setTemplates] = useState<ReplyTemplate[]>(() => loadTemplates(seller.id));
  const [newDraft, setNewDraft] = useState<TemplateDraft>(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<TemplateDraft>(EMPTY_DRAFT);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const firstPiece = products[0];
  const sampleValues: Record<PlaceholderKey, string> = {
    buyer: 'Ana',
    piece: firstPiece?.name ?? 'your piece',
    price: (firstPiece?.price ?? 1250).toLocaleString(),
    location: seller.location.city,
  };

  const persist = (next: ReplyTemplate[]) => {
    setTemplates(next);
    saveTemplates(seller.id, next);
  };

  const validate = (draft: TemplateDraft): string | null => {
    if (!draft.name.trim()) return 'Name the template so you can find it fast.';
    if (draft.text.trim().length < 10) return 'Write the reply text (at least 10 characters).';
    return null;
  };

  const addTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    const problem = validate(newDraft);
    if (problem) return setError(problem);
    setError(null);
    persist([{ id: makeCatalogId('tpl'), name: newDraft.name.trim(), text: newDraft.text.trim() }, ...templates]);
    setNewDraft(EMPTY_DRAFT);
  };

  const insertPlaceholder = (key: PlaceholderKey) => {
    setNewDraft((prev) => ({
      ...prev,
      text: `${prev.text}${prev.text && !prev.text.endsWith(' ') ? ' ' : ''}{${key}}`,
    }));
  };

  const startEdit = (template: ReplyTemplate) => {
    setEditingId(template.id);
    setEditDraft({ name: template.name, text: template.text });
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setError(null);
  };

  const saveEdit = () => {
    const problem = validate(editDraft);
    if (problem) return setError(problem);
    setError(null);
    persist(
      templates.map((template) =>
        template.id === editingId ? { ...template, name: editDraft.name.trim(), text: editDraft.text.trim() } : template
      )
    );
    setEditingId(null);
  };

  const deleteTemplate = (id: string) => {
    if (pendingDeleteId !== id) {
      setPendingDeleteId(id);
      window.setTimeout(() => setPendingDeleteId((pending) => (pending === id ? null : pending)), CONFIRM_WINDOW_MS);
      return;
    }
    setPendingDeleteId(null);
    if (editingId === id) setEditingId(null);
    persist(templates.filter((template) => template.id !== id));
  };

  const copyTemplate = async (template: ReplyTemplate) => {
    const filled = fillTemplate(template.text, sampleValues);
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(filled);
      setError(null);
      setCopiedId(template.id);
      window.setTimeout(() => setCopiedId((id) => (id === template.id ? null : id)), COPIED_MS);
    } catch {
      setError('Could not copy automatically. Long-press the text to copy it by hand.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 items-start">
      <form
        onSubmit={addTemplate}
        noValidate
        className="lg:col-span-2 bg-white border border-zinc-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-4 shadow-sm"
      >
        <div className="border-b border-zinc-100 pb-3 sm:pb-4">
          <h3 className="font-cooper text-lg sm:text-xl font-bold text-zinc-950">New template</h3>
          <p className="text-[11px] sm:text-xs text-zinc-500 mt-0.5">Quick replies for Instagram and Messenger DMs.</p>
        </div>

        {error && <Alert tone="error">{error}</Alert>}

        <Field label="Name" htmlFor="tpl-name" required>
          <input
            id="tpl-name"
            type="text"
            value={newDraft.name}
            onChange={(e) => {
              setNewDraft({ ...newDraft, name: e.target.value });
              setError(null);
            }}
            placeholder="e.g. Meetup details"
            className={inputClass}
          />
        </Field>

        <Field label="Reply text" htmlFor="tpl-text" required hint="Placeholders are swapped for real values when you copy.">
          <textarea
            id="tpl-text"
            rows={4}
            value={newDraft.text}
            onChange={(e) => {
              setNewDraft({ ...newDraft, text: e.target.value });
              setError(null);
            }}
            placeholder="Hi {buyer}! {piece} is ready for pickup in {location}."
            className={`${inputClass} resize-none`}
          />
        </Field>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mr-0.5">Insert</span>
          {PLACEHOLDER_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => insertPlaceholder(key)}
              className="px-2.5 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-[11px] font-semibold font-mono text-zinc-700 hover:bg-zinc-200 transition-colors"
            >
              {`{${key}}`}
            </button>
          ))}
        </div>

        <Button type="submit" className="w-full">
          <Plus className="w-4 h-4" />
          <span>Add Template</span>
        </Button>
      </form>

      <div className="lg:col-span-3 bg-white border border-zinc-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-3 sm:space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-3 sm:pb-4 border-b border-zinc-100">
          <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Your templates ({templates.length})
          </h3>
          <span className="text-[11px] sm:text-xs text-zinc-500">
            Copy fills in: {sampleValues.buyer}, {sampleValues.piece}, ₱{sampleValues.price}, {sampleValues.location}
          </span>
        </div>

        {templates.length === 0 ? (
          <div className="py-8 sm:py-10 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="font-cooper text-base font-bold text-zinc-900">No templates yet</div>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">Add one and copy it into any DM in one tap.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {templates.map((template) => {
              const isEditing = editingId === template.id;
              const isCopied = copiedId === template.id;
              const isPendingDelete = pendingDeleteId === template.id;
              return (
                <div key={template.id} className="py-3.5 sm:py-4 space-y-2">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editDraft.name}
                        onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                        aria-label="Template name"
                        className={inputClass}
                      />
                      <textarea
                        rows={3}
                        value={editDraft.text}
                        onChange={(e) => setEditDraft({ ...editDraft, text: e.target.value })}
                        aria-label="Template text"
                        className={`${inputClass} resize-none`}
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" onClick={saveEdit} className="px-4 py-2">
                          <Check className="w-4 h-4" />
                          <span>Save</span>
                        </Button>
                        <Button type="button" variant="secondary" onClick={cancelEdit} className="px-4 py-2">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <h4 className="font-cooper font-bold text-sm text-zinc-950">{template.name}</h4>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => void copyTemplate(template)}
                            className={`h-8 px-3 rounded-full inline-flex items-center gap-1.5 text-[11px] font-semibold border transition-all ${
                              isCopied
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-200'
                                : 'bg-zinc-950 text-white border-zinc-950 hover:bg-zinc-800'
                            }`}
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{isCopied ? 'Copied' : 'Copy'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => startEdit(template)}
                            aria-label={`Edit ${template.name}`}
                            title="Edit"
                            className="h-8 w-8 rounded-full inline-flex items-center justify-center border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteTemplate(template.id)}
                            aria-label={isPendingDelete ? `Confirm delete ${template.name}` : `Delete ${template.name}`}
                            className={`h-8 rounded-full inline-flex items-center justify-center gap-1 border text-[11px] font-semibold transition-all ${
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
                      <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">{template.text}</p>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
