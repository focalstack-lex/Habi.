import React, { useState } from 'react';
import { Check, Link2, Moon, Sun, MonitorSmartphone, Languages } from 'lucide-react';
import { AESTHETIC_OPTIONS } from '../feed/AestheticFilterBar';
import { SHOE_SIZES, TOP_SIZES, userPrefsService, type ThemePreference } from '../../services/userPrefsService';
import { absoluteUrl, buildHash } from '../../utils/router';
import { useI18n } from '../../i18n';
import { Field, inputClass, Segmented } from '../common/FormControls';

interface BuyerProfileTabProps {
  savedProductIds: string[];
}

const Chip: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
      active ? 'bg-zinc-950 text-white border-zinc-950' : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-400'
    }`}
  >
    {children}
  </button>
);

const Card: React.FC<{ title: string; body?: string; children: React.ReactNode }> = ({ title, body, children }) => (
  <section className="bg-white border border-zinc-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-3">
    <div>
      <h3 className="font-cooper text-base sm:text-lg font-bold text-zinc-950">{title}</h3>
      {body && <p className="text-[11px] sm:text-xs text-zinc-500 mt-0.5">{body}</p>}
    </div>
    {children}
  </section>
);

export const BuyerProfileTab: React.FC<BuyerProfileTabProps> = ({ savedProductIds }) => {
  const { t, lang, setLang } = useI18n();
  const sizeProfile = userPrefsService.getSizeProfile();
  const styleProfile = userPrefsService.getStyleProfile();
  const theme = userPrefsService.getThemePreference();
  const closet = userPrefsService.getClosetSettings();
  const [copied, setCopied] = useState(false);

  const toggleIn = (list: string[], value: string) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const closetLink = absoluteUrl(
    buildHash('/closet', { name: closet.displayName || 'A Habi closet', items: savedProductIds.join(',') })
  );

  const copyCloset = async () => {
    try {
      await navigator.clipboard.writeText(closetLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <Card title={t('profile.sizes')} body={t('profile.sizesBody')}>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <span className="block text-xs font-semibold text-zinc-700">{t('profile.tops')}</span>
            <div className="flex flex-wrap gap-1.5">
              {TOP_SIZES.map((size) => (
                <Chip key={size} active={sizeProfile.tops.includes(size)} onClick={() => userPrefsService.setSizeProfile({ ...sizeProfile, tops: toggleIn(sizeProfile.tops, size) })}>
                  {size}
                </Chip>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={`${t('profile.waist')} min`} htmlFor="waist-min">
              <input
                id="waist-min"
                type="number"
                inputMode="numeric"
                min={20}
                max={60}
                value={sizeProfile.waistMin ?? ''}
                onChange={(e) => userPrefsService.setSizeProfile({ ...sizeProfile, waistMin: e.target.value ? Number(e.target.value) : null })}
                placeholder="30"
                className={inputClass}
              />
            </Field>
            <Field label={`${t('profile.waist')} max`} htmlFor="waist-max">
              <input
                id="waist-max"
                type="number"
                inputMode="numeric"
                min={20}
                max={60}
                value={sizeProfile.waistMax ?? ''}
                onChange={(e) => userPrefsService.setSizeProfile({ ...sizeProfile, waistMax: e.target.value ? Number(e.target.value) : null })}
                placeholder="32"
                className={inputClass}
              />
            </Field>
          </div>
          <div className="space-y-1.5">
            <span className="block text-xs font-semibold text-zinc-700">{t('profile.shoes')}</span>
            <div className="flex flex-wrap gap-1.5">
              {SHOE_SIZES.map((size) => (
                <Chip key={size} active={sizeProfile.shoes.includes(size)} onClick={() => userPrefsService.setSizeProfile({ ...sizeProfile, shoes: toggleIn(sizeProfile.shoes, size) })}>
                  {size}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card title={t('profile.styles')} body={t('quiz.body')}>
        <div className="flex flex-wrap gap-1.5">
          {AESTHETIC_OPTIONS.filter((o) => o !== 'All').map((style) => (
            <Chip key={style} active={styleProfile.aesthetics.includes(style)} onClick={() => userPrefsService.setStyleProfile(toggleIn(styleProfile.aesthetics, style))}>
              {style}
            </Chip>
          ))}
        </div>
      </Card>

      <Card title={t('profile.theme')}>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { id: 'light', label: t('theme.light'), icon: Sun },
              { id: 'dark', label: t('theme.dark'), icon: Moon },
              { id: 'system', label: t('theme.system'), icon: MonitorSmartphone },
            ] as { id: ThemePreference; label: string; icon: React.ComponentType<{ className?: string }> }[]
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => userPrefsService.setThemePreference(id)}
              aria-pressed={theme === id}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-xs font-semibold transition-all ${
                theme === id ? 'bg-zinc-950 text-white border-zinc-950' : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card title={t('profile.language')}>
        <div className="flex items-center gap-3">
          <Languages className="w-4 h-4 text-zinc-500 shrink-0" />
          <Segmented
            value={lang}
            onChange={setLang}
            options={[
              { id: 'en', label: 'English' },
              { id: 'bis', label: 'Bisaya' },
            ]}
          />
        </div>
      </Card>

      <Card title={t('profile.closet')} body={t('profile.closetBody')}>
        <div className="space-y-3">
          <Field label={t('profile.displayName')} htmlFor="closet-name">
            <input
              id="closet-name"
              type="text"
              value={closet.displayName}
              onChange={(e) => {
                userPrefsService.setDisplayName(e.target.value);
                userPrefsService.setClosetSettings({ ...closet, displayName: e.target.value });
              }}
              placeholder="Maria"
              className={inputClass}
            />
          </Field>
          <label className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80 cursor-pointer">
            <span className="text-xs font-semibold text-zinc-800">{t('profile.closet')}</span>
            <button
              type="button"
              role="switch"
              aria-checked={closet.isPublic}
              onClick={() => userPrefsService.setClosetSettings({ ...closet, isPublic: !closet.isPublic })}
              className={`relative w-11 h-6 rounded-full transition-colors ${closet.isPublic ? 'bg-zinc-950' : 'bg-zinc-300'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${closet.isPublic ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </label>
          {closet.isPublic && (
            <button
              type="button"
              onClick={copyCloset}
              disabled={savedProductIds.length === 0}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-zinc-950 text-white text-xs font-semibold disabled:opacity-50"
            >
              {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
              <span>{copied ? t('common.copied') : t('profile.closetLink')}</span>
            </button>
          )}
          {closet.isPublic && savedProductIds.length === 0 && (
            <p className="text-[11px] text-zinc-500">Save a few pieces first; the link lists your saved items.</p>
          )}
        </div>
      </Card>
    </div>
  );
};
