/**
 * Automated identity check against the Philippine National ID (PhilSys) through
 * the eGov / PSA eVerify programme.
 *
 * The eVerify API key is issued per organisation after PSA regulatory onboarding
 * and DICT technical onboarding (https://platforms.e.gov.ph, https://everify.gov.ph).
 * That key must never ship in browser code, so this module talks to a small
 * backend proxy you host (see docs/ID_VERIFICATION.md). The proxy holds the key,
 * calls eVerify, and answers with the contract below.
 *
 * Proxy contract:
 *   POST {VITE_ID_VERIFY_ENDPOINT}
 *   body     { idTypeId, idNumber, fullName, birthDate? }
 *   response { verified: boolean, reference?: string, message?: string }
 *
 * When the endpoint is not configured the check reports `not_configured` and the
 * application falls back to manual admin review of the uploaded ID photo.
 */

export type AutomatedCheckStatus =
  | 'verified'
  | 'not_matched'
  | 'error'
  | 'not_configured'
  | 'unsupported';

export interface AutomatedIdCheck {
  provider: 'egov-everify' | 'none';
  status: AutomatedCheckStatus;
  message: string;
  reference?: string;
  checkedAt: string;
}

export interface AutomatedIdCheckInput {
  idTypeId: string;
  idNumber: string;
  fullName: string;
  birthDate?: string;
}

/** ID types the eVerify programme can authenticate. Other documents stay on manual review. */
const EVERIFY_SUPPORTED_ID_TYPES = new Set(['philsys']);

const ENDPOINT: string = ((import.meta.env.VITE_ID_VERIFY_ENDPOINT as string | undefined) || '').trim();
const TIMEOUT_MS = 15000;

export function isAutomatedCheckConfigured(): boolean {
  return ENDPOINT.length > 0;
}

export function isAutomatedCheckSupported(idTypeId: string): boolean {
  return EVERIFY_SUPPORTED_ID_TYPES.has(idTypeId);
}

export async function runAutomatedIdCheck(input: AutomatedIdCheckInput): Promise<AutomatedIdCheck> {
  const checkedAt = new Date().toISOString();

  if (!isAutomatedCheckConfigured()) {
    return {
      provider: 'none',
      status: 'not_configured',
      message: 'Automated eVerify check is not configured. Admin will review the ID photo manually.',
      checkedAt,
    };
  }

  if (!isAutomatedCheckSupported(input.idTypeId)) {
    return {
      provider: 'egov-everify',
      status: 'unsupported',
      message: 'eVerify only authenticates the PhilSys National ID. This document goes to manual review.',
      checkedAt,
    };
  }

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        provider: 'egov-everify',
        status: 'error',
        message: `Verification service answered ${response.status}. Falling back to manual review.`,
        checkedAt,
      };
    }

    const data = (await response.json()) as { verified?: boolean; reference?: string; message?: string };
    if (data.verified === true) {
      return {
        provider: 'egov-everify',
        status: 'verified',
        message: data.message || 'PhilSys record matched the submitted ID number and name.',
        reference: data.reference,
        checkedAt,
      };
    }
    return {
      provider: 'egov-everify',
      status: 'not_matched',
      message: data.message || 'PhilSys could not match this ID number with the name provided.',
      reference: data.reference,
      checkedAt,
    };
  } catch (err) {
    const aborted = err instanceof DOMException && err.name === 'AbortError';
    return {
      provider: 'egov-everify',
      status: 'error',
      message: aborted
        ? 'Verification service timed out. Falling back to manual review.'
        : 'Verification service is unreachable. Falling back to manual review.',
      checkedAt,
    };
  } finally {
    window.clearTimeout(timer);
  }
}

export const AUTOMATED_CHECK_LABELS: Record<AutomatedCheckStatus, string> = {
  verified: 'eVerify: PhilSys record matched',
  not_matched: 'eVerify: no match',
  error: 'eVerify: service error, manual review',
  not_configured: 'eVerify not configured, manual review',
  unsupported: 'Manual review (not a PhilSys ID)',
};
