import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import {
  authService,
  toHandle,
  validateEmail,
  validateHandle,
  validateIdNumber,
  validatePassword,
  validatePhone,
  VALID_ID_TYPES,
} from '../../services/authService';
import type { Account, SellerType } from '../../types/auth';
import { DAVAO_CITIES } from '../layout/NavigationHeader';
import { Alert, Button, Field, inputClass, Segmented } from '../common/FormControls';
import { ImageUploadField } from '../common/ImageUploadField';

interface SellerSignUpFormProps {
  onAuthenticated: (account: Account) => void;
  onSwitchToSignIn: () => void;
}

const STEPS = ['Account', 'Storefront', 'Verify ID'] as const;

const SELLER_CITIES = DAVAO_CITIES.filter((city) => city !== 'All Davao Region');

interface FormState {
  ownerName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  businessName: string;
  handle: string;
  handleTouched: boolean;
  sellerType: SellerType;
  city: string;
  district: string;
  address: string;
  description: string;
  instagram: string;
  facebook: string;
  idTypeId: string;
  idNumber: string;
  fullNameOnId: string;
  birthDate: string;
  idImageDataUrl: string;
  permitImageDataUrl: string;
  consent: boolean;
}

const INITIAL: FormState = {
  ownerName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  businessName: '',
  handle: '',
  handleTouched: false,
  sellerType: 'online-creator',
  city: 'Davao City',
  district: '',
  address: '',
  description: '',
  instagram: '',
  facebook: '',
  idTypeId: VALID_ID_TYPES[0].id,
  idNumber: '',
  fullNameOnId: '',
  birthDate: '',
  idImageDataUrl: '',
  permitImageDataUrl: '',
  consent: false,
};

const TODAY = new Date().toISOString().split('T')[0];

function ageOn(birthDate: string, today = new Date()): number {
  const dob = new Date(birthDate);
  if (Number.isNaN(dob.getTime())) return 0;
  let age = today.getFullYear() - dob.getFullYear();
  const beforeBirthday =
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate());
  if (beforeBirthday) age -= 1;
  return age;
}

type Errors = Partial<Record<keyof FormState, string>>;

