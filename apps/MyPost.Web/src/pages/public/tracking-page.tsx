import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Lock,
  MapPin,
  Moon,
  Package,
  Route,
  Search,
  Share2,
  ShieldCheck,
  Sun,
  Truck,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Logo } from '../../components/logo';
import { ErrorState, LoadingState } from '../../components/page-state';
import { StatusBadge } from '../../components/status-badge';
import { TrackingTimeline } from '../../components/tracking-timeline';
import { Button, Card, CopyButton } from '../../components/ui';
import { api } from '../../lib/api';
import type { PublicTracking, ShipmentStatus } from '../../types';

function getProgressPercent(status: ShipmentStatus): number {
  switch (status) {
    case 'Created':
      return 15;
    case 'AwaitingPickup':
      return 25;
    case 'Accepted':
      return 45;
    case 'InTransit':
      return 70;
    case 'OutForDelivery':
      return 90;
    case 'Delivered':
      return 100;
    case 'DeliveryFailed':
      return 80;
    case 'ReturnInitiated':
    case 'ReturningToSender':
      return 60;
    case 'ReturnedToSender':
    case 'Cancelled':
      return 100;
    default:
      return 10;
  }
}

export default function TrackingPage() {
  const { trackingCode } = useParams();
  const [code, setCode] = useState(trackingCode ?? '');
  const [copiedShare, setCopiedShare] = useState(false);
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const query = useQuery({
    queryKey: ['public-tracking', trackingCode],
    queryFn: () => api.get<PublicTracking>(`/tracking/${encodeURIComponent(trackingCode!)}`),
    enabled: Boolean(trackingCode),
  });

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (code.trim()) {
      navigate(`/track/${encodeURIComponent(code.trim().toUpperCase())}`);
    }
  }

  async function handleShare() {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  }

  const sampleCodes = ['MP-DEMO-100001', 'MP-DEMO-100002', 'MP-DEMO-100004', 'MP-DEMO-100005'];

  return (
    <div className="min-h-screen bg-canvas text-ink selection:bg-brand/20">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-line/70 bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex h-18 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="size-10 px-0 rounded-control"
              onClick={() => setDark((v) => !v)}
              aria-label={dark ? 'Use light theme' : 'Use dark theme'}
            >
              {dark ? <Sun className="size-4.5 text-warning" /> : <Moon className="size-4.5 text-muted hover:text-ink" />}
            </Button>
            <Link className="text-sm font-semibold text-brand hover:underline px-2 py-1" to="/login">
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6">
        {/* Page Title & Context */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-brand mb-2">
              <ShieldCheck className="size-4" />
              <span>Public tracking</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-ink">Follow a shipment</h1>
            <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-muted">
              This privacy-safe view shows operational milestones without exposing sender details, phone numbers, or street addresses.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-ink transition-colors"
          >
            <ArrowLeft className="size-3.5" /> Back to home
          </Link>
        </div>

        {/* Search Input Form */}
        <form
          onSubmit={submit}
          className="flex flex-col gap-2.5 rounded-card border border-line bg-surface p-2.5 shadow-sm sm:flex-row focus-within:border-brand transition-all"
        >
          <label className="sr-only" htmlFor="tracking-code">
            Tracking code
          </label>
          <div className="relative flex-1">
            <input
              id="tracking-code"
              className="min-h-12 w-full rounded-control border border-transparent bg-subtle/60 px-4 font-mono uppercase tracking-wider text-sm text-ink placeholder:text-muted/60 focus:border-brand focus:bg-surface transition-all"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Enter tracking code (e.g. MP-DEMO-100004)"
            />
          </div>
          <Button type="submit" className="min-h-12 px-6">
            <Search className="size-4" />
            <span>Track</span>
          </Button>
        </form>

        {/* Empty state when no code provided */}
        {!trackingCode && (
          <Card className="p-10 text-center border-dashed border-2">
            <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-brand/10 text-brand">
              <Package className="size-7" />
            </div>
            <h2 className="text-xl font-bold text-ink">Enter a tracking code to begin</h2>
            <p className="mt-2 text-sm text-muted max-w-sm mx-auto">
              Tracking is available without an account. Try any of the seeded demonstration tracking codes:
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {sampleCodes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setCode(s);
                    navigate(`/track/${encodeURIComponent(s)}`);
                  }}
                  className="rounded-control border border-line bg-surface px-3 py-1.5 font-mono text-xs font-bold text-brand shadow-2xs hover:bg-subtle transition-all cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Loading and Error States */}
        {query.isLoading && <LoadingState label="Looking up shipment" />}
        {query.isError && <ErrorState error={query.error} onRetry={() => void query.refetch()} />}

        {/* Data Loaded Display */}
        {query.data && (
          <div className="space-y-6">
            {/* Visual Route Progress Banner */}
            <Card className="overflow-hidden p-6 bg-gradient-to-r from-surface via-subtle/30 to-surface">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Current status</span>
                  <div className="mt-1 flex items-center gap-2">
                    <StatusBadge status={query.data.status} size="md" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CopyButton text={query.data.trackingCode} label="Code" />
                  <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold text-muted hover:bg-subtle hover:text-ink transition-colors cursor-pointer"
                  >
                    <Share2 className="size-3.5" />
                    <span>{copiedShare ? 'Link copied!' : 'Share'}</span>
                  </button>
                </div>
              </div>

              {/* Linear Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs font-semibold text-muted mb-2">
                  <span className="flex items-center gap-1">
                    <Package className="size-3.5 text-brand" /> Origin
                  </span>
                  <span className="flex items-center gap-1">
                    <Route className="size-3.5 text-brand" /> In Transit
                  </span>
                  <span className="flex items-center gap-1">
                    <Truck className="size-3.5 text-brand" /> Out for Delivery
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="size-3.5 text-success" /> Delivered
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-subtle">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand to-accent transition-all duration-500 ease-out"
                    style={{ width: `${getProgressPercent(query.data.status)}%` }}
                    aria-hidden="true"
                  />
                </div>
              </div>
            </Card>

            {/* Split Grid: Details Card & Timeline */}
            <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
              {/* Left Column: Shipment Overview */}
              <div className="space-y-6">
                <Card className="h-fit p-6 sm:p-7 shadow-xs">
                  <div className="flex items-center justify-between border-b border-line/70 pb-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Tracking code</p>
                      <p className="mt-1 font-mono text-base font-extrabold tracking-wider text-ink">
                        {query.data.trackingCode}
                      </p>
                    </div>
                    <CopyButton text={query.data.trackingCode} />
                  </div>

                  <dl className="mt-6 grid gap-4 text-sm divide-y divide-line/60">
                    <Fact
                      icon={User}
                      label="Recipient"
                      value={query.data.recipient}
                    />
                    <Fact
                      icon={MapPin}
                      label="Destination"
                      value={query.data.destination}
                    />
                    <Fact
                      icon={Package}
                      label="Service"
                      value={`${query.data.serviceLevel} ${query.data.type.toLowerCase()}`}
                    />
                    <Fact
                      icon={Calendar}
                      label="Created"
                      value={new Date(query.data.createdAtUtc).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    />
                  </dl>

                  {/* Privacy shield callout */}
                  <div className="mt-6 rounded-control border border-line/70 bg-subtle/60 p-3.5 flex items-start gap-2.5 text-xs text-muted leading-relaxed">
                    <Lock className="size-4 text-brand shrink-0 mt-0.5" />
                    <span>
                      Sender credentials and full street addresses are guarded to protect customer privacy.
                    </span>
                  </div>
                </Card>
              </div>

              {/* Right Column: Timeline Card */}
              <Card className="p-6 sm:p-7 shadow-xs">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-line/70">
                  <div>
                    <h2 className="text-lg font-bold text-ink">Shipment timeline</h2>
                    <p className="text-xs text-muted mt-0.5">Chronological record of verified custody handoffs</p>
                  </div>
                  <span className="rounded-full bg-subtle px-2.5 py-1 text-xs font-bold text-muted font-mono">
                    {query.data.history.length} events
                  </span>
                </div>

                <TrackingTimeline events={query.data.history} />
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 pt-3.5 first:pt-0">
      <dt className="flex items-center gap-2 text-muted text-xs font-semibold">
        <Icon className="size-3.5 text-muted" aria-hidden="true" />
        <span>{label}</span>
      </dt>
      <dd className="text-right font-bold text-ink text-sm">{value}</dd>
    </div>
  );
}
