import type { VerificationStatus } from './fashion';
import type { AutomatedIdCheck } from '../services/idVerificationService';

export type UserRole = 'seller' | 'admin';

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export type SellerType = 'physical-store' | 'online-creator';

export interface ValidIdType {
  id: string;
  label: string;
  /** Tested against the normalized number: uppercase, spaces and dashes removed. */
  pattern: RegExp;
  hint: string;
}

export interface IdVerification {
  idTypeId: string;
  idTypeLabel: string;
  idNumber: string;
  fullNameOnId: string;
  /** ISO date (YYYY-MM-DD) as printed on the ID; used by the eVerify match. */
  birthDate?: string;
  /** Downscaled JPEG data URL of the ID front. */
  idImageDataUrl: string;
  /** Optional DTI registration or Mayor's permit for business accounts. */
  permitImageDataUrl?: string;
  /** Result of the automated PhilSys eVerify check, when one ran. */
  automatedCheck?: AutomatedIdCheck;
  submittedAt: string;
}

export interface ApplicationReview {
  decision: 'approved' | 'rejected';
  note: string;
  reviewedAt: string;
  reviewedBy: string;
}

interface AccountBase {
  id: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
}

export interface SellerAccount extends AccountBase {
  role: 'seller';
  ownerName: string;
  phone: string;
  businessName: string;
  handle: string;
  sellerType: SellerType;
  city: string;
  district: string;
  address?: string;
  description: string;
  instagram?: string;
  facebook?: string;
  verification: IdVerification;
  status: ApplicationStatus;
  review?: ApplicationReview;
  /** Id of the Seller profile in the catalog once approved. */
  sellerProfileId: string;
}

export interface AdminAccount extends AccountBase {
  role: 'admin';
  name: string;
}

export type Account = SellerAccount | AdminAccount;

export interface AuthSession {
  accountId: string;
  role: UserRole;
  issuedAt: string;
}

export interface SellerRegistrationInput {
  ownerName: string;
  email: string;
  phone: string;
  password: string;
  businessName: string;
  handle: string;
  sellerType: SellerType;
  city: string;
  district: string;
  address?: string;
  description: string;
  instagram?: string;
  facebook?: string;
  idTypeId: string;
  idNumber: string;
  fullNameOnId: string;
  birthDate?: string;
  idImageDataUrl: string;
  permitImageDataUrl?: string;
}

export interface AdminRegistrationInput {
  name: string;
  email: string;
  password: string;
  setupKey: string;
}

export type ApprovedVerificationLevel = Extract<VerificationStatus, 'Verified Business' | 'Local Seller'>;
