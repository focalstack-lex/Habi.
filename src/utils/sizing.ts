import type { Measurements, Product, SizeProfile } from '../types/fashion';

/**
 * Size parsing for the "Fits me" filter. Sellers type sizes freely ("Large",
 * "W32 L30", "US 9"), so every product size is normalized into one of four kinds
 * before it is compared with the buyer's profile.
 */

export type ParsedSize =
  | { kind: 'tops'; value: string }
  | { kind: 'waist'; min: number; max: number }
  | { kind: 'shoes'; value: string }
  | { kind: 'onesize' }
  | { kind: 'unknown' };

const TOP_ALIASES: Record<string, string> = {
  xs: 'XS', 'x-small': 'XS', 'extra small': 'XS', xsmall: 'XS',
  s: 'S', small: 'S',
  m: 'M', medium: 'M',
  l: 'L', large: 'L',
  xl: 'XL', 'x-large': 'XL', 'extra large': 'XL', xlarge: 'XL',
  xxl: 'XXL', '2xl': 'XXL', 'xx-large': 'XXL',
  '3xl': '3XL', xxxl: '3XL',
};

const SHOE_CATEGORIES = ['footwear', 'shoes', 'sneakers', 'sandals'];

// Sellers type ranges as "W30-W34", "30 to 34", or with a typographic dash (code point 8211).
const RANGE_SEPARATOR = `[-${String.fromCharCode(8211)}]|to`;
const WAIST_RANGE_PATTERN = new RegExp(`w?(\\d{2})\\s*(?:${RANGE_SEPARATOR})\\s*w?(\\d{2})`);

export function parseSize(raw: string, category = ''): ParsedSize {
  const text = raw.trim().toLowerCase();
  if (!text) return { kind: 'unknown' };
  if (/one\s*size|free\s*size|os\b/.test(text)) return { kind: 'onesize' };

  // Waist: "W32 L30", "W30-W34", "32x30", "waist 31"
  const waistRange = text.match(WAIST_RANGE_PATTERN);
  if (waistRange) return { kind: 'waist', min: Number(waistRange[1]), max: Number(waistRange[2]) };
  const waistSingle = text.match(/(?:^|\b)w\s*(\d{2})\b|(\d{2})\s*x\s*\d{2}|waist\s*(\d{2})/);
  if (waistSingle) {
    const value = Number(waistSingle[1] ?? waistSingle[2] ?? waistSingle[3]);
    return { kind: 'waist', min: value, max: value };
  }

  // Shoes: "US 9", "EU 42", "9.5" on footwear categories
  const isShoeCategory = SHOE_CATEGORIES.some((c) => category.toLowerCase().includes(c));
  const shoe = text.match(/(?:us|size)\s*(\d{1,2}(?:\.5)?)/);
  if (shoe) return { kind: 'shoes', value: shoe[1] };
  if (isShoeCategory) {
    const numeric = text.match(/(\d{1,2}(?:\.5)?)/);
    if (numeric) return { kind: 'shoes', value: numeric[1] };
  }

  const alias = TOP_ALIASES[text];
  if (alias) return { kind: 'tops', value: alias };

  return { kind: 'unknown' };
}

export function productSizes(product: Product): ParsedSize[] {
  const raws = product.sizes && product.sizes.length > 0 ? product.sizes : [product.size];
  return raws.map((raw) => parseSize(raw, product.category));
}

/** True when any listed size fits the profile. Unknown and one-size pieces always pass. */
export function fitsProfile(product: Product, profile: SizeProfile): boolean {
  const hasTops = profile.tops.length > 0;
  const hasWaist = profile.waistMin !== null || profile.waistMax !== null;
  const hasShoes = profile.shoes.length > 0;
  if (!hasTops && !hasWaist && !hasShoes) return true;

  return productSizes(product).some((size) => {
    switch (size.kind) {
      case 'onesize':
      case 'unknown':
        return true;
      case 'tops':
        return hasTops ? profile.tops.includes(size.value) : true;
      case 'waist': {
        if (!hasWaist) return true;
        const min = profile.waistMin ?? profile.waistMax ?? 0;
        const max = profile.waistMax ?? profile.waistMin ?? 99;
        return size.max >= min && size.min <= max;
      }
      case 'shoes':
        return hasShoes ? profile.shoes.includes(size.value) : true;
    }
  });
}

export interface MeasurementField {
  key: keyof Measurements;
  label: string;
  hint: string;
}

const TOP_FIELDS: MeasurementField[] = [
  { key: 'pitToPit', label: 'Pit to pit', hint: 'Armpit to armpit, laid flat' },
  { key: 'length', label: 'Length', hint: 'Top of collar to hem' },
  { key: 'shoulder', label: 'Shoulder', hint: 'Seam to seam across the back' },
  { key: 'sleeve', label: 'Sleeve', hint: 'Shoulder seam to cuff' },
];

const BOTTOM_FIELDS: MeasurementField[] = [
  { key: 'waist', label: 'Waist', hint: 'Laid flat, side to side, then doubled' },
  { key: 'hips', label: 'Hips', hint: 'Widest point, laid flat, doubled' },
  { key: 'rise', label: 'Rise', hint: 'Crotch seam to top of waistband' },
  { key: 'inseam', label: 'Inseam', hint: 'Crotch seam to hem' },
  { key: 'length', label: 'Length', hint: 'Waistband to hem' },
];

/** Which measurement inputs a seller sees for a category. */
export function measurementFieldsFor(category: string): MeasurementField[] {
  const lower = category.toLowerCase();
  if (['pants', 'denim', 'bottoms', 'shorts', 'skirts'].some((c) => lower.includes(c))) return BOTTOM_FIELDS;
  if (['accessories', 'footwear', 'shoes', 'bags'].some((c) => lower.includes(c))) return [];
  return TOP_FIELDS;
}

export const ALL_MEASUREMENT_FIELDS: MeasurementField[] = [
  ...TOP_FIELDS,
  ...BOTTOM_FIELDS.filter((field) => field.key !== 'length'),
];

export function hasMeasurements(measurements?: Measurements): boolean {
  return Boolean(measurements && Object.values(measurements).some((value) => typeof value === 'number' && value > 0));
}
