import type {
  Account,
  AdminAccount,
  AdminRegistrationInput,
  ApprovedVerificationLevel,
  AuthSession,
  SellerAccount,
  SellerRegistrationInput,
  ValidIdType,
} from '../types/auth';
import type { Seller } from '../types/fashion';
import { catalogService } from './catalogService';
import { runAutomatedIdCheck } from './idVerificationService';

/**
 * Client-side account store for the prototype. Accounts, sessions, and the
 * uploaded ID images live in localStorage. Passwords are salted and hashed
 * with SHA-256 before storage, but a browser-only store is not a substitute
 * for a real backend: anyone with the device can read it.
 */

const KEYS = {
  ACCOUNTS: 'habi_accounts',
  SESSION: 'habi_session',
};

const ADMIN_SETUP_KEY: string =
  (import.meta.env.VITE_ADMIN_SETUP_KEY as string | undefined) || 'habi-admin-2026';

const listeners = new Set<() => void>();

export const VALID_ID_TYPES: ValidIdType[] = [
  {
    id: 'philsys',
    label: 'PhilSys National ID (PhilID / ePhilID)',
    pattern: /^\d{12}(\d{4})?$/,
    hint: '12 or 16 digits, e.g. 1234-5678-9012-3456',
  },
  {
    id: 'drivers-license',
    label: "LTO Driver's License",
    pattern: /^[A-Z]\d{10}$/,
    hint: 'e.g. N01-23-456789',
  },
  {
    id: 'passport',
    label: 'Philippine Passport',
    pattern: /^[A-Z]{1,2}\d{7}[A-Z]?$/,
    hint: 'e.g. P1234567A',
  },
  {
    id: 'umid',
    label: 'UMID Card',
    pattern: /^\d{12}$/,
    hint: '12 digit CRN, e.g. 0111-2223333-4',
  },
  {
    id: 'sss',
    label: 'SSS ID',
    pattern: /^\d{10}$/,
    hint: '10 digits, e.g. 34-1234567-8',
  },
  {
    id: 'prc',
    label: 'PRC Professional ID',
    pattern: /^\d{7}$/,
    hint: '7 digit registration number',
  },
  {
    id: 'postal',
    label: 'Postal ID',
    pattern: /^[A-Z0-9]{8,16}$/,
    hint: 'PRN printed on the card',
  },
  {
    id: 'tin',
    label: 'TIN ID',
    pattern: /^\d{9,12}$/,
    hint: '9 to 12 digits, e.g. 123-456-789-000',
  },
  {
    id: 'voters',
    label: "Voter's ID / Voter's Certificate",
    pattern: /^[A-Z0-9]{8,25}$/,
    hint: 'VIN as printed',
  },
  {
    id: 'business-permit',
    label: "DTI Registration / Mayor's Business Permit",
    pattern: /^[A-Z0-9]{6,25}$/,
    hint: 'Certificate or permit number',
  },
];

export function normalizeIdNumber(value: string): string {
  return value.toUpperCase().replace(/[\s\-./]/g, '');
}

export function validateIdNumber(idTypeId: string, idNumber: string): string | null {
  const type = VALID_ID_TYPES.find((t) => t.id === idTypeId);
  if (!type) return 'Choose a valid ID type.';
  const normalized = normalizeIdNumber(idNumber);
  if (!normalized) return 'Enter the ID number exactly as printed.';
  if (!type.pattern.test(normalized)) return `That does not look like a ${type.label} number. ${type.hint}.`;
  return null;
}

export function validateEmail(email: string): string | null {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()) ? null : 'Enter a valid email address.';
}

export function validatePhone(phone: string): string | null {
  const digits = phone.replace(/[\s\-()]/g, '');
  return /^(\+63|0)9\d{9}$/.test(digits) ? null : 'Enter a PH mobile number, e.g. 0917 123 4567.';
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password needs at least 8 characters.';
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return 'Use both letters and numbers.';
  return null;
}

export function validateHandle(handle: string): string | null {
  return /^[a-z0-9][a-z0-9._]{2,23}$/.test(handle)
    ? null
    : 'Handle: 3 to 24 lowercase letters, numbers, dots, or underscores.';
}

export function toHandle(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9._\s]/g, '')
    .trim()
    .replace(/\s+/g, '.')
    .slice(0, 24);
}

export function maskIdNumber(idNumber: string): string {
  const normalized = normalizeIdNumber(idNumber);
  if (normalized.length <= 4) return normalized;
  return `${'*'.repeat(normalized.length - 4)}${normalized.slice(-4)}`;
}

// Storage helpers -----------------------------------------------------------

function readAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(KEYS.ACCOUNTS);
    return raw ? (JSON.parse(raw) as Account[]) : [];
  } catch {
    return [];
  }
}

