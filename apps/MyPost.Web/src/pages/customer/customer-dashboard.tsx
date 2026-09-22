import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  Clock3,
  MapPin,
  PackagePlus,
  Route,
  Search,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState, ErrorState, LoadingState } from '../../components/page-state';
import { StatusBadge } from '../../components/status-badge';
import { Button, Card, CopyButton, PageHeader } from '../../components/ui';
import { api } from '../../lib/api';
import type { PagedResult, ShipmentSummary } from '../../types';

export default function CustomerDashboard() {
  const [filter, setFilter] = useState<'all' | 'active' | 'delivered'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const query = useQuery({
    queryKey: ['shipments', 'customer', 'dashboard'],
    queryFn: () => api.get<PagedResult<ShipmentSummary>>('/customer/shipments?page=1&pageSize=20'),
  });

  if (query.isLoading) return <LoadingState label="Loading customer dashboard" />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;

  const shipments = query.data!.items;
  const active = shipments.filter(
    (item) => !['Delivered', 'ReturnedToSender', 'Cancelled'].includes(item.status),
  ).length;
  const delivered = shipments.filter((item) => item.status === 'Delivered').length;
  const failed = shipments.filter((item) => item.status === 'DeliveryFailed').length;

  const filteredShipments = shipments
    .filter((s) => {
      if (filter === 'active') return !['Delivered', 'ReturnedToSender', 'Cancelled'].includes(s.status);
      if (filter === 'delivered') return s.status === 'Delivered';
      return true;
    })
    .filter((s) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        s.trackingCode.toLowerCase().includes(term) ||
        s.recipientName.toLowerCase().includes(term) ||
        s.destinationCity.toLowerCase().includes(term)
      );
    });

  return (
    <>
      <PageHeader
        eyebrow="Customer workspace"
        title="Your postal overview"
        description="Create, follow, and understand every virtual shipment from one central command view."
        action={
          <Link to="/customer/create-shipment">
            <Button size="md" className="gap-2 shadow-sm">
              <PackagePlus className="size-4" />
              <span>Create shipment</span>
            </Button>
          </Link>
        }
      />

      {/* Metric Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Boxes}
          label="Total shipments"
          value={query.data!.totalCount}
          description="All lifetime orders"
        />
        <MetricCard
          icon={Route}
          label="Active journeys"
          value={active}
          description="In transit or delivery"
          badge="Live"
        />
        <MetricCard
          icon={CheckCircle2}
          label="Delivered"
          value={delivered}
          description="Completed handoffs"
          tone="success"
        />
        <MetricCard
          icon={Clock3}
          label="Needs attention"
          value={failed}
          description="Attempted or exception"
          tone={failed > 0 ? 'danger' : 'neutral'}
        />
      </div>

      {/* Recent Shipments Section */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-ink">Recent shipments</h2>
            <p className="text-xs text-muted mt-0.5">Chronological list of shipments and latest recorded milestones</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Quick search input */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 size-3.5 text-muted" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search recipient, code..."
                className="h-8 w-44 rounded-control border border-line bg-surface pl-8 pr-3 text-xs placeholder:text-muted focus:border-brand focus:w-56 transition-all"
              />
            </div>

            {/* Filter Tabs */}
            <div className="inline-flex rounded-control border border-line bg-surface p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`rounded px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  filter === 'all' ? 'bg-brand text-white' : 'text-muted hover:text-ink'
                }`}
              >
                All ({shipments.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('active')}
                className={`rounded px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  filter === 'active' ? 'bg-brand text-white' : 'text-muted hover:text-ink'
                }`}
              >
                Active ({active})
              </button>
              <button
                type="button"
                onClick={() => setFilter('delivered')}
                className={`rounded px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  filter === 'delivered' ? 'bg-brand text-white' : 'text-muted hover:text-ink'
                }`}
              >
                Delivered ({delivered})
              </button>
            </div>

            <Link
              className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline"
              to="/customer/shipments"
            >
              <span>View all</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>

        {shipments.length === 0 ? (
          <EmptyState
            title="No shipments yet"
            description="Add a sender address, then create your first virtual shipment with live tracking."
            action={
              <Link to="/customer/addresses">
                <Button variant="secondary">Add an address</Button>
              </Link>
            }
          />
        ) : (
          <Card className="divide-y divide-line/70 overflow-hidden shadow-xs">
            {filteredShipments.slice(0, 8).map((shipment) => (
              <div
                key={shipment.id}
                className="group flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-subtle/50 transition-colors"
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="grid size-10 shrink-0 place-items-center rounded-control bg-brand/10 text-brand group-hover:bg-brand group-hover:text-white transition-colors">
                    <Boxes className="size-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/customer/shipments/${shipment.id}`}
                        className="font-mono text-xs font-bold tracking-wider text-brand hover:underline"
                      >
                        {shipment.trackingCode}
                      </Link>
                      <CopyButton text={shipment.trackingCode} />
                    </div>
                    <p className="mt-1 font-bold text-ink text-sm truncate">
                      {shipment.recipientName}
                    </p>
                    <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                      <MapPin className="size-3 text-accent shrink-0" />
                      <span>Destination: {shipment.destinationCity}</span>
                      <span className="text-muted/50">·</span>
                      <span className="capitalize">{shipment.serviceLevel} {shipment.type.toLowerCase()}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-line/50">
                  <StatusBadge status={shipment.status} size="sm" />
                  <span className="text-xs font-medium text-muted shrink-0">
                    {new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(
                      new Date(shipment.createdAtUtc),
                    )}
                  </span>
                  <Link
                    to={`/customer/shipments/${shipment.id}`}
                    className="rounded p-1.5 text-muted hover:bg-subtle hover:text-ink transition-colors"
                    aria-label={`View details for shipment ${shipment.trackingCode}`}
                  >
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>
    </>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  description,
  badge,
  tone = 'neutral',
}: {
  icon: typeof Boxes;
  label: string;
  value: number;
  description?: string;
  badge?: string;
  tone?: 'neutral' | 'success' | 'danger';
}) {
  return (
    <Card className="p-5 shadow-xs hover:shadow-sm transition-shadow">
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
      {description && <p className="mt-1.5 text-xs text-muted">{description}</p>}
    </Card>
  );
}
