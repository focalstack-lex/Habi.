import React, { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { authService } from '../../services/authService';
import type { Account } from '../../types/auth';
import { Alert, Button, Field, inputClass } from '../common/FormControls';

interface SignInFormProps {
  onAuthenticated: (account: Account) => void;
  onSwitchToSignUp: () => void;
}

export const SignInForm: React.FC<SignInFormProps> = ({ onAuthenticated, onSwitchToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const account = await authService.signIn(email, password);
      onAuthenticated(account);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      {error && <Alert tone="error">{error}</Alert>}

      <Field label="Email" htmlFor="signin-email" required>
        <input
          id="signin-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={inputClass}
        />
      </Field>

      <Field label="Password" htmlFor="signin-password" required>
        <div className="relative">
          <input
            id="signin-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            className={`${inputClass} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-950"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </Field>

      <Button type="submit" loading={isSubmitting} className="w-full">
        <LogIn className="w-4 h-4" />
        <span>Sign In</span>
      </Button>

      <p className="text-center text-[11px] sm:text-xs text-zinc-500">
        New Davao seller?{' '}
        <button type="button" onClick={onSwitchToSignUp} className="font-semibold text-zinc-950 underline underline-offset-4">
          Apply for a storefront
        </button>
      </p>
    </form>
  );
};