function writeAccounts(accounts: Account[]): void {
  try {
    localStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(accounts));
  } catch {
    throw new Error(
      'Browser storage is full. Remove older applications or use a smaller ID photo, then try again.'
    );
  }
}

function notify(): void {
  listeners.forEach((listener) => listener());
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function makeSalt(): string {
  const bytes = new Uint8Array(16);
  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return toHex(bytes);
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const message = `${salt}:${password}`;
  if (globalThis.crypto?.subtle) {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(message));
    return toHex(new Uint8Array(digest));
  }
  // crypto.subtle is unavailable on plain http origins such as a LAN test device.
  return sha256(message);
}

// Public API ----------------------------------------------------------------

export const authService = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSession(): AuthSession | null {
    try {
      const raw = localStorage.getItem(KEYS.SESSION);
      return raw ? (JSON.parse(raw) as AuthSession) : null;
    } catch {
      return null;
    }
  },

  getCurrentAccount(): Account | null {
    const session = this.getSession();
    if (!session) return null;
    const account = readAccounts().find((a) => a.id === session.accountId);
    if (!account) {
      localStorage.removeItem(KEYS.SESSION);
      return null;
    }
    return account;
  },

  getAccountById(accountId: string): Account | undefined {
    return readAccounts().find((a) => a.id === accountId);
  },

  async signIn(email: string, password: string): Promise<Account> {
    const normalizedEmail = email.trim().toLowerCase();
    const account = readAccounts().find((a) => a.email === normalizedEmail);
    if (!account) throw new Error('No account found for that email.');
    const hash = await hashPassword(password, account.passwordSalt);
    if (hash !== account.passwordHash) throw new Error('Incorrect password.');
    this.startSession(account);
    return account;
  },

  signOut(): void {
    localStorage.removeItem(KEYS.SESSION);
    notify();
  },

  startSession(account: Account): void {
    const session: AuthSession = {
      accountId: account.id,
      role: account.role,
      issuedAt: new Date().toISOString(),
    };
    localStorage.setItem(KEYS.SESSION, JSON.stringify(session));
    notify();
  },

  async registerSeller(input: SellerRegistrationInput): Promise<SellerAccount> {
    const accounts = readAccounts();
    const email = input.email.trim().toLowerCase();
    const handle = input.handle.trim().toLowerCase();

    const emailError = validateEmail(email);
    if (emailError) throw new Error(emailError);
    if (accounts.some((a) => a.email === email)) {
      throw new Error('An account with this email already exists. Sign in instead.');
    }

    const passwordError = validatePassword(input.password);
    if (passwordError) throw new Error(passwordError);

    const phoneError = validatePhone(input.phone);
    if (phoneError) throw new Error(phoneError);

    const handleError = validateHandle(handle);
    if (handleError) throw new Error(handleError);
    const handleTaken =
      accounts.some((a) => a.role === 'seller' && a.handle === handle) ||
      catalogService.getAllSellers().some((s) => s.handle.toLowerCase() === handle);
    if (handleTaken) throw new Error('That storefront handle is already taken.');

    if (!input.businessName.trim()) throw new Error('Enter your brand or store name.');
    if (!input.ownerName.trim()) throw new Error('Enter the owner\'s full name.');
    if (!input.city) throw new Error('Choose your city.');

    const idError = validateIdNumber(input.idTypeId, input.idNumber);
    if (idError) throw new Error(idError);
    if (!input.idImageDataUrl) throw new Error('Upload a clear photo of the front of your ID.');
    if (!input.fullNameOnId.trim()) throw new Error('Enter the full name printed on the ID.');

    const normalizedId = normalizeIdNumber(input.idNumber);
    const idAlreadyUsed = accounts.some(
      (a) =>
        a.role === 'seller' &&
        a.verification.idTypeId === input.idTypeId &&
        normalizeIdNumber(a.verification.idNumber) === normalizedId &&
        a.status !== 'rejected'
    );
    if (idAlreadyUsed) throw new Error('This ID is already linked to another seller application.');

    // PhilSys IDs are checked against the government eVerify service when a proxy is
    // configured. A hard "no match" blocks sign-up; outages fall back to admin review.
    const automatedCheck = await runAutomatedIdCheck({
      idTypeId: input.idTypeId,
      idNumber: normalizedId,
      fullName: input.fullNameOnId.trim(),
      birthDate: input.birthDate,
    });
    if (automatedCheck.status === 'not_matched') {
      throw new Error(`${automatedCheck.message} Check the ID number, name, and birth date, or use a different valid ID.`);
    }

    const idType = VALID_ID_TYPES.find((t) => t.id === input.idTypeId)!;
    const salt = makeSalt();
    const now = new Date().toISOString();
    const account: SellerAccount = {
      id: makeId('acct'),
      role: 'seller',
      email,
      passwordHash: await hashPassword(input.password, salt),
      passwordSalt: salt,
      createdAt: now,
      ownerName: input.ownerName.trim(),
      phone: input.phone.trim(),
      businessName: input.businessName.trim(),
      handle,
      sellerType: input.sellerType,
      city: input.city,
      district: input.district.trim(),
      address: input.address?.trim() || undefined,
      description: input.description.trim(),
      instagram: input.instagram?.trim() || undefined,
      facebook: input.facebook?.trim() || undefined,
      verification: {
        idTypeId: idType.id,
        idTypeLabel: idType.label,
        idNumber: normalizedId,
        fullNameOnId: input.fullNameOnId.trim(),
        birthDate: input.birthDate || undefined,
        idImageDataUrl: input.idImageDataUrl,
        permitImageDataUrl: input.permitImageDataUrl || undefined,
        automatedCheck,
        submittedAt: now,
      },
      status: 'pending',
      sellerProfileId: makeId('seller'),
    };

    writeAccounts([...accounts, account]);
    this.startSession(account);
    return account;
  },

  async registerAdmin(input: AdminRegistrationInput): Promise<AdminAccount> {
    if (input.setupKey !== ADMIN_SETUP_KEY) {
      throw new Error('Invalid admin setup key.');
    }
    const accounts = readAccounts();
    const email = input.email.trim().toLowerCase();
    const emailError = validateEmail(email);
    if (emailError) throw new Error(emailError);
    if (accounts.some((a) => a.email === email)) {
      throw new Error('An account with this email already exists.');
    }
    const passwordError = validatePassword(input.password);
    if (passwordError) throw new Error(passwordError);
    if (!input.name.trim()) throw new Error('Enter your name.');

    const salt = makeSalt();
    const account: AdminAccount = {
      id: makeId('admin'),
      role: 'admin',
      email,
      passwordHash: await hashPassword(input.password, salt),
      passwordSalt: salt,
      createdAt: new Date().toISOString(),
      name: input.name.trim(),
    };
    writeAccounts([...accounts, account]);
    this.startSession(account);
    return account;
  },

  hasAdminAccount(): boolean {
    return readAccounts().some((a) => a.role === 'admin');
  },

  listSellerApplications(): SellerAccount[] {
    return readAccounts()
      .filter((a): a is SellerAccount => a.role === 'seller')
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  /** Rejected applicants may swap the ID and go back into the queue. */
  async resubmitVerification(
    accountId: string,
    patch: { idTypeId: string; idNumber: string; fullNameOnId: string; birthDate?: string; idImageDataUrl: string }
  ): Promise<SellerAccount> {
    const idError = validateIdNumber(patch.idTypeId, patch.idNumber);
    if (idError) throw new Error(idError);
    if (!patch.idImageDataUrl) throw new Error('Upload a clear photo of the front of your ID.');
    if (!patch.fullNameOnId.trim()) throw new Error('Enter the full name printed on the ID.');
    const idType = VALID_ID_TYPES.find((t) => t.id === patch.idTypeId)!;
    const normalizedId = normalizeIdNumber(patch.idNumber);

    const accounts = readAccounts();
    const index = accounts.findIndex((a) => a.id === accountId && a.role === 'seller');
    if (index === -1) throw new Error('Account not found.');
    const current = accounts[index] as SellerAccount;

    const automatedCheck = await runAutomatedIdCheck({
      idTypeId: idType.id,
      idNumber: normalizedId,
      fullName: patch.fullNameOnId.trim(),
      birthDate: patch.birthDate || current.verification.birthDate,
    });
    if (automatedCheck.status === 'not_matched') {
      throw new Error(`${automatedCheck.message} Check the ID number, name, and birth date, or use a different valid ID.`);
    }

    const updated: SellerAccount = {
      ...current,
      status: 'pending',
      review: undefined,
      verification: {
        ...current.verification,
        idTypeId: idType.id,
        idTypeLabel: idType.label,
        idNumber: normalizedId,
        fullNameOnId: patch.fullNameOnId.trim(),
        birthDate: patch.birthDate || current.verification.birthDate,
        idImageDataUrl: patch.idImageDataUrl,
        automatedCheck,
        submittedAt: new Date().toISOString(),
      },
    };
    accounts[index] = updated;
    writeAccounts(accounts);
    notify();
    return updated;
  },

  approveSeller(
    accountId: string,
    admin: AdminAccount,
    level: ApprovedVerificationLevel,
    note = ''
  ): SellerAccount {
    const accounts = readAccounts();
    const index = accounts.findIndex((a) => a.id === accountId && a.role === 'seller');
    if (index === -1) throw new Error('Application not found.');
    const current = accounts[index] as SellerAccount;
    const updated: SellerAccount = {
      ...current,
      status: 'approved',
      review: {
        decision: 'approved',
        note,
        reviewedAt: new Date().toISOString(),
        reviewedBy: admin.name,
      },
    };
    accounts[index] = updated;
    writeAccounts(accounts);

    // Publish or refresh the storefront profile so the seller appears in the catalog.
    const existing = catalogService.getSellerById(updated.sellerProfileId);
    catalogService.upsertSeller(existing ? { ...existing, verificationStatus: level } : buildSellerProfile(updated, level));
    catalogService.setSellerSuspended(updated.sellerProfileId, false);
    notify();
    return updated;
  },

  rejectSeller(accountId: string, admin: AdminAccount, note: string): SellerAccount {
    const accounts = readAccounts();
    const index = accounts.findIndex((a) => a.id === accountId && a.role === 'seller');
    if (index === -1) throw new Error('Application not found.');
    const current = accounts[index] as SellerAccount;
    const updated: SellerAccount = {
      ...current,
      status: 'rejected',
      review: {
        decision: 'rejected',
        note,
        reviewedAt: new Date().toISOString(),
        reviewedBy: admin.name,
      },
    };
    accounts[index] = updated;
    writeAccounts(accounts);
    // A previously approved seller loses public visibility on rejection.
    if (catalogService.getSellerById(updated.sellerProfileId)) {
      catalogService.setSellerSuspended(updated.sellerProfileId, true);
    }
    notify();
    return updated;
  },

  findSellerAccountByProfileId(sellerProfileId: string): SellerAccount | undefined {
    return readAccounts().find(
      (a): a is SellerAccount => a.role === 'seller' && a.sellerProfileId === sellerProfileId
    );
  },
};

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'Davao City': { lat: 7.0707, lng: 125.6087 },
  'Tagum City': { lat: 7.4473, lng: 125.8078 },
  'Digos City': { lat: 6.7562, lng: 125.3572 },
  'Panabo City': { lat: 7.3081, lng: 125.6841 },
  'Mati City': { lat: 6.9551, lng: 126.2164 },
  'Samal Island': { lat: 7.0731, lng: 125.7081 },
};