export const SellerSignUpForm: React.FC<SellerSignUpFormProps> = ({ onAuthenticated, onSwitchToSignIn }) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'businessName' && !prev.handleTouched) next.handle = toHandle(value as string);
      return next;
    });
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validateStep = (index: number): Errors => {
    const next: Errors = {};
    if (index === 0) {
      if (!form.ownerName.trim()) next.ownerName = 'Enter your full name.';
      const emailError = validateEmail(form.email);
      if (emailError) next.email = emailError;
      const phoneError = validatePhone(form.phone);
      if (phoneError) next.phone = phoneError;
      const passwordError = validatePassword(form.password);
      if (passwordError) next.password = passwordError;
      if (form.password !== form.confirmPassword) next.confirmPassword = 'Passwords do not match.';
    }
    if (index === 1) {
      if (!form.businessName.trim()) next.businessName = 'Enter your brand or store name.';
      const handleError = validateHandle(form.handle);
      if (handleError) next.handle = handleError;
      if (!form.city) next.city = 'Choose your city.';
      if (!form.district.trim()) next.district = 'Enter your district or barangay.';
      if (form.sellerType === 'physical-store' && !form.address.trim()) next.address = 'Physical stores need a street address.';
      if (form.description.trim().length < 20) next.description = 'Describe your shop in at least 20 characters.';
    }
    if (index === 2) {
      const idError = validateIdNumber(form.idTypeId, form.idNumber);
      if (idError) next.idNumber = idError;
      if (!form.fullNameOnId.trim()) next.fullNameOnId = 'Enter the name printed on the ID.';
      if (!form.birthDate) next.birthDate = 'Enter the date of birth printed on the ID.';
      else if (ageOn(form.birthDate) < 18) next.birthDate = 'Sellers must be at least 18 years old.';
      if (!form.idImageDataUrl) next.idImageDataUrl = 'A photo of the ID front is required.';
      if (!form.consent) next.consent = 'Please confirm the declaration to continue.';
    }
    return next;
  };

  const goNext = () => {
    const stepErrors = validateStep(step);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length === 0) {
      if (step === 1 && !form.fullNameOnId.trim()) {
        setForm((prev) => ({ ...prev, fullNameOnId: prev.ownerName }));
      }
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goBack = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const stepErrors = validateStep(2);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return;

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const account = await authService.registerSeller({
        ownerName: form.ownerName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        businessName: form.businessName,
        handle: form.handle,
        sellerType: form.sellerType,
        city: form.city,
        district: form.district,
        address: form.sellerType === 'physical-store' ? form.address : undefined,
        description: form.description,
        instagram: form.instagram,
        facebook: form.facebook,
        idTypeId: form.idTypeId,
        idNumber: form.idNumber,
        fullNameOnId: form.fullNameOnId,
        birthDate: form.birthDate,
        idImageDataUrl: form.idImageDataUrl,
        permitImageDataUrl: form.permitImageDataUrl || undefined,
      });
      onAuthenticated(account);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedIdType = VALID_ID_TYPES.find((t) => t.id === form.idTypeId) ?? VALID_ID_TYPES[0];

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={(e) => {
        // Enter should advance a step, not submit the whole application early.
        if (e.key === 'Enter' && step < STEPS.length - 1 && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
          e.preventDefault();
          goNext();
        }
      }}
      className="space-y-4"
      noValidate
    >
      {/* Step indicator */}
      <ol className="flex items-center gap-2" aria-label="Application steps">
        {STEPS.map((label, index) => {
          const isDone = index < step;
          const isActive = index === step;
          return (
            <li key={label} className="flex-1 min-w-0">
              <div className={`h-1 rounded-full ${isDone || isActive ? 'bg-zinc-950' : 'bg-zinc-200'}`} />
              <div className={`mt-1 text-[10px] sm:text-[11px] font-semibold truncate ${isActive ? 'text-zinc-950' : 'text-zinc-500'}`}>
                {index + 1}. {label}
              </div>
            </li>
          );
        })}
      </ol>

      {submitError && <Alert tone="error">{submitError}</Alert>}

      {step === 0 && (
        <div className="space-y-3">
          <Field label="Owner full name" htmlFor="su-owner" required error={errors.ownerName}>
            <input id="su-owner" type="text" autoComplete="name" value={form.ownerName} onChange={(e) => update('ownerName', e.target.value)} placeholder="Juan Dela Cruz" className={inputClass} />
          </Field>
          <Field label="Email" htmlFor="su-email" required error={errors.email}>
            <input id="su-email" type="email" autoComplete="email" inputMode="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@example.com" className={inputClass} />
          </Field>
          <Field label="Mobile number" htmlFor="su-phone" required error={errors.phone} hint="Buyers will not see this. Used for verification follow-ups.">
            <input id="su-phone" type="tel" autoComplete="tel" inputMode="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="0917 123 4567" className={inputClass} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Password" htmlFor="su-password" required error={errors.password} hint="8+ characters with letters and numbers.">
              <input id="su-password" type="password" autoComplete="new-password" value={form.password} onChange={(e) => update('password', e.target.value)} className={inputClass} />
            </Field>
            <Field label="Confirm password" htmlFor="su-confirm" required error={errors.confirmPassword}>
              <input id="su-confirm" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} className={inputClass} />
            </Field>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <Field label="Brand or store name" htmlFor="su-business" required error={errors.businessName}>
            <input id="su-business" type="text" autoComplete="organization" value={form.businessName} onChange={(e) => update('businessName', e.target.value)} placeholder="e.g. Matina Vintage Lab" className={inputClass} />
          </Field>
          <Field label="Storefront handle" htmlFor="su-handle" required error={errors.handle} hint="Shown as @handle on your storefront and inquiries.">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-400">@</span>
              <input
                id="su-handle"
                type="text"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={form.handle}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, handle: toHandle(e.target.value), handleTouched: true }));
                  setErrors((prev) => ({ ...prev, handle: undefined }));
                }}
                placeholder="matinavintagelab"
                className={`${inputClass} pl-8`}
              />
            </div>
          </Field>

          <div className="space-y-1.5">
            <span className="block text-xs font-semibold text-zinc-700">Seller type</span>
            <Segmented
              value={form.sellerType}
              onChange={(value) => update('sellerType', value)}
              options={[
                { id: 'online-creator', label: 'Online creator' },
                { id: 'physical-store', label: 'Physical store / pop-up' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="City" htmlFor="su-city" required error={errors.city}>
              <select id="su-city" value={form.city} onChange={(e) => update('city', e.target.value)} className={inputClass}>
                {SELLER_CITIES.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </Field>
            <Field label="District / barangay" htmlFor="su-district" required error={errors.district}>
              <input id="su-district" type="text" value={form.district} onChange={(e) => update('district', e.target.value)} placeholder="e.g. Matina" className={inputClass} />
            </Field>
          </div>

          {form.sellerType === 'physical-store' && (
            <Field label="Store address" htmlFor="su-address" required error={errors.address} hint="Shown on your storefront and the Davao map.">
              <input id="su-address" type="text" autoComplete="street-address" value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="Unit, building, street, city" className={inputClass} />
            </Field>
          )}

          <Field label="About your shop" htmlFor="su-description" required error={errors.description} hint="What you sell, your aesthetic, and how buyers can reach you.">
            <textarea id="su-description" rows={3} value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Curated 1-of-1 vintage denim and 90s graphic tees sourced across Davao." className={`${inputClass} resize-none`} />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Instagram link" htmlFor="su-ig" hint="Optional">
              <input id="su-ig" type="url" inputMode="url" value={form.instagram} onChange={(e) => update('instagram', e.target.value)} placeholder="https://instagram.com/yourshop" className={inputClass} />
            </Field>
            <Field label="Facebook page" htmlFor="su-fb" hint="Optional">
              <input id="su-fb" type="url" inputMode="url" value={form.facebook} onChange={(e) => update('facebook', e.target.value)} placeholder="https://facebook.com/yourshop" className={inputClass} />
            </Field>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <Alert tone="info">
            Only verified local sellers can list on Habi. PhilSys National IDs are checked through the
            government eVerify service when enabled, and a Habi admin reviews every application before
            the storefront goes live. Your ID is never shown to buyers.
          </Alert>

          <Field label="Valid ID type" htmlFor="su-idtype" required>
            <select id="su-idtype" value={form.idTypeId} onChange={(e) => update('idTypeId', e.target.value)} className={inputClass}>
              {VALID_ID_TYPES.map((type) => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
          </Field>

          <Field label="ID number" htmlFor="su-idnumber" required error={errors.idNumber} hint={selectedIdType.hint}>
            <input id="su-idnumber" type="text" autoComplete="off" autoCapitalize="characters" value={form.idNumber} onChange={(e) => update('idNumber', e.target.value)} placeholder="As printed on the ID" className={inputClass} />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Full name on ID" htmlFor="su-idname" required error={errors.fullNameOnId}>
              <input id="su-idname" type="text" autoComplete="off" value={form.fullNameOnId} onChange={(e) => update('fullNameOnId', e.target.value)} className={inputClass} />
            </Field>
            <Field label="Date of birth on ID" htmlFor="su-dob" required error={errors.birthDate} hint="Matched against the PhilSys record.">
              <input id="su-dob" type="date" max={TODAY} autoComplete="bday" value={form.birthDate} onChange={(e) => update('birthDate', e.target.value)} className={inputClass} />
            </Field>
          </div>

          <ImageUploadField
            label="Photo of ID (front)"
            required
            capture
            value={form.idImageDataUrl}
            onChange={(value) => update('idImageDataUrl', value)}
            error={errors.idImageDataUrl}
            hint="All four corners visible, no glare, text readable."
          />

          <ImageUploadField
            label={form.sellerType === 'physical-store' ? 'Business permit or DTI registration' : 'Business permit or DTI registration (optional)'}
            value={form.permitImageDataUrl}
            onChange={(value) => update('permitImageDataUrl', value)}
            hint="Speeds up approval and unlocks the Verified Business badge."
          />

          <label className="flex items-start gap-3 text-xs text-zinc-700 leading-relaxed cursor-pointer">
            <input
              type="checkbox"
              checked={form.consent}
              onChange={(e) => update('consent', e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-zinc-300 accent-zinc-950 shrink-0"
            />
            <span>
              I confirm this ID is mine, the details are accurate, and I agree that Habi admins may
              review it to verify my seller application.
            </span>
          </label>
          {errors.consent && <p className="text-[11px] text-red-600 font-medium -mt-2">{errors.consent}</p>}
        </div>
      )}

      {/* Step controls */}
      <div className="flex items-center gap-3 pt-1">
        {step > 0 ? (
          <Button type="button" variant="secondary" onClick={goBack} className="shrink-0">
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
        ) : (
          <button type="button" onClick={onSwitchToSignIn} className="text-xs font-semibold text-zinc-500 hover:text-zinc-950 underline underline-offset-4 shrink-0">
            Have an account? Sign in
          </button>
        )}

        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={goNext} className="flex-1">
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button type="submit" loading={isSubmitting} className="flex-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Submit for Verification</span>
          </Button>
        )}
      </div>
    </form>
  );
};
