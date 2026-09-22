import { KeyRound, Lock, LogOut, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../../auth/auth-context';
import { Button, Card, PageHeader } from '../../components/ui';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Profile & Security"
        description="Your verified identity, active workspace role, and security architecture preferences."
      />

      <div className="max-w-3xl space-y-6">
        {/* User Identity Card */}
        <Card className="p-6 sm:p-8 shadow-xs border-line/80">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 border-b border-line/70 pb-6">
            <div className="grid size-16 place-items-center rounded-2xl bg-brand/10 text-brand font-mono text-2xl font-bold border border-brand/20 shadow-inner">
              {user.displayName.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl font-bold tracking-tight text-ink">{user.displayName}</h2>
                <span className="rounded-full bg-brand/10 border border-brand/25 px-2.5 py-0.5 text-xs font-bold text-brand uppercase">
                  {user.role} workspace
                </span>
              </div>
              <p className="mt-1 text-sm text-muted font-medium">{user.email}</p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => void logout()}
              className="gap-2 text-danger hover:bg-danger/10 hover:text-danger self-start sm:self-center"
            >
              <LogOut className="size-4" />
              <span>Sign out</span>
            </Button>
          </div>

          <dl className="mt-6 grid gap-5 sm:grid-cols-2">
            <ProfileFact
              icon={User}
              label="Display name"
              value={user.displayName}
            />
            <ProfileFact
              icon={KeyRound}
              label="Registered email"
              value={user.email}
            />
            <ProfileFact
              icon={ShieldCheck}
              label="Assigned system role"
              value={`${user.role} (Role-based access policies active)`}
            />
            <ProfileFact
              icon={Lock}
              label="Session security"
              value="Short-lived in-memory JWT + Rotating HttpOnly refresh cookie"
            />
          </dl>
        </Card>

        {/* Security & Privacy Architecture Note */}
        <Card className="p-6 border-line/80 bg-subtle/40">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent mb-2">
            <ShieldCheck className="size-4" />
            <span>Zero-Trust Client Architecture</span>
          </div>
          <p className="text-xs leading-relaxed text-muted">
            Authentication tokens are never stored in unencrypted browser local storage or session storage. All API communication relies on short-lived bearer tokens and CSRF-protected HttpOnly cookies. In this virtual demonstration, user identity modification is intentionally constrained to maintain immutable audit continuity.
          </p>
        </Card>
      </div>
    </>
  );
}

function ProfileFact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-1">
      <dt className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted">
        <Icon className="size-3.5 text-muted" aria-hidden="true" />
        <span>{label}</span>
      </dt>
      <dd className="text-sm font-bold text-ink leading-snug">{value}</dd>
    </div>
  );
}
