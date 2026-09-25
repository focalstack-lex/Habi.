import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { authService, validateEmail, validatePassword } from '../../services/authService';
import type { Account } from '../../types/auth';
import { Alert, Button, Field, inputClass } from '../common/FormControls';

interface AdminSignUpFormProps {
  onAuthenticated: (account: Account) => void;
  onSwitchToSignIn: () => void;
}

export const AdminSignUpForm: React.FC<AdminSignUpFormProps> = ({ onAuthenticated, onSwitchToSignIn }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [setupKey, setSetupKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const validation = validateEmail(email) || validatePassword(password);
    if (validation) return setError(validation);
    if (password !== confirm) return setError('Passwords do not match.');

    setIsSubmitting(true);
    try {
      const account = await authService.registerAdmin({ name, email, password, setupKey });
      onAuthenticated(account);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      <Alert tone="info">
        Admin accounts moderate seller applications and the public catalog. Registration needs the
        platform setup key from the site owner.
      </Alert>

      {error && <Alert tone="error">{error}</Alert>}

      <Field label="Your name" htmlFor="admin-name" required>
        <input id="admin-name" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Platform administrator" className={inputClass} />
      </Field>

      <Field label="Email" htmlFor="admin-email" required>
        <input id="admin-email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" className={inputClass} />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Password" htmlFor="admin-password" required hint="8+ characters, letters and numbers.">
          <input id="admin-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Confirm password" htmlFor="admin-confirm" required>
          <input id="admin-confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} />
        </Field>
      </div>

      <Field label="Admin setup key" htmlFor="admin-key" required hint="Set in .env as VITE_ADMIN_SETUP_KEY.">
        <input id="admin-key" type="password" autoComplete="off" value={setupKey} onChange={(e) => setSetupKey(e.target.value)} className={inputClass} />
      </Field>

      <Button type="submit" loading={isSubmitting} className="w-full">
        <ShieldCheck className="w-4 h-4" />
        <span>Create Admin Account</span>
      </Button>

      <p className="text-center text-xs text-zinc-500">
        Already registered?{' '}
        <button type="button" onClick={onSwitchToSignIn} className="font-semibold text-zinc-950 underline underline-offset-4">
          Sign in
        </button>
      </p>
    </form>
  );
};