const DEFAULT_LOGO =
  'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=400&q=80';
const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80';

function buildSellerProfile(account: SellerAccount, level: ApprovedVerificationLevel): Seller {
  const coords = CITY_COORDS[account.city] || CITY_COORDS['Davao City'];
  // Small deterministic offset so two sellers in one city do not stack on the map.
  const jitter = (hashSeed(account.id) % 200) / 10000 - 0.01;
  return {
    id: account.sellerProfileId,
    name: account.businessName,
    handle: account.handle,
    logoUrl: DEFAULT_LOGO,
    coverUrl: DEFAULT_COVER,
    description: account.description || `${account.businessName} on Habi.`,
    verificationStatus: level,
    location: {
      city: account.city,
      district: account.district,
      isPhysicalStore: account.sellerType === 'physical-store',
      address: account.address,
      lat: coords.lat + jitter,
      lng: coords.lng + jitter,
    },
    categories: [],
    aesthetics: [],
    followerCount: 0,
    viewCount: 0,
    socialLinks: {
      instagram: account.instagram,
      facebook: account.facebook,
    },
  };
}

function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return hash;
}

// Pure JS SHA-256 fallback for non-secure contexts ---------------------------

const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

export function sha256(message: string): string {
  const H = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ]);
  const bytes = new TextEncoder().encode(message);
  const bitLength = bytes.length * 8;
  const paddedLength = ((bytes.length + 9 + 63) >> 6) << 6;
  const padded = new Uint8Array(paddedLength);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLength - 8, Math.floor(bitLength / 0x100000000));
  view.setUint32(paddedLength - 4, bitLength >>> 0);

  const W = new Uint32Array(64);
  const rotr = (x: number, n: number) => (x >>> n) | (x << (32 - n));

  for (let offset = 0; offset < paddedLength; offset += 64) {
    for (let i = 0; i < 16; i++) W[i] = view.getUint32(offset + i * 4);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(W[i - 15], 7) ^ rotr(W[i - 15], 18) ^ (W[i - 15] >>> 3);
      const s1 = rotr(W[i - 2], 17) ^ rotr(W[i - 2], 19) ^ (W[i - 2] >>> 10);
      W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0;
    }

    let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + K[i] + W[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0;
      d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0; H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0; H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
  }

  return Array.from(H, (word) => word.toString(16).padStart(8, '0')).join('');
}
