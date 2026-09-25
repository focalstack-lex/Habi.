import React, { useId, useRef, useState } from 'react';
import { Camera, ImagePlus, Trash2 } from 'lucide-react';
import { fileToDataUrl } from '../../utils/image';
import { labelClass } from './FormControls';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (dataUrl: string) => void;
  hint?: string;
  error?: string | null;
  required?: boolean;
  /** Longest edge after downscale. IDs need detail; thumbnails do not. */
  maxEdge?: number;
  /** Tailwind aspect class for the preview frame. */
  aspectClass?: string;
  /** Prefer the rear camera on phones. */
  capture?: boolean;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  value,
  onChange,
  hint,
  error,
  required,
  maxEdge = 1200,
  aspectClass = 'aspect-[16/10]',
  capture = false,
}) => {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setIsBusy(true);
    setLocalError(null);
    try {
      onChange(await fileToDataUrl(file, maxEdge));
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Could not read that image.');
    } finally {
      setIsBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const shownError = error || localError;

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className={labelClass}>
        {label}
        {required && <span className="text-zinc-400"> *</span>}
      </label>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        capture={capture ? 'environment' : undefined}
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {value ? (
        <div className={`relative ${aspectClass} bg-zinc-100 rounded-xl sm:rounded-2xl overflow-hidden border border-zinc-200`}>
          <img src={value} alt={label} className="w-full h-full object-cover" />
          <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 bg-white/95 text-zinc-950 rounded-full text-[11px] font-semibold shadow-md border border-zinc-200 hover:bg-white"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              aria-label="Remove image"
              className="w-8 h-8 bg-white/95 text-zinc-950 rounded-full flex items-center justify-center shadow-md border border-zinc-200 hover:bg-white"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isBusy}
          className={`w-full ${aspectClass} max-h-48 border-2 border-dashed rounded-xl sm:rounded-2xl flex flex-col items-center justify-center gap-2 text-zinc-500 transition-colors ${
            shownError ? 'border-red-300 bg-red-50/40' : 'border-zinc-300 bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-400'
          }`}
        >
          {capture ? <Camera className="w-6 h-6" /> : <ImagePlus className="w-6 h-6" />}
          <span className="text-xs font-semibold">{isBusy ? 'Processing image...' : capture ? 'Take photo or upload' : 'Upload image'}</span>
          <span className="text-[11px] text-zinc-500">JPG, PNG, or WEBP up to 10MB</span>
        </button>
      )}

      {shownError ? (
        <p className="text-[11px] text-red-600 font-medium">{shownError}</p>
      ) : hint ? (
        <p className="text-[11px] text-zinc-500">{hint}</p>
      ) : null}
    </div>
  );
};
