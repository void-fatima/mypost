import clsx from 'clsx';
import { Check, Copy, Loader2 } from 'lucide-react';
import { forwardRef, useState, type ButtonHTMLAttributes, type ComponentPropsWithoutRef, type InputHTMLAttributes, type ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, disabled, children, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-control font-semibold transition-all duration-150 select-none cursor-pointer',
        'focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
        'active:scale-[0.98] disabled:active:scale-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none',
        // Sizes
        size === 'sm' && 'min-h-9 px-3 text-xs',
        size === 'md' && 'min-h-11 px-4 text-sm',
        size === 'lg' && 'min-h-12 px-6 text-base',
        // Variants
        variant === 'primary' && 'bg-brand text-white shadow-xs hover:bg-brand-strong hover:shadow-sm dark:text-white',
        variant === 'secondary' && 'border border-line bg-surface text-ink shadow-xs hover:bg-subtle hover:border-line/80',
        variant === 'accent' && 'bg-accent text-white shadow-xs hover:brightness-110 dark:text-white',
        variant === 'outline' && 'border border-brand text-brand hover:bg-brand/10',
        variant === 'danger' && 'bg-danger text-white shadow-xs hover:brightness-90',
        variant === 'ghost' && 'text-muted hover:bg-subtle hover:text-ink',
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin shrink-0" aria-hidden="true" />}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={clsx(
      'min-h-11 w-full rounded-control border border-line bg-surface px-3.5 text-sm text-ink placeholder:text-muted/70',
      'shadow-2xs transition-all duration-150',
      'focus:border-brand focus:ring-2 focus:ring-brand/20',
      'disabled:cursor-not-allowed disabled:bg-subtle disabled:opacity-60',
      className,
    )}
    {...props}
  />
));
Input.displayName = 'Input';

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={clsx(
        'min-h-11 w-full rounded-control border border-line bg-surface px-3.5 text-sm text-ink',
        'shadow-2xs transition-all duration-150 cursor-pointer',
        'focus:border-brand focus:ring-2 focus:ring-brand/20',
        'disabled:cursor-not-allowed disabled:bg-subtle disabled:opacity-60',
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={clsx(
        'min-h-28 w-full rounded-control border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/70',
        'shadow-2xs transition-all duration-150',
        'focus:border-brand focus:ring-2 focus:ring-brand/20',
        'disabled:cursor-not-allowed disabled:bg-subtle disabled:opacity-60',
        className,
      )}
      {...props}
    />
  );
}

export function Card({
  children,
  className,
  interactive = false,
  variant = 'default',
  ...props
}: ComponentPropsWithoutRef<'section'> & { interactive?: boolean; variant?: 'default' | 'glass' | 'subtle' }) {
  return (
    <section
      className={clsx(
        'rounded-card border transition-all duration-200',
        variant === 'default' && 'border-line/90 bg-surface shadow-xs',
        variant === 'glass' && 'glass-card shadow-sm',
        variant === 'subtle' && 'border-line/60 bg-subtle/50',
        interactive && 'cursor-pointer hover:border-brand/60 hover:shadow-md hover:-translate-y-0.5',
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}

export function CopyButton({ text, label = 'Copy', className }: { text: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }
  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? 'Copied to clipboard' : `Copy ${label}`}
      aria-label={copied ? 'Copied' : `Copy ${label}`}
      className={clsx(
        'inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-semibold transition-all cursor-pointer',
        copied
          ? 'bg-success/15 text-success'
          : 'text-muted hover:bg-subtle hover:text-ink',
        className,
      )}
    >
      {copied ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
      <span>{copied ? 'Copied' : label}</span>
    </button>
  );
}

export function Field({
  label,
  error,
  hint,
  badge,
  children,
  htmlFor,
}: {
  label: string;
  error?: string;
  hint?: string;
  badge?: string;
  children: ReactNode;
  htmlFor: string;
}) {
  const messageId = `${htmlFor}-message`;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-ink" htmlFor={htmlFor}>
          {label}
        </label>
        {badge && <span className="text-[11px] font-medium text-muted">{badge}</span>}
      </div>
      {children}
      {(error ?? hint) && (
        <p id={messageId} className={clsx('text-xs font-medium transition-all', error ? 'text-danger' : 'text-muted')}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  badge,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  badge?: ReactNode;
}) {
  return (
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <div className="flex items-center gap-2 mb-2">
          {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">{eyebrow}</p>}
          {badge}
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
