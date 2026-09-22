import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Cpu,
  Database,
  Eye,
  KeyRound,
  LockKeyhole,
  Moon,
  PackageCheck,
  Route,
  ScanSearch,
  ShieldCheck,
  Sun,
  Truck,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../../components/logo';
import { Button, Card } from '../../components/ui';

export default function LandingPage() {
  const [code, setCode] = useState('');
  const [selectedDemoIndex, setSelectedDemoIndex] = useState(0);
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

  function track(event: React.FormEvent) {
    event.preventDefault();
    if (code.trim()) {
      navigate(`/track/${encodeURIComponent(code.trim().toUpperCase())}`);
    }
  }

  const demoParcels = [
    {
      code: 'MP-DEMO-100004',
      status: 'Delivered',
      origin: 'Tehran',
      destination: 'Isfahan',
      service: 'Standard',
      events: 6,
      steps: [
        { label: 'Accepted at origin facility', done: true },
        { label: 'Departed sorting center', done: true },
        { label: 'Out for delivery', done: true },
        { label: 'Delivered to recipient', done: true },
      ],
    },
    {
      code: 'MP-DEMO-100001',
      status: 'Awaiting Pickup',
      origin: 'Shiraz',
      destination: 'Mashhad',
      service: 'Express',
      events: 2,
      steps: [
        { label: 'Shipment created', done: true },
        { label: 'Awaiting courier pickup', done: true },
        { label: 'Hub sorting', done: false },
        { label: 'Final delivery', done: false },
      ],
    },
    {
      code: 'MP-DEMO-100002',
      status: 'In Transit',
      origin: 'Tabriz',
      destination: 'Tehran',
      service: 'Economy',
      events: 4,
      steps: [
        { label: 'Accepted at origin', done: true },
        { label: 'Inter-city dispatch', done: true },
        { label: 'Central hub arrival', done: false },
        { label: 'Courier dispatch', done: false },
      ],
    },
  ];

  const currentDemo = demoParcels[selectedDemoIndex];

  return (
    <div className="min-h-screen bg-canvas text-ink selection:bg-brand/20">
      {/* Navigation Header */}
      <header className="sticky top-0 z-30 border-b border-line/70 bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />
          <nav className="flex items-center gap-2" aria-label="Public">
            <Link
              className="hidden min-h-11 items-center px-3.5 text-sm font-semibold text-muted hover:text-ink transition-colors sm:flex"
              to="/track"
            >
              Track
            </Link>
            <Link
              className="hidden min-h-11 items-center px-3.5 text-sm font-semibold text-muted hover:text-ink transition-colors sm:flex"
              to="/login"
            >
              Sign in
            </Link>
            <Button
              variant="ghost"
              className="size-10 px-0 rounded-control mr-1"
              onClick={() => setDark((v) => !v)}
              aria-label={dark ? 'Use light theme' : 'Use dark theme'}
            >
              {dark ? <Sun className="size-4.5 text-warning" /> : <Moon className="size-4.5 text-muted hover:text-ink" />}
            </Button>
            <Button onClick={() => navigate('/register')}>Create account</Button>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-line/80 bg-surface/40">
          <div className="route-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-24 lg:px-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-bold text-accent mb-6 shadow-2xs">
                <span className="size-1.5 rounded-full bg-accent animate-pulse" aria-hidden="true" />
                <p className="uppercase tracking-[0.16em]">Virtual postal operations, clearly tracked</p>
              </div>

              <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl text-ink">
                From shipment creation to the final doorstep, <span className="text-brand">every handoff stays visible.</span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
                MyPost brings customer shipping, courier delivery, and operational control into one focused platform—with explicit status rules and privacy-aware public tracking.
              </p>

              {/* Primary Tracking Search Form */}
              <form
                className="mt-8 flex max-w-xl flex-col gap-2.5 rounded-card border border-line bg-surface p-2.5 shadow-md sm:flex-row focus-within:border-brand transition-all"
                onSubmit={track}
              >
                <label className="sr-only" htmlFor="hero-code">
                  Tracking code
                </label>
                <div className="relative flex-1">
                  <input
                    id="hero-code"
                    className="min-h-12 w-full rounded-control border border-transparent bg-subtle/60 px-4 font-mono text-sm uppercase tracking-wider text-ink placeholder:text-muted/70 focus:border-brand focus:bg-surface transition-all"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    placeholder="Enter tracking code (e.g. MP-DEMO-100004)"
                  />
                </div>
                <Button type="submit" className="min-h-12 sm:px-6">
                  <ScanSearch className="size-4.5 shrink-0" />
                  <span>Track shipment</span>
                </Button>
              </form>

              {/* Seeded codes quick-select */}
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted">
                <span>Try seeded codes:</span>
                {demoParcels.map((parcel, idx) => (
                  <button
                    key={parcel.code}
                    type="button"
                    className={`font-mono font-bold rounded px-2 py-0.5 transition-all cursor-pointer ${
                      code === parcel.code
                        ? 'bg-brand text-white shadow-2xs'
                        : 'bg-subtle text-brand hover:bg-brand/10 hover:underline'
                    }`}
                    onClick={() => {
                      setCode(parcel.code);
                      setSelectedDemoIndex(idx);
                    }}
                  >
                    {parcel.code}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Hero Interactive Journey Card */}
            <div className="relative">
              <div className="absolute -inset-1 rounded-card bg-gradient-to-r from-brand/20 via-accent/20 to-brand/10 opacity-70 blur-xl" aria-hidden="true" />
              <Card className="relative overflow-hidden p-6 sm:p-7 shadow-xl border-line/80 bg-surface/95 backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-line/80 pb-5">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Active Simulation</span>
                    <p className="mt-1 font-mono text-base font-extrabold tracking-wider text-ink">{currentDemo.code}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      currentDemo.status === 'Delivered'
                        ? 'bg-success/10 text-success border border-success/20'
                        : 'bg-brand/10 text-brand border border-brand/20'
                    }`}
                  >
                    {currentDemo.status === 'Delivered' ? '✓ Delivered' : `● ${currentDemo.status}`}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 py-5 border-b border-line/60">
                  <Metric label="Route" value={`${currentDemo.origin} → ${currentDemo.destination}`} />
                  <Metric label="Service" value={currentDemo.service} />
                  <Metric label="Milestones" value={`${currentDemo.events} events`} />
                </div>

                {/* Timeline visual steps */}
                <div className="mt-6 space-y-0">
                  {currentDemo.steps.map((step, idx) => {
                    const isLast = idx === currentDemo.steps.length - 1;
                    return (
                      <div key={step.label} className="grid grid-cols-[32px_1fr] gap-3">
                        <div className="flex flex-col items-center">
                          <span
                            className={`size-3 rounded-full mt-1 transition-colors ${
                              step.done
                                ? isLast
                                  ? 'bg-success ring-4 ring-success/20'
                                  : 'bg-brand'
                                : 'bg-line ring-2 ring-line'
                            }`}
                          />
                          {!isLast && (
                            <span
                              className={`h-9 w-0.5 ${step.done ? 'bg-brand/40' : 'bg-line'}`}
                              aria-hidden="true"
                            />
                          )}
                        </div>
                        <p className={`text-sm font-semibold pb-4 ${step.done ? 'text-ink' : 'text-muted/60'}`}>
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-2 pt-4 border-t border-line/60 flex items-center justify-between">
                  <span className="text-xs text-muted">Want to inspect raw history?</span>
                  <Link
                    to={`/track/${encodeURIComponent(currentDemo.code)}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline"
                  >
                    Open live view <ChevronRight className="size-3.5" />
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Bento Grid: One Operating Picture */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-brand">
              <Boxes className="size-4" />
              <span>One operating picture</span>
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl text-ink">
              Built around the shipment, not dashboard decoration.
            </h2>
            <p className="mt-3 text-base text-muted">
              Three synchronized workspaces share one domain model, enforcing legal lifecycle transitions at every handoff.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <CapabilityCard
              icon={Boxes}
              badge="Sender Workspace"
              title="Customer shipping"
              text="Manage saved sender addresses, create deterministic priced shipments, review parcel history, and cancel eligible orders."
              actionLabel="Go to Customer"
              actionTo="/customer"
            />
            <CapabilityCard
              icon={Truck}
              badge="Courier Workspace"
              title="Courier delivery"
              text="Courier accounts only see their assigned dispatches, constrained by legal transit, arrival, and delivery failure workflows."
              actionLabel="Go to Courier"
              actionTo="/courier"
            />
            <CapabilityCard
              icon={ClipboardCheck}
              badge="Operations Control"
              title="Operational console"
              text="Assign couriers, manage return-to-sender loops, search users, inspect audit history, and monitor real-time network volume."
              actionLabel="Go to Admin"
              actionTo="/admin"
            />
          </div>
        </section>

        {/* How It Works Section */}
        <section className="border-y border-line/80 bg-surface/50">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">Predictable lifecycle</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl text-ink">How shipments move</h2>
              <p className="mt-3 text-base text-muted">
                Zero magic strings. Every status mutation validates legal business transitions and writes immutable audit events.
              </p>
            </div>

            <ol className="grid gap-8 md:grid-cols-3">
              <Step
                number="01"
                icon={PackageCheck}
                title="Create with confidence"
                text="Choose an address, recipient, shipment type, weight, dimensions, and service level. The server validates and prices it."
              />
              <Step
                number="02"
                icon={Route}
                title="Move through legal states"
                text="Operations and couriers record each accepted handoff. Terminal shipments cannot silently move backward."
              />
              <Step
                number="03"
                icon={CheckCircle2}
                title="Track the outcome"
                text="Customers see the private record; public visitors get a safe, intentionally limited tracking view."
              />
            </ol>
          </div>
        </section>

        {/* Security & Architectural Integrity Section */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="rounded-card border border-line bg-gradient-to-br from-surface to-subtle/50 p-8 sm:p-12 shadow-sm">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="flex items-center gap-2 text-brand">
                  <LockKeyhole className="size-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Security-shaped by default</span>
                </div>
                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl text-ink">
                  Identity, ownership, and privacy live on the server.
                </h2>
                <p className="mt-4 max-w-3xl leading-relaxed text-muted text-base">
                  Role policies are backed by resource checks, Identity password hashing, short access sessions, rotating HttpOnly refresh cookies, rate limits, and consistent Problem Details.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <BadgePill icon={KeyRound} label="JWT Bearer + HttpOnly Cookies" />
                  <BadgePill icon={ShieldCheck} label="Resource-level Ownership" />
                  <BadgePill icon={Eye} label="Privacy-safe Public Projections" />
                  <BadgePill icon={Database} label="PostgreSQL 17 & EF Core 10" />
                </div>
              </div>

              <div className="shrink-0 flex flex-col sm:flex-row gap-3">
                <Button size="lg" onClick={() => navigate('/register')} className="gap-2">
                  <span>Start a demo account</span>
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-line/80 bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="space-y-2">
            <Logo />
            <p className="text-xs text-muted max-w-md">
              MyPost is a portfolio demonstration product illustrating full-stack domain modeling, clean architecture, and modern UX.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-muted">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-success font-semibold">
              <span className="size-1.5 rounded-full bg-success animate-pulse" />
              All virtual nodes operational
            </span>
            <Link to="/track" className="hover:text-ink transition-colors">
              Public Tracker
            </Link>
            <Link to="/login" className="hover:text-ink transition-colors">
              Sign in
            </Link>
            <Link to="/register" className="hover:text-ink transition-colors">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 text-xs font-bold text-ink truncate">{value}</p>
    </div>
  );
}

function CapabilityCard({
  icon: Icon,
  badge,
  title,
  text,
  actionLabel,
  actionTo,
}: {
  icon: typeof Boxes;
  badge: string;
  title: string;
  text: string;
  actionLabel: string;
  actionTo: string;
}) {
  return (
    <Card className="flex flex-col p-6 sm:p-7 transition-all duration-200 hover:border-brand/50 hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="grid size-12 place-items-center rounded-control bg-brand/10 text-brand">
          <Icon className="size-6" />
        </span>
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted bg-subtle px-2.5 py-0.5 rounded">
          {badge}
        </span>
      </div>
      <h3 className="mt-5 text-xl font-bold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted flex-1">{text}</p>
      <div className="mt-6 pt-4 border-t border-line/60">
        <Link
          to={actionTo}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline"
        >
          {actionLabel} <ChevronRight className="size-3.5" />
        </Link>
      </div>
    </Card>
  );
}

function Step({
  number,
  icon: Icon,
  title,
  text,
}: {
  number: string;
  icon: typeof Boxes;
  title: string;
  text: string;
}) {
  return (
    <li className="relative rounded-card border border-line/70 bg-surface p-6 sm:p-7 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm font-extrabold tracking-wider text-accent bg-accent/10 px-2.5 py-0.5 rounded">
          {number}
        </span>
        <Icon className="size-6 text-brand" />
      </div>
      <h3 className="mt-5 text-lg font-bold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
    </li>
  );
}

function BadgePill({ icon: Icon, label }: { icon: typeof Cpu; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line/80 bg-surface px-3 py-1 text-xs font-medium text-ink shadow-2xs">
      <Icon className="size-3.5 text-brand shrink-0" />
      {label}
    </span>
  );
}
