import React from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

export const inputClass =
  'w-full bg-[#F3ECD8] border border-[#E6DCC0] rounded-xl px-3 py-2 sm:py-2.5 text-[13px] sm:text-sm text-[#1A2225] placeholder:text-[#55615D] focus:outline-none focus:ring-2 focus:ring-[#1A2225]/20 focus:bg-[#FFF9E9] font-sans disabled:opacity-60';

export const labelClass = 'block text-[11px] sm:text-xs font-semibold text-[#1A2225]';

interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string | null;
  required?: boolean;
  children: React.ReactNode;
}

export const Field: React.FC<FieldProps> = ({ label, htmlFor, hint, error, required, children }) => (
  <div className="space-y-1">
    <label htmlFor={htmlFor} className={labelClass}>
      {label}
      {required && <span className="text-[#55615D]"> *</span>}
    </label>
    {children}
    {error ? (
      <p className="text-[11px] text-red-600 font-medium">{error}</p>
    ) : hint ? (
      <p className="text-[11px] text-[#55615D]">{hint}</p>
    ) : null}
  </div>
);

interface AlertProps {
  tone: 'error' | 'success' | 'info';
  children: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({ tone, children }) => {
  const styles = {
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    info: 'bg-[#F3ECD8] border-[#E6DCC0] text-[#1A2225]',
  }[tone];
  const Icon = tone === 'error' ? AlertCircle : tone === 'success' ? CheckCircle2 : Info;
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`flex items-start gap-2.5 border rounded-xl px-3.5 py-3 text-xs leading-relaxed ${styles}`}>
      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
      <div className="min-w-0">{children}</div>
    </div>
  );
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** `inverse` and `ghost-dark` are for use on the dark banner surfaces. */
  variant?: 'primary' | 'secondary' | 'danger' | 'inverse' | 'ghost-dark';
  loading?: boolean;
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  loading = false,
  className = '',
  children,
  disabled,
  ...rest
}) => {
  const styles = {
    primary: 'bg-[#1A2225] hover:bg-[#1A2225]/90 text-[#FFF9E9] shadow-sm cursor-pointer',
    secondary: 'bg-[#F3ECD8] hover:bg-[#E8DFC6] text-[#1A2225] border border-[#E6DCC0] cursor-pointer',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-md cursor-pointer',
    inverse: 'bg-[#FFF9E9] hover:bg-[#F3ECD8] text-[#1A2225] shadow-md cursor-pointer',
    'ghost-dark': 'bg-[#FFF9E9]/10 hover:bg-[#FFF9E9]/20 text-[#FFF9E9] border border-[#FFF9E9]/20 cursor-pointer',
  }[variant];
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed ${styles} ${className}`}
    >
      {loading && (
        <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" aria-hidden="true" />
      )}
      {children}
    </button>
  );
};

interface SegmentedProps<T extends string> {
  value: T;
  options: { id: T; label: string }[];
  onChange: (value: T) => void;
  className?: string;
}

export function Segmented<T extends string>({ value, options, onChange, className = '' }: SegmentedProps<T>) {
  return (
    <div className={`flex items-center gap-0.5 p-0.5 bg-[#F3ECD8] rounded-full w-full overflow-x-auto scrollbar-none border border-[#E6DCC0] ${className}`}>
      {options.map((option) => {
        const isActive = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`flex-1 shrink-0 whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              isActive ? 'bg-[#1A2225] text-[#FFF9E9] shadow-sm' : 'text-[#55615D] hover:text-[#1A2225] hover:bg-[#E8DFC6]/60'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
