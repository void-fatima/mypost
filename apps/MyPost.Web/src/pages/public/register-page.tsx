import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Check, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '../../auth/auth-context';
import { Button, Field, Input } from '../../components/ui';
import { AuthLayout } from './login-page';

const schema = z.object({
  displayName: z.string().trim().min(2, 'Enter your name.').max(160),
  email: z.string().email('Enter a valid email address.'),
  password: z
    .string()
    .min(12, 'Use at least 12 characters.')
    .regex(/[A-Z]/, 'Add an uppercase letter.')
    .regex(/[a-z]/, 'Add a lowercase letter.')
    .regex(/[0-9]/, 'Add a number.')
    .regex(/[^A-Za-z0-9]/, 'Add a symbol.'),
});
type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: createAccount, user } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const passwordVal = watch('password') || '';

  if (user) return <Navigate to={`/${user.role.toLowerCase()}`} replace />;

  const submit = handleSubmit(async (values) => {
    setServerError('');
    try {
      await createAccount(values.email, values.password, values.displayName);
      navigate('/customer', { replace: true });
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Registration failed.');
    }
  });

  const passwordChecks = [
    { label: '12+ characters', valid: passwordVal.length >= 12 },
    { label: 'Uppercase letter', valid: /[A-Z]/.test(passwordVal) },
    { label: 'Lowercase letter', valid: /[a-z]/.test(passwordVal) },
    { label: 'Number', valid: /[0-9]/.test(passwordVal) },
    { label: 'Special symbol', valid: /[^A-Za-z0-9]/.test(passwordVal) },
  ];

  return (
    <AuthLayout
      title="Create your account"
      description="Start a private customer workspace for virtual shipments."
    >
      <form className="space-y-4" onSubmit={submit} noValidate>
        <Field label="Full name" htmlFor="displayName" error={errors.displayName?.message}>
          <Input
            id="displayName"
            autoComplete="name"
            placeholder="e.g. Sara Ahmadi"
            aria-invalid={Boolean(errors.displayName)}
            {...register('displayName')}
          />
        </Field>

        <Field label="Email" htmlFor="register-email" error={errors.email?.message}>
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            placeholder="sara@example.com"
            aria-invalid={Boolean(errors.email)}
            {...register('email')}
          />
        </Field>

        <Field
          label="Password"
          htmlFor="register-password"
          error={errors.password?.message}
        >
          <Input
            id="register-password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••••••"
            aria-invalid={Boolean(errors.password)}
            {...register('password')}
          />
        </Field>

        {/* Real-time Password Strength Feedback */}
        <div className="rounded-control border border-line/70 bg-subtle/50 p-3 space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1">
            <ShieldCheck className="size-3 text-brand" /> Password requirements:
          </p>
          <div className="grid grid-cols-2 gap-1 text-xs">
            {passwordChecks.map((req) => (
              <div
                key={req.label}
                className={`flex items-center gap-1.5 transition-colors ${
                  req.valid ? 'text-success font-semibold' : 'text-muted/60'
                }`}
              >
                <Check className={`size-3 ${req.valid ? 'text-success' : 'opacity-30'}`} />
                <span>{req.label}</span>
              </div>
            ))}
          </div>
        </div>

        {serverError && (
          <div className="rounded-control bg-danger/10 border border-danger/20 p-3 text-sm text-danger" role="alert">
            {serverError}
          </div>
        )}

        <Button className="w-full min-h-12 text-base" type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            'Creating account…'
          ) : (
            <>
              <span>Create account</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>

        <p className="text-center text-sm text-muted pt-2">
          Already registered?{' '}
          <Link className="font-semibold text-brand hover:underline" to="/login">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
