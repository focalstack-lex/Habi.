import React, { useState } from 'react';
import { Plus, Ruler, Save } from 'lucide-react';
import type { FlawPhoto, Measurements, Product, Seller } from '../../../types/fashion';
import { formatSellerLocation, makeCatalogId } from '../../../services/catalogService';
import { measurementFieldsFor } from '../../../utils/sizing';
import { AESTHETIC_OPTIONS, CATEGORY_OPTIONS } from '../../feed/AestheticFilterBar';
import { Alert, Button, Field, inputClass, labelClass } from '../../common/FormControls';
import { ImageUploadField } from '../../common/ImageUploadField';

export type PieceFormMode = 'add' | 'edit' | 'duplicate';

/** The fields a seller edits; everything else on a Product is system-owned. */
export type EditablePieceFields = Pick<
  Product,
  | 'name'
  | 'price'
  | 'images'
  | 'description'
  | 'category'
  | 'condition'
  | 'size'
  | 'availableQuantity'
  | 'isOneOfOne'
  | 'sizes'
  | 'tags'
  | 'aesthetics'
  | 'measurements'
  | 'conditionNotes'
  | 'flawPhotos'
>;

interface PieceFormProps {
  seller: Seller;
  mode: PieceFormMode;
  /** Piece being edited or copied. Ignored in add mode. */
  initialProduct?: Product;
  /** `product` is the full record to publish; `patch` is the editable subset for in-place updates. */
  onSubmit: (product: Product, patch: EditablePieceFields) => void;
  onCancel?: () => void;
}

const CONDITIONS: Product['condition'][] = ['Brand New', 'Like New', 'Good Vintage', 'Fair'];
const SELLER_CATEGORIES = CATEGORY_OPTIONS.filter((c) => c !== 'All');
const SELLER_AESTHETICS = AESTHETIC_OPTIONS.filter((a) => a !== 'All');
const PHOTO_SLOTS = 3;
const FLAW_SLOTS = 3;

const COPY: Record<PieceFormMode, { heading: string; submit: string }> = {
  add: { heading: 'Add New Fashion Piece to Storefront', submit: 'Publish Piece to Davao Storefront' },
  edit: { heading: 'Edit Piece', submit: 'Save Changes' },
  duplicate: { heading: 'Duplicate Piece', submit: 'Publish Copy to Storefront' },
};

const compactInputClass =
  'w-full bg-zinc-50 border border-zinc-200/80 rounded-xl px-3 py-2 text-xs text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950/20 focus:bg-white font-sans';

type MeasurementDraft = Partial<Record<keyof Measurements, string>>;

interface FlawDraft {
  imageUrl: string;
  note: string;
}

interface PieceDraft {
  name: string;
  price: string;
  category: string;
  condition: Product['condition'];
  isOneOfOne: boolean;
  size: string;
  sizes: string;
  quantity: string;
  aesthetics: string[];
  description: string;
  tags: string;
  images: string[];
  measurements: MeasurementDraft;
  conditionNotes: string;
  flawPhotos: FlawDraft[];
}

function padSlots<T>(items: T[], size: number, empty: () => T): T[] {
  const padded = items.slice(0, size);
  while (padded.length < size) padded.push(empty());
  return padded;
}

const emptyFlaw = (): FlawDraft => ({ imageUrl: '', note: '' });

function emptyDraft(): PieceDraft {
  return {
    name: '',
    price: '',
    category: SELLER_CATEGORIES[0],
    condition: 'Good Vintage',
    isOneOfOne: true,
    size: 'Medium',
    sizes: '',
    quantity: '1',
    aesthetics: [],
    description: '',
    tags: '',
    images: padSlots([], PHOTO_SLOTS, () => ''),
    measurements: {},
    conditionNotes: '',
    flawPhotos: padSlots([], FLAW_SLOTS, emptyFlaw),
  };
}

