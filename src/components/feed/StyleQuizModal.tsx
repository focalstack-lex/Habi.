import React, { useEffect, useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { AESTHETIC_OPTIONS } from './AestheticFilterBar';
import { Button } from '../common/FormControls';
import { useI18n } from '../../i18n';

interface StyleQuizModalProps {
  isOpen: boolean;
  initial?: string[];
  onSkip: () => void;
  onComplete: (aesthetics: string[]) => void;
}

const STYLE_BLURBS: Record<string, string> = {
  Streetwear: 'Hoodies, graphic tees, boxy fits',
  Vintage: 'Archive denim, 90s tees, real patina',
  Y2K: 'Low-rise, baby tees, shiny nylon',
  Techwear: 'Straps, zips, technical shells',
  Gorpcore: 'Trail shells, cargos, sandals',
  Minimalist: 'Clean lines, neutral palette',
  Workwear: 'Chore coats, duck canvas, carpenters',
};

const MAX_PICKS = 3;

export const StyleQuizModal: React.FC<StyleQuizModalProps> = ({ isOpen, initial = [], onSkip, onComplete }) => {
  const { t } = useI18n();
  const [picked, setPicked] = useState<string[]>(initial);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onSkip();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onSkip]);

  if (!isOpen) return null;

  const options = AESTHETIC_OPTIONS.filter((option) => option !== 'All');

  const toggle = (style: string) => {
    setPicked((prev) => {
      if (prev.includes(style)) return prev.filter((s) => s !== style);
      if (prev.length >= MAX_PICKS) return [...prev.slice(1), style];
      return [...prev, style];
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm font-sans">
      <div className="fixed inset-0" onClick={onSkip} />
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl border border-zinc-200/80 shadow-2xl p-5 sm:p-8 z-10 space-y-4 max-h-[88vh] overflow-y-auto sheet-safe">
        <div className="space-y-1.5">
          <span className="font-avantgarde text-[11px] font-bold tracking-wider uppercase text-zinc-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            {t('quiz.eyebrow')}
          </span>
          <h2 className="font-cooper text-2xl sm:text-3xl font-bold text-zinc-950 leading-tight">{t('quiz.title')}</h2>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">{t('quiz.body')}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {options.map((style) => {
            const isOn = picked.includes(style);
            return (
              <button
                key={style}
                type="button"
                onClick={() => toggle(style)}
                aria-pressed={isOn}
                className={`text-left p-3 sm:p-4 rounded-2xl border transition-all ${
                  isOn ? 'bg-zinc-950 text-white border-zinc-950 shadow-md' : 'bg-zinc-50 text-zinc-900 border-zinc-200 hover:border-zinc-400'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-cooper font-bold text-sm sm:text-base">{style}</span>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center border ${isOn ? 'bg-white text-zinc-950 border-white' : 'border-zinc-300 text-transparent'}`}>
                    <Check className="w-3 h-3" />
                  </span>
                </div>
                <div className={`text-[11px] mt-1 leading-snug ${isOn ? 'text-zinc-300' : 'text-zinc-500'}`}>{STYLE_BLURBS[style] ?? ''}</div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button type="button" onClick={onSkip} className="text-xs font-semibold text-zinc-500 hover:text-zinc-950 underline underline-offset-4 shrink-0">
            {t('quiz.skip')}
          </button>
          <Button type="button" onClick={() => onComplete(picked)} disabled={picked.length === 0} className="flex-1">
            {t('quiz.done')} {picked.length > 0 ? `(${picked.length})` : ''}
          </Button>
        </div>
      </div>
    </div>
  );
};
