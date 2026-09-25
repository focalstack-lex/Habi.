import React, { useEffect, useId, useState } from 'react';
import { X } from 'lucide-react';
import type { TaggedItem } from '../../types/fashion';
import { communityService } from '../../services/communityService';
import { userPrefsService } from '../../services/userPrefsService';
import { DAVAO_CITIES } from '../layout/NavigationHeader';
import { Alert, Button, Field, inputClass, labelClass } from '../common/FormControls';
import { ImageUploadField } from '../common/ImageUploadField';
import { TagPinPlacer } from './TagPinPlacer';

const CAPTION_MAX = 280;
const CAPTION_MIN = 5;
const POST_CITIES = DAVAO_CITIES.filter((city) => city !== 'All Davao Region');

interface NewFitCheckSheetProps {
  isOpen: boolean;
  onClose: () => void;
  /** When given, the "Submit to challenge" box starts checked. */
  challengeTag?: string;
}

interface FormErrors {
  name?: string;
  photo?: string;
  caption?: string;
}

/** "Kenji Santos" becomes "kenji.santos". */
function toHandle(name: string): string {
  const handle = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');
  return handle || 'habi.user';
}

export const NewFitCheckSheet: React.FC<NewFitCheckSheetProps> = ({ isOpen, onClose, challengeTag }) => {
  // The body mounts fresh on every open so the form always starts clean.
  if (!isOpen) return null;
  return <SheetBody onClose={onClose} challengeTag={challengeTag} />;
};

interface SheetBodyProps {
  onClose: () => void;
  challengeTag?: string;
}

const SheetBody: React.FC<SheetBodyProps> = ({ onClose, challengeTag }) => {
  const titleId = useId();
  const nameId = useId();
  const captionId = useId();
  const locationId = useId();
  const challengeId = useId();

  const [challenge] = useState(() => communityService.getCurrentChallenge());
  const [name, setName] = useState(() => userPrefsService.getDisplayName());
  const [photo, setPhoto] = useState('');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState(POST_CITIES[0] ?? 'Davao City');
  const [joinChallenge, setJoinChallenge] = useState(Boolean(challengeTag));
  const [tags, setTags] = useState<TaggedItem[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Keep the page behind the sheet from scrolling while it is open.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handlePhotoChange = (dataUrl: string) => {
    setPhoto(dataUrl);
    // Pins were placed against the previous photo, so they no longer line up.
    setTags([]);
    if (dataUrl) setErrors((prev) => ({ ...prev, photo: undefined }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanCaption = caption.trim();

    const nextErrors: FormErrors = {};
    if (!cleanName) nextErrors.name = 'Add a display name.';
    if (!photo) nextErrors.photo = 'Add a photo of your fit.';
    if (cleanCaption.length < CAPTION_MIN) nextErrors.caption = `Write a caption of at least ${CAPTION_MIN} characters.`;
    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.photo || nextErrors.caption) return;

    try {
      userPrefsService.setDisplayName(cleanName);
      communityService.addPost({
        authorName: cleanName,
        authorHandle: toHandle(cleanName),
        authorAvatar: '',
        imageUrl: photo,
        caption: cleanCaption,
        location,
        taggedItems: tags,
        challengeTag: joinChallenge ? challenge.tag : undefined,
      });
      onClose();
    } catch {
      setSubmitError('Could not save your post. This browser is out of storage; delete an older fit check and try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] font-sans sm:flex sm:items-center sm:justify-center sm:p-4 sm:bg-black/70 sm:backdrop-blur-sm">
      <div className="hidden sm:block fixed inset-0" onClick={onClose} aria-hidden="true" />

      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex flex-col bg-white w-full h-full overflow-y-auto sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:rounded-3xl sm:border sm:border-zinc-200/80 sm:shadow-2xl sm:overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-zinc-100 shrink-0 bg-white">
          <div className="min-w-0">
            <div className="font-avantgarde text-[11px] tracking-wider uppercase font-semibold text-zinc-500">Davao Fit Check</div>
            <h2 id={titleId} className="font-cooper font-bold text-lg sm:text-xl text-zinc-950 leading-tight">
              Post a fit check
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-950 flex items-center justify-center hover:bg-zinc-200 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrolling body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5">
          <Field label="Display name" htmlFor={nameId} required error={errors.name} hint="Shown on your posts and comments.">
            <input
              id={nameId}
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={40}
              autoComplete="name"
              placeholder="e.g. Kenji Santos"
              className={inputClass}
            />
          </Field>

          <ImageUploadField
            label="Photo"
            value={photo}
            onChange={handlePhotoChange}
            required
            maxEdge={1200}
            aspectClass="aspect-[3/4]"
            capture
            error={errors.photo}
            hint="Portrait works best. Full fit, good light."
          />

          <Field label="Caption" htmlFor={captionId} required error={errors.caption}>
            <textarea
              id={captionId}
              value={caption}
              onChange={(event) => setCaption(event.target.value.slice(0, CAPTION_MAX))}
              maxLength={CAPTION_MAX}
              rows={3}
              placeholder="Where you wore it, what you paired it with..."
              className={`${inputClass} resize-none`}
            />
            <div className="text-[11px] text-zinc-500 text-right">
              {caption.length}/{CAPTION_MAX}
            </div>
          </Field>

          <Field label="Location" htmlFor={locationId}>
            <select id={locationId} value={location} onChange={(event) => setLocation(event.target.value)} className={inputClass}>
              {POST_CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </Field>

          <label
            htmlFor={challengeId}
            className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl sm:rounded-2xl px-3.5 py-3 cursor-pointer"
          >
            <input
              id={challengeId}
              type="checkbox"
              checked={joinChallenge}
              onChange={(event) => setJoinChallenge(event.target.checked)}
              className="mt-0.5 w-4 h-4 accent-zinc-950 shrink-0"
            />
            <span className="min-w-0">
              <span className="block text-xs font-semibold text-amber-900">Submit to {challenge.title}</span>
              <span className="block text-[11px] text-amber-800 mt-0.5 leading-relaxed">{challenge.prompt}</span>
            </span>
          </label>

          {photo ? (
            <TagPinPlacer imageUrl={photo} tags={tags} onChange={setTags} />
          ) : (
            <div className="space-y-1">
              <div className={labelClass}>Tag the pieces</div>
              <p className="text-[11px] text-zinc-500">Add a photo first, then tap it to tag the pieces you are wearing.</p>
            </div>
          )}

          {submitError && <Alert tone="error">{submitError}</Alert>}
        </div>

        {/* Pinned submit */}
        <div className="shrink-0 border-t border-zinc-100 bg-white px-4 sm:px-6 pt-3 sm:pt-4 sheet-safe">
          <Button type="submit" className="w-full">
            Post fit check
          </Button>
        </div>
      </form>
    </div>
  );
};