function draftFromProduct(product: Product, mode: PieceFormMode): PieceDraft {
  const measurements: MeasurementDraft = {};
  for (const [key, value] of Object.entries(product.measurements ?? {})) {
    if (typeof value === 'number' && value > 0) measurements[key as keyof Measurements] = String(value);
  }
  return {
    name: mode === 'duplicate' ? `${product.name} (copy)` : product.name,
    price: String(product.price),
    category: product.category,
    condition: product.condition,
    isOneOfOne: product.isOneOfOne,
    size: product.size,
    sizes: product.sizes?.join(', ') ?? '',
    quantity: String(product.availableQuantity),
    aesthetics: [...product.aesthetics],
    description: product.description,
    tags: product.tags.join(', '),
    images: padSlots(product.images, PHOTO_SLOTS, () => ''),
    measurements,
    conditionNotes: product.conditionNotes ?? '',
    flawPhotos: padSlots(
      (product.flawPhotos ?? []).map((flaw) => ({ imageUrl: flaw.imageUrl, note: flaw.note })),
      FLAW_SLOTS,
      emptyFlaw
    ),
  };
}

export const PieceForm: React.FC<PieceFormProps> = ({ seller, mode, initialProduct, onSubmit, onCancel }) => {
  const [form, setForm] = useState<PieceDraft>(() =>
    mode !== 'add' && initialProduct ? draftFromProduct(initialProduct, mode) : emptyDraft()
  );
  const [error, setError] = useState<string | null>(null);

  const measurementFields = measurementFieldsFor(form.category);
  const categoryOptions = SELLER_CATEGORIES.includes(form.category)
    ? SELLER_CATEGORIES
    : [form.category, ...SELLER_CATEGORIES];

  const update = <K extends keyof PieceDraft>(key: K, value: PieceDraft[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const toggleAesthetic = (aesthetic: string) => {
    update(
      'aesthetics',
      form.aesthetics.includes(aesthetic)
        ? form.aesthetics.filter((a) => a !== aesthetic)
        : [...form.aesthetics, aesthetic]
    );
  };

  const updateMeasurement = (key: keyof Measurements, value: string) => {
    update('measurements', { ...form.measurements, [key]: value });
  };

  const updateFlaw = (index: number, patch: Partial<FlawDraft>) => {
    update(
      'flawPhotos',
      form.flawPhotos.map((flaw, i) => (i === index ? { ...flaw, ...patch } : flaw))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(form.price);
    const images = form.images.filter(Boolean);
    if (!form.name.trim()) return setError('Give the piece a title.');
    if (!Number.isFinite(price) || price <= 0) return setError('Enter a price greater than zero.');
    if (images.length === 0) return setError('Upload at least one photo of the piece.');
    if (form.description.trim().length < 15) return setError('Describe the piece in at least 15 characters (fabric, fit, flaws).');

    const measurements: Measurements = {};
    let hasMeasurements = false;
    for (const field of measurementFields) {
      const raw = (form.measurements[field.key] ?? '').trim();
      if (!raw) continue;
      const value = Number(raw);
      if (!Number.isFinite(value) || value <= 0) return setError(`${field.label} must be a measurement in cm greater than zero.`);
      measurements[field.key] = Math.round(value * 10) / 10;
      hasMeasurements = true;
    }

    const flawPhotos: FlawPhoto[] = form.flawPhotos
      .filter((flaw) => flaw.imageUrl)
      .map((flaw) => ({ imageUrl: flaw.imageUrl, note: flaw.note.trim() }));

    const quantity = form.isOneOfOne ? 1 : Math.max(1, Math.floor(Number(form.quantity) || 1));
    const sizes = form.isOneOfOne ? undefined : form.sizes.split(',').map((s) => s.trim()).filter(Boolean);
    const firstSize = sizes && sizes.length > 0 ? sizes[0] : undefined;
    const conditionNotes = form.conditionNotes.trim();

    const edited: EditablePieceFields = {
      name: form.name.trim(),
      price: Math.round(price),
      images,
      description: form.description.trim(),
      category: form.category,
      condition: form.condition,
      size: form.isOneOfOne ? form.size.trim() || 'One Size' : firstSize ?? (form.size.trim() || 'One Size'),
      availableQuantity: quantity,
      isOneOfOne: form.isOneOfOne,
      sizes: firstSize ? sizes : undefined,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      aesthetics: form.aesthetics.length > 0 ? form.aesthetics : ['Streetwear'],
      measurements: hasMeasurements ? measurements : undefined,
      conditionNotes: conditionNotes || undefined,
      flawPhotos: flawPhotos.length > 0 ? flawPhotos : undefined,
    };

    const product: Product =
      mode === 'edit' && initialProduct
        ? { ...initialProduct, ...edited }
        : {
            id: makeCatalogId('prod'),
            sellerId: seller.id,
            sellerName: seller.name,
            sellerHandle: seller.handle,
            sellerLogo: seller.logoUrl,
            status: 'Available',
            location: formatSellerLocation(seller),
            saveCount: 0,
            viewCount: 0,
            dateAdded: new Date().toISOString().split('T')[0],
            ...edited,
          };

    onSubmit(product, edited);
    if (mode === 'add') setForm(emptyDraft());
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-zinc-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 max-w-3xl space-y-5 shadow-sm"
      noValidate
    >
      <div className="border-b border-zinc-100 pb-3 sm:pb-4">
        <h3 className="font-cooper text-lg sm:text-xl font-bold text-zinc-950">{COPY[mode].heading}</h3>
        {mode !== 'add' && initialProduct && (
          <p className="text-[11px] sm:text-xs text-zinc-500 mt-0.5">
            {mode === 'edit'
              ? `Editing ${initialProduct.name}. Status, saves, and listing date stay as they are.`
              : `Copying ${initialProduct.name} as a new listing.`}
          </p>
        )}
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <Field label="Item title" htmlFor="pf-name" required>
        <input
          id="pf-name"
          type="text"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="e.g. Vintage 1994 Carhartt Detroit Jacket"
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Field label="Price (PHP)" htmlFor="pf-price" required>
          <input
            id="pf-price"
            type="number"
            inputMode="numeric"
            min={1}
            value={form.price}
            onChange={(e) => update('price', e.target.value)}
            placeholder="1250"
            className={inputClass}
          />
        </Field>
        <Field label="Condition" htmlFor="pf-condition">
          <select
            id="pf-condition"
            value={form.condition}
            onChange={(e) => update('condition', e.target.value as Product['condition'])}
            className={inputClass}
          >
            {CONDITIONS.map((condition) => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Field label="Category" htmlFor="pf-category">
          <select
            id="pf-category"
            value={form.category}
            onChange={(e) => update('category', e.target.value)}
            className={inputClass}
          >
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </Field>
        <div className="space-y-1.5">
          <span className={labelClass}>Inventory type</span>
          <button
            type="button"
            onClick={() => update('isOneOfOne', !form.isOneOfOne)}
            className={`w-full py-2.5 sm:py-3 px-4 rounded-xl sm:rounded-2xl text-xs font-semibold transition-all border ${
              form.isOneOfOne ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm' : 'bg-zinc-100 text-zinc-950 border-zinc-200'
            }`}
          >
            {form.isOneOfOne ? '1-of-1 Thrift Piece' : 'Standard Stock'}
          </button>
        </div>
      </div>

      {form.isOneOfOne ? (
        <Field label="Size" htmlFor="pf-size" hint="As printed on the tag or measured, e.g. Large, W32 L30.">
          <input id="pf-size" type="text" value={form.size} onChange={(e) => update('size', e.target.value)} className={inputClass} />
        </Field>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Field label="Available sizes" htmlFor="pf-sizes" hint="Comma separated, e.g. Small, Medium, Large">
            <input
              id="pf-sizes"
              type="text"
              value={form.sizes}
              onChange={(e) => update('sizes', e.target.value)}
              placeholder="Small, Medium, Large"
              className={inputClass}
            />
          </Field>
          <Field label="Quantity in stock" htmlFor="pf-qty">
            <input
              id="pf-qty"
              type="number"
              inputMode="numeric"
              min={1}
              value={form.quantity}
              onChange={(e) => update('quantity', e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      )}

      <div className="space-y-1.5">
        <span className={labelClass}>Style aesthetics</span>
        <div className="flex flex-wrap gap-1.5">
          {SELLER_AESTHETICS.map((aesthetic) => {
            const isActive = form.aesthetics.includes(aesthetic);
            return (
              <button
                key={aesthetic}
                type="button"
                onClick={() => toggleAesthetic(aesthetic)}
                aria-pressed={isActive}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  isActive ? 'bg-zinc-950 text-white border-zinc-950' : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-400'
                }`}
              >
                {aesthetic}
              </button>
            );
          })}
        </div>
      </div>

      <Field label="Description" htmlFor="pf-description" required hint="Fabric, fit, and styling notes. Honest listings sell faster.">
        <textarea
          id="pf-description"
          rows={3}
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          className={`${inputClass} resize-none`}
        />
      </Field>

      <Field label="Search tags" htmlFor="pf-tags" hint="Comma separated, e.g. Carhartt, Workwear, Jacket">
        <input id="pf-tags" type="text" value={form.tags} onChange={(e) => update('tags', e.target.value)} className={inputClass} />
      </Field>

      {/* Measurements */}
      <section className="space-y-3 pt-4 border-t border-zinc-100">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="inline-flex items-center gap-1.5 font-cooper text-sm sm:text-base font-bold text-zinc-950">
            <Ruler className="w-4 h-4 text-zinc-500" aria-hidden="true" />
            Measurements
          </span>
          <span className="text-[11px] text-zinc-500">in cm, laid flat</span>
        </div>
        {measurementFields.length === 0 ? (
          <p className="text-[11px] sm:text-xs text-zinc-500">
            No garment measurements for {form.category}. Put sizing details in the description instead.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {measurementFields.map((field) => (
              <Field key={field.key} label={field.label} htmlFor={`pf-m-${field.key}`} hint={field.hint}>
                <input
                  id={`pf-m-${field.key}`}
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  min={0}
                  value={form.measurements[field.key] ?? ''}
                  onChange={(e) => updateMeasurement(field.key, e.target.value)}
                  placeholder="0"
                  className={inputClass}
                />
              </Field>
            ))}
          </div>
        )}
      </section>

      {/* Condition details */}
      <section className="space-y-4 pt-4 border-t border-zinc-100">
        <h4 className="font-cooper text-sm sm:text-base font-bold text-zinc-950">Condition details</h4>
        <Field
          label="Condition notes"
          htmlFor="pf-condition-notes"
          hint="Pilling, fading, repairs, smells. Buyers trust listings that name the flaws."
        >
          <textarea
            id="pf-condition-notes"
            rows={2}
            value={form.conditionNotes}
            onChange={(e) => update('conditionNotes', e.target.value)}
            className={`${inputClass} resize-none`}
          />
        </Field>
        <div className="space-y-1.5">
          <span className={labelClass}>
            Flaw photos <span className="text-zinc-500 font-normal">(optional, up to {FLAW_SLOTS})</span>
          </span>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {form.flawPhotos.map((flaw, index) => (
              <div key={index} className="space-y-1.5">
                <ImageUploadField
                  label={`Flaw ${index + 1}`}
                  value={flaw.imageUrl}
                  maxEdge={900}
                  aspectClass="aspect-square"
                  onChange={(value) => updateFlaw(index, { imageUrl: value })}
                />
                <input
                  type="text"
                  value={flaw.note}
                  onChange={(e) => updateFlaw(index, { note: e.target.value })}
                  placeholder="What is it?"
                  maxLength={80}
                  aria-label={`Flaw ${index + 1} note`}
                  className={compactInputClass}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Photos */}
      <div className="space-y-1.5 pt-4 border-t border-zinc-100">
        <span className={labelClass}>
          Photos <span className="text-zinc-500 font-normal">* (first photo is the cover)</span>
        </span>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {form.images.map((image, index) => (
            <ImageUploadField
              key={index}
              label={index === 0 ? 'Cover' : `Photo ${index + 1}`}
              value={image}
              maxEdge={1000}
              aspectClass="aspect-[3/4]"
              onChange={(value) => update('images', form.images.map((img, i) => (i === index ? value : img)))}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <Button type="submit" className="w-full sm:flex-1">
          {mode === 'edit' ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{COPY[mode].submit}</span>
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} className="w-full sm:w-auto">
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};
