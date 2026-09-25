import React from 'react';
import { ShieldCheck, Store, UserRound } from 'lucide-react';
import type { Account } from '../../types/auth';
import { Segmented } from '../common/FormControls';
import { SignInForm } from './SignInForm';
import { SellerSignUpForm } from './SellerSignUpForm';
import { AdminSignUpForm } from './AdminSignUpForm';

export type AuthMode = 'signin' | 'seller-signup' | 'admin-signup';

interface AuthViewProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onAuthenticated: (account: Account) => void;
}

const COPY: Record<AuthMode, { eyebrow: string; title: string; body: string }> = {
  signin: {
    eyebrow: 'SELLER & ADMIN PORTAL',
    title: 'Welcome back.',
    body: 'Sign in to manage your Davao storefront, inventory, and drops.',
  },
  'seller-signup': {
    eyebrow: 'JOIN AS DAVAO SELLER',
    title: 'Open your storefront.',
    body: 'For independent brands, thrift vaults, and vintage sellers across the Davao Region. A valid government ID is required before approval.',
  },
  'admin-signup': {
    eyebrow: 'PLATFORM ADMINISTRATION',
    title: 'Register an admin.',
    body: 'Admins verify seller IDs, approve applications, and moderate the public catalog.',
  },
};

export const AuthView: React.FC<AuthViewProps> = ({ mode, onModeChange, onAuthenticated }) => {
  const copy = COPY[mode];

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-4 sm:py-10 font-sans">
      <div className="space-y-1 mb-4 sm:mb-6">
        <span className="font-avantgarde text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-zinc-500 block">
          {copy.eyebrow}
        </span>
        <h1 className="font-cooper text-xl sm:text-3xl font-bold tracking-tight text-zinc-950 leading-tight">
          {copy.title}
        </h1>
        <p className="text-xs text-zinc-500 leading-relaxed max-w-md">{copy.body}</p>
      </div>

      {mode !== 'admin-signup' && (
        <Segmented
          className="mb-3 sm:mb-4"
          value={mode}
          onChange={onModeChange}
          options={[
            { id: 'signin', label: 'Sign In' },
            { id: 'seller-signup', label: 'Seller Sign Up' },
          ]}
        />
      )}

      <div className="bg-white border border-zinc-200/80 rounded-xl sm:rounded-2xl p-3.5 sm:p-6">
        {mode === 'signin' && (
          <SignInForm onAuthenticated={onAuthenticated} onSwitchToSignUp={() => onModeChange('seller-signup')} />
        )}
        {mode === 'seller-signup' && (
          <SellerSignUpForm onAuthenticated={onAuthenticated} onSwitchToSignIn={() => onModeChange('signin')} />
        )}
        {mode === 'admin-signup' && (
          <AdminSignUpForm onAuthenticated={onAuthenticated} onSwitchToSignIn={() => onModeChange('signin')} />
        )}
      </div>

      {mode === 'seller-signup' && (
        <div className="grid grid-cols-3 gap-2 mt-3 sm:mt-4">
          {[
            { icon: UserRound, label: 'Create account' },
            { icon: ShieldCheck, label: 'Admin verifies ID' },
            { icon: Store, label: 'Storefront goes live' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="bg-zinc-50 border border-zinc-200/70 rounded-lg sm:rounded-xl p-2 text-center space-y-1">
              <Icon className="w-3.5 h-3.5 mx-auto text-zinc-950" />
              <div className="text-[10px] sm:text-[11px] font-semibold text-zinc-700 leading-tight">{label}</div>
            </div>
          ))}
        </div>
      )}

      {mode !== 'admin-signup' && (
        <p className="text-center text-[11px] text-zinc-400 mt-4">
          Platform administrator?{' '}
          <button type="button" onClick={() => onModeChange('admin-signup')} className="font-semibold text-zinc-600 hover:text-zinc-950 underline underline-offset-4">
            Register with setup key
          </button>
        </p>
      )}
    </div>
  );
};
