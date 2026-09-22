import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowRight,
  Clock,
  Compass,
  MapPin,
  Route,
  Search,
  Truck,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState, ErrorState, LoadingState } from '../../components/page-state';
import { StatusBadge } from '../../components/status-badge';
import { Button, Card, CopyButton, PageHeader } from '../../components/ui';
import { api } from '../../lib/api';
import type { PagedResult, ShipmentSummary } from '../../types';

export default function CourierDashboard() {
  const [filter, setFilter] = useState<'all' | 'out' | 'attention'>('all');
  const [search, setSearch] = useState('');

  const query = useQuery({
    queryKey: ['courier-shipments'],
    queryFn: () => api.get<PagedResult<ShipmentSummary>>('/courier/shipments?page=1&pageSize=50'),
  });

  if (query.isLoading) return <LoadingState label="Loading assigned deliveries" />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;

  const items = query.data!.items;
  const outForDelivery = items.filter((item) => item.status === 'OutForDelivery').length;
  const needsAttention = items.filter((item) => item.status === 'DeliveryFailed').length;

  const filteredItems = items
    .filter((s) => {
      if (filter === 'out') return s.status === 'OutForDelivery';
      if (filter === 'attention') return s.status === 'DeliveryFailed';
      return true;
    })
    .filter((s) => {
      if (!search) return true;
      const term = search.toLowerCase();
      return (
        s.trackingCode.toLowerCase().includes(term) ||
        s.recipientName.toLowerCase().includes(term) ||
        s.destinationCity.toLowerCase().includes(term)
      );
    });

  return (
    <>
      <PageHeader
        eyebrow="Courier workspace"
        title="Assigned deliveries"
        description="Only shipments currently assigned to your account appear here. Open any delivery to record verified handoffs."
      />

      {/* KPI Metrics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5 shadow-xs border-line/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Assigned queue</span>
            <span className="grid size-9 place-items-center rounded-control bg-accent/10 text-accent">
              <Truck className="size-4.5" />
            </span>
          </div>
          <p className="mt-4 text-3xl font-extrabold tracking-tight tabular-nums text-ink">{items.length}</p>
          <p className="mt-1 text-xs text-muted">Active parcel dispatches</p>
        </Card>

        <Card className="p-5 shadow-xs border-line/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Out for delivery</span>
            <span className="grid size-9 place-items-center rounded-control bg-brand/10 text-brand">
              <Route className="size-4.5" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <p className="text-3xl font-extrabold tracking-tight tabular-nums text-ink">{outForDelivery}</p>
            {outForDelivery > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand">
                <span className="size-1 rounded-full bg-brand animate-pulse" />
                Active now
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted">En route to doorsteps</p>
        </Card>

        <Card className="p-5 shadow-xs border-line/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Needs attention</span>
            <span
              className={`grid size-9 place-items-center rounded-control ${
                needsAttention > 0 ? 'bg-danger/10 text-danger' : 'bg-subtle text-muted'
              }`}
            >
              <AlertCircle className="size-4.5" />
            </span>
          </div>
          <p className="mt-4 text-3xl font-extrabold tracking-tight tabular-nums text-ink">{needsAttention}</p>
          <p className="mt-1 text-xs text-muted">Failed delivery attempts</p>
        </Card>
      </div>

      {/* Delivery Task Queue */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-ink">Delivery tasks</h2>
            <p className="text-xs text-muted mt-0.5">Assigned orders awaiting transit progression or doorstep handoff</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 size-3.5 text-muted" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search delivery..."
                className="h-8.5 w-40 rounded-control border border-line bg-surface pl-8 pr-3 text-xs placeholder:text-muted focus:border-brand focus:w-52 transition-all"
              />
            </div>

            {/* Filter Pills */}
            <div className="inline-flex rounded-control border border-line bg-surface p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`rounded px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  filter === 'all' ? 'bg-brand text-white' : 'text-muted hover:text-ink'
                }`}
              >
                All ({items.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('out')}
                className={`rounded px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  filter === 'out' ? 'bg-brand text-white' : 'text-muted hover:text-ink'
                }`}
              >
                Out for delivery ({outForDelivery})
              </button>
              <button
                type="button"
                onClick={() => setFilter('attention')}
                className={`rounded px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  filter === 'attention' ? 'bg-brand text-white' : 'text-muted hover:text-ink'
                }`}
              >
                Failed ({needsAttention})
              </button>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <EmptyState
            title="No assigned deliveries"
            description="Your courier queue is clear. An administrator will assign shipments to your account when available."
          />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title="No matching deliveries"
            description="No assigned deliveries match your search or filter criteria."
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setFilter('all');
                  setSearch('');
                }}
              >
                Reset filters
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredItems.map((shipment) => (
              <Link key={shipment.id} to={`/courier/shipments/${shipment.id}`} className="block group">
                <Card className="h-full p-5 sm:p-6 shadow-xs group-hover:border-brand group-hover:shadow-md transition-all border-line/80">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-extrabold tracking-wider text-brand">
                        {shipment.trackingCode}
                      </span>
                      <CopyButton text={shipment.trackingCode} />
                    </div>
                    <StatusBadge status={shipment.status} size="sm" />
                  </div>

                  <h3 className="mt-4 text-base font-bold text-ink group-hover:text-brand transition-colors">
                    {shipment.recipientName}
                  </h3>

                  <div className="mt-2 text-xs text-muted space-y-1">
                    <p className="flex items-center gap-1 text-ink/80 font-medium">
                      <MapPin className="size-3 text-accent shrink-0" />
                      <span>{shipment.destinationCity}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Compass className="size-3 text-muted shrink-0" />
                      <span className="capitalize">
                        {shipment.serviceLevel} · {shipment.type.toLowerCase()}
                      </span>
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-line/60 pt-3.5 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      <span>
                        {new Intl.DateTimeFormat('en', { dateStyle: 'short' }).format(
                          new Date(shipment.createdAtUtc),
                        )}
                      </span>
                    </span>

                    <span className="font-bold text-brand group-hover:underline inline-flex items-center gap-1">
                      <span>Open delivery</span>
                      <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
