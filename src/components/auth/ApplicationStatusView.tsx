import React, { useState } from 'react';
import { Clock, LogOut, RefreshCw, ShieldCheck, XCircle, Compass } from 'lucide-react';
import type { SellerAccount } from '../../types/auth';
import { authService, maskIdNumber, VALID_ID_TYPES } from '../../services/authService';
import { AUTOMATED_CHECK_LABELS } from '../../services/idVerificationService';
import { Alert, Button, Field, inputClass } from '../common/FormControls';
import { ImageUploadField } from '../common/ImageUploadField';

interface ApplicationStatusViewProps {
  account: SellerAccount;
  onUpdated: (account: SellerAccount) => void;
  onSignOut: () => void;
  onBrowseFeed: () => void;
}

export const ApplicationStatusView: React.FC<ApplicationStatusViewProps> = ({
  account,
  onUpdated,
  onSignOut,
  onBrowseFeed,
}) => {
  const isRejected = account.status === 'rejected';
  const [idTypeId, setIdTypeId] = useState(account.verification.idTypeId);
  const [idNumber, setIdNumber] = useState('');
  const [fullNameOnId, setFullNameOnId] = useState(account.verification.fullNameOnId);
  const [birthDate, setBirthDate] = useState(account.verification.birthDate ?? '');
  const [idImageDataUrl, setIdImageDataUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const automatedCheck = account.verification.automatedCheck;

  const submittedOn = new Date(account.verification.submittedAt).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleResubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const updated = await authService.resubmitVerification(account.id, {
        idTypeId,
        idNumber,
        fullNameOnId,
        birthDate,
        idImageDataUrl,
      });
      onUpdated(updated);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resubmit.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-12 font-sans space-y-5 sm:space-y-6">
      {/* Status banner */}
      <div className={`rounded-2xl sm:rounded-3xl p-5 sm:p-8 border shadow-sm space-y-3 ${
        isRejected ? 'bg-red-50 border-red-200' : 'bg-zinc-950 text-white border-zinc-800'
      }`}>
        <div className={`font-avantgarde text-[11px] tracking-wider uppercase font-semibold flex items-center gap-2 ${isRejected ? 'text-red-700' : 'text-zinc-400'}`}>
          {isRejected ? <XCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
          <span>{isRejected ? 'APPLICATION NEEDS ATTENTION' : 'APPLICATION UNDER REVIEW'}</span>
        </div>
        <h1 className={`font-cooper text-2xl sm:text-4xl font-bold tracking-tight leading-tight ${isRejected ? 'text-red-900' : 'text-white'}`}>
          {isRejected ? 'We could not verify your ID.' : `Thanks, ${account.ownerName.split(' ')[0]}. Your ID is being checked.`}
        </h1>
        <p className={`text-xs sm:text-sm leading-relaxed max-w-lg ${isRejected ? 'text-red-800' : 'text-zinc-300'}`}>
          {isRejected
            ? 'Review the admin note below, then resubmit a clearer photo or a different valid ID. Your storefront details are kept.'
            : 'A Habi admin compares your uploaded ID with the application details. Storefronts usually go live within 1 to 2 days. You will see your dashboard here once approved.'}
        </p>
        {isRejected && account.review?.note && (
          <div className="bg-white/80 border border-red-200 rounded-xl p-3.5 text-xs text-red-900">
            <span className="font-semibold">Admin note:</span> {account.review.note}
          </div>
        )}
      </div>

      {/* Submitted summary */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Submitted application</h2>
          <span className="text-[11px] text-zinc-400">{submittedOn}</span>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
          <SummaryRow label="Storefront" value={`${account.businessName} (@${account.handle})`} />
          <SummaryRow label="Location" value={`${account.district}, ${account.city}`} />
          <SummaryRow label="Seller type" value={account.sellerType === 'physical-store' ? 'Physical store / pop-up' : 'Online creator'} />
          <SummaryRow label="Contact" value={`${account.email} • ${account.phone}`} />
          <SummaryRow label="ID type" value={account.verification.idTypeLabel} />
          <SummaryRow label="ID number" value={maskIdNumber(account.verification.idNumber)} />
          {automatedCheck && (
            <SummaryRow label="Government ID check" value={AUTOMATED_CHECK_LABELS[automatedCheck.status]} />
          )}
        </dl>
        <div className="flex items-center gap-2 text-[11px] text-zinc-500 pt-3 border-t border-zinc-100">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-950 shrink-0" />
          <span>Your ID photo is visible to Habi admins only and never to buyers.</span>
        </div>
      </div>

      {/* Resubmission form */}
      {isRejected && (
        <form onSubmit={handleResubmit} className="bg-white border border-zinc-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-4" noValidate>
          <h2 className="font-cooper text-lg sm:text-xl font-bold text-zinc-950">Resubmit verification</h2>
          {error && <Alert tone="error">{error}</Alert>}

          <Field label="Valid ID type" htmlFor="rs-idtype" required>
            <select id="rs-idtype" value={idTypeId} onChange={(e) => setIdTypeId(e.target.value)} className={inputClass}>
              {VALID_ID_TYPES.map((type) => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
          </Field>
          <Field label="ID number" htmlFor="rs-idnumber" required hint={VALID_ID_TYPES.find((t) => t.id === idTypeId)?.hint}>
            <input id="rs-idnumber" type="text" autoComplete="off" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} placeholder="As printed on the ID" className={inputClass} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full name on ID" htmlFor="rs-idname" required>
              <input id="rs-idname" type="text" value={fullNameOnId} onChange={(e) => setFullNameOnId(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Date of birth on ID" htmlFor="rs-dob" required>
              <input id="rs-dob" type="date" autoComplete="bday" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className={inputClass} />
            </Field>
          </div>
          <ImageUploadField label="Photo of ID (front)" required capture value={idImageDataUrl} onChange={setIdImageDataUrl} hint="All four corners visible, no glare, text readable." />

          <Button type="submit" loading={isSubmitting} className="w-full">
            <RefreshCw className="w-4 h-4" />
            <span>Resubmit for Review</span>
          </Button>
        </form>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button type="button" variant="secondary" onClick={onBrowseFeed} className="flex-1">
          <Compass className="w-4 h-4" />
          <span>Browse the Feed Meanwhile</span>
        </Button>
        <Button type="button" variant="secondary" onClick={onSignOut} className="sm:w-auto">
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </Button>
      </div>
    </div>
  );
};

const SummaryRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="min-w-0">
    <dt className="text-[11px] text-zinc-400 font-medium">{label}</dt>
    <dd className="font-semibold text-zinc-900 break-words">{value}</dd>
  </div>
);
