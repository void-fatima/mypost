import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Clock3,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  Truck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ErrorState, LoadingState } from '../../components/page-state';
import { Button, Card, PageHeader } from '../../components/ui';
import { api } from '../../lib/api';
import type { OperationsOverview } from '../../types';

export default function AdminOverview() {
  const query = useQuery({
    queryKey: ['admin-overview'],
    queryFn: () => api.get<OperationsOverview>('/admin/overview'),
  });

  if (query.isLoading) return <LoadingState label="Loading operations overview" />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;

  const data = query.data!;
  const inTransitTotal = data.inTransit + data.outForDelivery;

  return (
    <>
      <PageHeader
        eyebrow="Operations control"
        title="Network overview"
        description="Factual telemetry of persisted virtual shipments across all postal transit stages. Zero simulated live mock coordinates."
        action={
          <Link to="/admin/shipments">
            <Button className="gap-2 shadow-sm">
              <Boxes className="size-4" />
              <span>Manage shipments</span>
            </Button>
          </Link>
        }
      />

      {/* Network Volume KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewMetric
          icon={Boxes}
          label="Total network volume"
          value={data.totalShipments}
          subtext="Cumulative lifecycle shipments"
        />
        <OverviewMetric
          icon={Truck}
          label="In active transit"
          value={inTransitTotal}
          subtext={`${data.inTransit} linehaul · ${data.outForDelivery} courier`}
          badge="Live"
        />
        <OverviewMetric
          icon={CheckCircle2}
          label="Successfully delivered"
          value={data.delivered}
          subtext="Verified doorstep handoffs"
          tone="success"
        />
        <OverviewMetric
          icon={AlertTriangle}
          label="Delivery exceptions"
          value={data.deliveryFailed}
          subtext="Requires retry or return action"
          tone={data.deliveryFailed > 0 ? 'danger' : 'neutral'}
        />
      </div>

      {/* Split Console: Operational Queues & Booked Value */}
      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        {/* Operational Queues */}
        <Card className="p-6 sm:p-7 shadow-xs border-line/80">
          <div className="flex items-center justify-between border-b border-line/70 pb-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-ink">Operational handoff queue</h2>
              <p className="text-xs text-muted mt-0.5">Parcels currently awaiting human or vehicle transition</p>
            </div>
            <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-bold text-brand">
              Real-time
            </span>
          </div>

          <div className="mt-6 grid gap-3.5 sm:grid-cols-2">
            <QueueCard
              icon={Clock3}
              label="Awaiting pickup"
              value={data.awaitingPickup}
              statusKey="AwaitingPickup"
              hint="Ready for carrier acceptance"
            />
            <QueueCard
              icon={Truck}
              label="Out for delivery"
              value={data.outForDelivery}
              statusKey="OutForDelivery"
              hint="Courier on final mile route"
            />
            <QueueCard
              icon={AlertTriangle}
              label="Failed attempts"
              value={data.deliveryFailed}
              statusKey="DeliveryFailed"
              hint="Awaiting dispatch retry"
              tone={data.deliveryFailed > 0 ? 'danger' : 'neutral'}
            />
            <QueueCard
              icon={RotateCcw}
              label="Return pipeline"
              value={data.returning}
              statusKey="ReturningToSender"
              hint="En route to sender snapshot"
            />
          </div>
        </Card>

        {/* Booked Revenue / Value */}
        <div className="space-y-6">
          <Card className="p-6 sm:p-7 shadow-xs border-line/80 bg-gradient-to-br from-surface to-subtle/50">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                Booked postal volume
              </span>
              <span className="grid size-9 place-items-center rounded-control bg-success/10 text-success">
                <TrendingUp className="size-4.5" />
              </span>
            </div>

            <p className="mt-4 font-mono text-3xl font-extrabold tracking-tight text-ink">
              {data.totalRevenue.toLocaleString()}{' '}
              <span className="text-sm font-sans font-medium text-muted">IRR</span>
            </p>

            <p className="mt-3 text-xs leading-relaxed text-muted">
              Authoritatively calculated postage across all non-cancelled parcels based on distance, weight, and service tiers.
            </p>

            <div className="mt-6 pt-5 border-t border-line/70">
              <Link
                to="/admin/analytics"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline"
              >
                <span>View status distribution charts</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </Card>

          <Card className="p-5 border-line/70 bg-subtle/40">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
              <ShieldCheck className="size-4 text-brand" />
              <span>Domain Integrity</span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Every status modification is strictly governed by the domain aggregate. Illegal state skips are rejected with RFC 7807 Problem Details.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}

function OverviewMetric({
  icon: Icon,
  label,
  value,
  subtext,
  badge,
  tone = 'neutral',
}: {
  icon: typeof Boxes;
  label: string;
  value: number;
  subtext: string;
  badge?: string;
  tone?: 'neutral' | 'success' | 'danger';
}) {
  return (
    <Card className="p-5 shadow-xs border-line/80 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-muted">{label}</span>
        <span
          className={`grid size-9 place-items-center rounded-control ${
            tone === 'danger'
              ? 'bg-danger/10 text-danger'
              : tone === 'success'
                ? 'bg-success/10 text-success'
                : 'bg-brand/10 text-brand'
          }`}
        >
          <Icon className="size-4.5" />
        </span>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <p className="text-3xl font-extrabold tracking-tight tabular-nums text-ink">{value}</p>
        {badge && (
          <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent">
            <span className="size-1 rounded-full bg-accent animate-pulse" />
            {badge}
          </span>
        )}
      </div>

      <p className="mt-1.5 text-xs text-muted">{subtext}</p>
    </Card>
  );
}

function QueueCard({
  icon: Icon,
  label,
  value,
  statusKey,
  hint,
  tone = 'neutral',
}: {
  icon: typeof Clock3;
  label: string;
  value: number;
  statusKey: string;
  hint: string;
  tone?: 'neutral' | 'danger';
}) {
  return (
    <Link
      to={`/admin/shipments?status=${statusKey}`}
      className="group flex flex-col justify-between rounded-card border border-line bg-surface p-4 hover:border-brand/60 hover:shadow-xs transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className={`grid size-8 place-items-center rounded-control ${
              tone === 'danger' ? 'bg-danger/10 text-danger' : 'bg-brand/10 text-brand'
            }`}
          >
            <Icon className="size-4" />
          </span>
          <span className="text-sm font-bold text-ink group-hover:text-brand transition-colors">
            {label}
          </span>
        </div>
        <strong className="font-mono text-xl font-extrabold text-ink">{value}</strong>
      </div>
      <p className="mt-3 text-[11px] text-muted flex items-center justify-between">
        <span>{hint}</span>
        <ArrowRight className="size-3 text-muted/60 group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
      </p>
    </Link>
  );
}
