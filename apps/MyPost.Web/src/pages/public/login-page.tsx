import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Boxes, CheckCircle2, KeyRound, LockKeyhole, ShieldCheck, Truck, Users } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '../../auth/auth-context';
import { Logo } from '../../components/logo';
import { Button, Card, Field, Input } from '../../components/ui';

const schema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  if (user) return <Navigate to={`/${user.role.toLowerCase()}`} replace />;

  const onSubmit = handleSubmit(async (values) => {
    setServerError('');
    try {
      const profile = await login(values.email, values.password);
      const requested = (location.state as { from?: string } | null)?.from;
      navigate(
        requested?.startsWith(`/${profile.role.toLowerCase()}`) ? requested : `/${profile.role.toLowerCase()}`,
        { replace: true },
      );
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Sign-in failed.');
    }
  });

  function fillDemo(email: string) {
    setValue('email', email, { shouldValidate: true });
    setValue('password', 'DemoPassword123!', { shouldValidate: true });
  }

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to access your role-aware MyPost workspace."
    >
      <div className="space-y-6">
        {/* Quick Demo Logins Helper */}
        <div className="rounded-control border border-line/80 bg-subtle/60 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-2">
            Quick demo credentials:
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => fillDemo('customer@mypost.local')}
              className="flex items-center justify-center gap-1 rounded bg-surface border border-line px-2 py-1 text-[11px] font-semibold text-brand shadow-2xs hover:bg-brand/10 transition-colors cursor-pointer"
            >
              <Users className="size-3" /> Customer
            </button>
            <button
              type="button"
              onClick={() => fillDemo('courier@mypost.local')}
              className="flex items-center justify-center gap-1 rounded bg-surface border border-line px-2 py-1 text-[11px] font-semibold text-accent shadow-2xs hover:bg-accent/10 transition-colors cursor-pointer"
            >
              <Truck className="size-3" /> Courier
            </button>
            <button
              type="button"
              onClick={() => fillDemo('admin@mypost.local')}
              className="flex items-center justify-center gap-1 rounded bg-surface border border-line px-2 py-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400 shadow-2xs hover:bg-purple-500/10 transition-colors cursor-pointer"
            >
              <ShieldCheck className="size-3" /> Admin
            </button>
          </div>
        </div>

        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <Field label="Email" htmlFor="email" error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-message' : undefined}
              placeholder="e.g. customer@mypost.local"
              {...register('email')}
            />
          </Field>

          <Field label="Password" htmlFor="password" error={errors.password?.message}>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'password-message' : undefined}
              placeholder="••••••••••••"
              {...register('password')}
            />
          </Field>

          {serverError && (
            <div className="rounded-control bg-danger/10 border border-danger/20 p-3 text-sm text-danger" role="alert">
              {serverError}
            </div>
          )}

          <Button className="w-full min-h-12 text-base" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              'Signing in…'
            ) : (
              <>
                <span>Sign in</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>

          <p className="text-center text-sm text-muted pt-2">
            New to MyPost?{' '}
            <Link className="font-semibold text-brand hover:underline" to="/register">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
}

export function AuthLayout({
  title,
  description,
  children,
}: React.PropsWithChildren<{ title: string; description: string }>) {
  return (
    <div className="grid min-h-screen bg-canvas lg:grid-cols-[1.1fr_0.9fr]">
      {/* Left Branding Showcase Column */}
      <section className="relative hidden overflow-hidden border-r border-line bg-gradient-to-br from-brand via-brand-strong to-indigo-950 p-12 text-white lg:flex lg:flex-col justify-between">
        <div className="relative z-10">
          <Logo />
        </div>

        <div className="relative z-10 my-auto max-w-lg">
          <span className="inline-grid size-12 place-items-center rounded-2xl bg-white/10 text-white backdrop-blur-md mb-6 border border-white/20">
            <LockKeyhole className="size-6" />
          </span>

          <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
            Operational trust begins with clear access boundaries.
          </h2>

          <p className="mt-5 text-base leading-relaxed text-blue-100">
            Customer shipments, courier assignments, and administration controls remain segregated by server-enforced role policies and ownership checks.
          </p>

          <div className="mt-8 space-y-3 text-sm text-blue-100">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-5 text-accent shrink-0" />
              <span>Rotating HttpOnly cookies with short-lived memory access tokens</span>
            </div>
            <div className="flex items-center gap-3">
              <Boxes className="size-5 text-accent shrink-0" />
              <span>Authoritative server-side pricing & legal transition states</span>
            </div>
            <div className="flex items-center gap-3">
              <KeyRound className="size-5 text-accent shrink-0" />
              <span>ASP.NET Core Identity with PBKDF2 password hashing</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-blue-200/80 pt-8 border-t border-white/10">
          <span>Virtual portfolio platform</span>
          <span>Version 1.0</span>
        </div>

        {/* Decorative background route grid */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.15),transparent_60%)] pointer-events-none" />
      </section>

      {/* Right Form Card Column */}
      <main className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-12">
        <Card className="w-full max-w-md p-6 sm:p-8 shadow-xl border-line/80 bg-surface">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-ink">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>

          <div className="mt-8">{children}</div>
        </Card>
      </main>
    </div>
  );
}
