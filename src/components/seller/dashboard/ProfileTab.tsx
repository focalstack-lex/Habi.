import React, { useState } from 'react';
import { AlertTriangle, Check, Palette, Save, UserPlus } from 'lucide-react';
import type { Seller, SellerTheme } from '../../../types/fashion';
import { Alert, Button, Field, inputClass, labelClass, Segmented } from '../../common/FormControls';
import { ImageUploadField } from '../../common/ImageUploadField';
import { ACCENT_OPTIONS, LAYOUT_OPTIONS, accentFillStyle, accentRingStyle, resolveSellerTheme } from '../theme';

interface ProfileTabProps {
  seller: Seller;
  onSaved: (seller: Seller) => void;
}

interface ProfileDraft {
  name: string;
  description: string;
  logoUrl: string;
  coverUrl: string;
  district: string;
  address: string;
  openingHours: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  whatsapp: string;
  accent: string;
  layout: SellerTheme['layout'];
}

const LAYOUT_HINTS: Record<SellerTheme['layout'], string> = {
  banner: 'Wide cover photo with the avatar overlapping it. The classic look.',
  minimal: 'No cover photo. Avatar and name sit in one tight row.',
  split: 'Cover on the left, details on the right on tablets and up. Phones show the banner look.',
};

interface ThemePreviewProps {
  name: string;
  handle: string;
  logoUrl: string;
  coverUrl: string;
  accent: string;
  layout: SellerTheme['layout'];
}

/** Small strip that mirrors how SellerHeader applies the accent and layout. */
const ThemePreview: React.FC<ThemePreviewProps> = ({ name, handle, logoUrl, coverUrl, accent, layout }) => {
  const theme = resolveSellerTheme({ theme: { accent, layout } });
  const fill = accentFillStyle(theme);

  const avatar = (sizeClass: string) => (
    <div
      className={`${sizeClass} rounded-full border-2 border-white bg-zinc-950 overflow-hidden shrink-0 shadow-md`}
      style={accentRingStyle(theme)}
    >
      <img src={logoUrl} alt="" className="w-full h-full object-cover" />
    </div>
  );

  const identity = (
    <div className="min-w-0">
      <div className="font-cooper font-bold text-sm text-zinc-950 truncate">{name}</div>
      <div className="text-[11px] text-zinc-500 truncate">@{handle}</div>
    </div>
  );

  const follow = (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold shrink-0 ${
        fill ? '' : 'bg-zinc-950 text-white'
      }`}
      style={fill}
    >
      <UserPlus className="w-3 h-3" aria-hidden="true" />
      Follow Seller
    </span>
  );

  const cover = (className: string) => (
    <div className={`relative bg-zinc-950 overflow-hidden ${className}`}>
      <img src={coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-85" />
    </div>
  );

  return (
    <div className="space-y-1.5">
      <span className={labelClass}>Preview</span>
      <div className="bg-white border border-zinc-200/80 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm">
        {layout === 'minimal' && (
          <div className="flex items-center justify-between gap-3 p-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {avatar('w-10 h-10')}
              {identity}
            </div>
            {follow}
          </div>
        )}
        {layout === 'banner' && (
          <>
            {cover('h-16 sm:h-20')}
            <div className="flex items-end justify-between gap-3 px-3 pb-3 -mt-5">
              <div className="flex items-end gap-2.5 min-w-0">
                {avatar('w-12 h-12')}
                <div className="pb-0.5 min-w-0">{identity}</div>
              </div>
              {follow}
            </div>
          </>
        )}
        {layout === 'split' && (
          <div className="sm:flex sm:items-stretch">
            {cover('h-16 sm:h-auto sm:w-2/5 sm:min-h-[88px] shrink-0')}
            <div className="flex-1 min-w-0 flex items-end sm:items-center justify-between gap-3 px-3 pb-3 sm:py-3 -mt-5 sm:mt-0">
              <div className="flex items-end sm:items-center gap-2.5 min-w-0">
                {avatar('w-12 h-12 sm:w-10 sm:h-10')}
                <div className="pb-0.5 sm:pb-0 min-w-0">{identity}</div>
              </div>
              {follow}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const ProfileTab: React.FC<ProfileTabProps> = ({ seller, onSaved }) => {
  const initialTheme = resolveSellerTheme(seller);
  const [form, setForm] = useState<ProfileDraft>({
    name: seller.name,
    description: seller.description,
    logoUrl: seller.logoUrl,
    coverUrl: seller.coverUrl,
    district: seller.location.district,
    address: seller.location.address ?? '',
    openingHours: seller.location.openingHours ?? '',
    instagram: seller.socialLinks.instagram ?? '',
    facebook: seller.socialLinks.facebook ?? '',
    tiktok: seller.socialLinks.tiktok ?? '',
    whatsapp: seller.socialLinks.whatsapp ?? '',
    accent: initialTheme.accent,
    layout: initialTheme.layout,
  });
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Store name cannot be empty.');
    if (form.description.trim().length < 20) return setError('Describe your shop in at least 20 characters.');
    onSaved({
      ...seller,
      name: form.name.trim(),
      description: form.description.trim(),
      logoUrl: form.logoUrl || seller.logoUrl,
      coverUrl: form.coverUrl || seller.coverUrl,
      location: {
        ...seller.location,
        district: form.district.trim(),
        address: form.address.trim() || undefined,
        openingHours: form.openingHours.trim() || undefined,
      },
      socialLinks: {
        instagram: form.instagram.trim() || undefined,
        facebook: form.facebook.trim() || undefined,
        tiktok: form.tiktok.trim() || undefined,
        whatsapp: form.whatsapp.trim() || undefined,
      },
      theme: { accent: form.accent, layout: form.layout },
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-zinc-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 max-w-3xl space-y-5 shadow-sm"
      noValidate
    >
      <h3 className="font-cooper text-lg sm:text-xl font-bold text-zinc-950 border-b border-zinc-100 pb-3 sm:pb-4">
        Storefront Profile
      </h3>

      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
        <div className="sm:col-span-4">
          <ImageUploadField
            label="Logo"
            value={form.logoUrl}
            maxEdge={400}
            aspectClass="aspect-square"
            onChange={(value) => update('logoUrl', value)}
            hint="Square works best."
          />
        </div>
        <div className="sm:col-span-8">
          <ImageUploadField
            label="Cover photo"
            value={form.coverUrl}
            maxEdge={1400}
            aspectClass="aspect-[16/7]"
            onChange={(value) => update('coverUrl', value)}
            hint="Wide banner shown on your storefront."
          />
        </div>
      </div>

      <Field label="Store name" htmlFor="pf-name" required>
        <input id="pf-name" type="text" value={form.name} onChange={(e) => update('name', e.target.value)} className={inputClass} />
      </Field>

      <Field label="About your shop" htmlFor="pf-description" required>
        <textarea
          id="pf-description"
          rows={3}
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          className={`${inputClass} resize-none`}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Field label="District / barangay" htmlFor="pf-district" hint={`City: ${seller.location.city}`}>
          <input id="pf-district" type="text" value={form.district} onChange={(e) => update('district', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Opening hours" htmlFor="pf-hours" hint="Physical stores and pop-ups only.">
          <input
            id="pf-hours"
            type="text"
            value={form.openingHours}
            onChange={(e) => update('openingHours', e.target.value)}
            placeholder="Mon-Sat: 1:00 PM - 8:00 PM"
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Store address" htmlFor="pf-address" hint="Leave blank if you sell online only.">
        <input id="pf-address" type="text" value={form.address} onChange={(e) => update('address', e.target.value)} className={inputClass} />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Field label="Instagram link" htmlFor="pf-ig">
          <input
            id="pf-ig"
            type="url"
            inputMode="url"
            value={form.instagram}
            onChange={(e) => update('instagram', e.target.value)}
            placeholder="https://instagram.com/yourshop"
            className={inputClass}
          />
        </Field>
        <Field label="Facebook page" htmlFor="pf-fb">
          <input
            id="pf-fb"
            type="url"
            inputMode="url"
            value={form.facebook}
            onChange={(e) => update('facebook', e.target.value)}
            placeholder="https://facebook.com/yourshop"
            className={inputClass}
          />
        </Field>
        <Field label="TikTok" htmlFor="pf-tt">
          <input
            id="pf-tt"
            type="url"
            inputMode="url"
            value={form.tiktok}
            onChange={(e) => update('tiktok', e.target.value)}
            placeholder="https://tiktok.com/@yourshop"
            className={inputClass}
          />
        </Field>
        <Field label="WhatsApp number" htmlFor="pf-wa" hint="Buyers can open a pre-filled inquiry chat.">
          <input
            id="pf-wa"
            type="tel"
            inputMode="tel"
            value={form.whatsapp}
            onChange={(e) => update('whatsapp', e.target.value)}
            placeholder="+639171234567"
            className={inputClass}
          />
        </Field>
      </div>

      {/* Storefront theme */}
      <section className="space-y-4 pt-4 border-t border-zinc-100">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-zinc-500" aria-hidden="true" />
          <h4 className="font-cooper text-sm sm:text-base font-bold text-zinc-950">Storefront theme</h4>
        </div>

        <div className="space-y-1.5">
          <span className={labelClass}>Accent colour</span>
          <div className="flex flex-wrap gap-2 sm:gap-3" role="radiogroup" aria-label="Accent colour">
            {ACCENT_OPTIONS.map((option) => {
              const isActive = option.hex === form.accent;
              return (
                <button
                  key={option.hex}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => update('accent', option.hex)}
                  className="flex flex-col items-center gap-1 min-w-[52px]"
                >
                  <span
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform ${
                      isActive ? 'scale-110 ring-2 ring-zinc-950 ring-offset-2 ring-offset-white' : ''
                    }`}
                    style={{ backgroundColor: option.hex }}
                  >
                    {isActive && <Check className="w-4 h-4 text-white" aria-hidden="true" />}
                  </span>
                  <span className={`text-[11px] font-semibold ${isActive ? 'text-zinc-950' : 'text-zinc-500'}`}>{option.name}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-zinc-500">Tints the follow button, the active storefront tab, and the avatar ring.</p>
        </div>

        <div className="space-y-1.5">
          <span className={labelClass}>Layout</span>
          <Segmented value={form.layout} onChange={(value) => update('layout', value)} options={LAYOUT_OPTIONS} className="sm:w-fit" />
          <p className="text-[11px] text-zinc-500">{LAYOUT_HINTS[form.layout]}</p>
        </div>

        <ThemePreview
          name={form.name.trim() || seller.name}
          handle={seller.handle}
          logoUrl={form.logoUrl || seller.logoUrl}
          coverUrl={form.coverUrl || seller.coverUrl}
          accent={form.accent}
          layout={form.layout}
        />
      </section>

      <div className="flex items-start gap-2 text-[11px] text-zinc-500 bg-zinc-50 border border-zinc-200/70 rounded-xl p-3">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-zinc-400" />
        <span>City and verification badge are set from your approved application. Ask an admin to change them.</span>
      </div>

      <Button type="submit" className="w-full">
        <Save className="w-4 h-4" />
        <span>Save Profile</span>
      </Button>
    </form>
  );
};
