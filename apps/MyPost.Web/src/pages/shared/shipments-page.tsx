import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MapPin,
  PackagePlus,
  RotateCcw,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { SearchField } from '../../components/app-shell';
import { EmptyState, ErrorState, LoadingState } from '../../components/page-state';
import { StatusBadge, statusLabels } from '../../components/status-badge';
import { Button, Card, CopyButton, PageHeader, Select } from '../../components/ui';
import { api } from '../../lib/api';
import type { PagedResult, ShipmentSummary } from '../../types';

export default function ShipmentsPage({ mode }: { mode: 'customer' | 'admin' }) {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get('page') ?? 1);
  const status = params.get('status') ?? '';
  const search = params.get('search') ?? '';
  const endpoint = mode === 'admin' ? '/admin/shipments' : '/customer/shipments';
  const queryString = new URLSearchParams({ page: String(page), pageSize: '10' });
  if (status) queryString.set('status', status);
  if (search) queryString.set('search', search);

  const query = useQuery({
    queryKey: ['shipments', mode, page, status, search],
    queryFn: () => api.get<PagedResult<ShipmentSummary>>(`${endpoint}?${queryString}`),
  });

  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.set('page', '1');
    setParams(next, { replace: true });
  }

  function clearFilters() {
    setParams(new URLSearchParams(), { replace: true });
  }

  const hasFilters = Boolean(status || search);

  return (
    <>
      <PageHeader
        eyebrow={mode === 'admin' ? 'Operations Control' : 'Customer Workspace'}
        title={mode === 'admin' ? 'Shipment directory' : 'Your shipments'}
        description={
          mode === 'admin'
            ? 'Search, filter, inspect, and advance shipments through valid operational states across the network.'
            : 'Track the complete recorded journey and legal status transitions of all your shipments.'
        }
        action={
          mode === 'customer' ? (
            <Link to="/customer/create-shipment">
              <Button className="gap-2 shadow-sm">
                <PackagePlus className="size-4" />
                <span>Create shipment</span>
              </Button>
            </Link>
          ) : undefined
        }
      />

      {/* Filter and Search Bar */}
      <Card className="p-4 shadow-xs border-line/80">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <SearchField
              value={search}
              onChange={(value) => update('search', value)}
              placeholder="Search tracking code, recipient, city..."
            />
          </div>

          <div className="flex items-center gap-2 sm:w-64">
            <label className="sr-only" htmlFor="status-filter">
              Filter by status
            </label>
            <Select
              id="status-filter"
              value={status}
              onChange={(event) => update('status', event.target.value)}
              className="min-h-11"
            >
              <option value="">All lifecycle statuses</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="shrink-0 text-xs text-muted hover:text-ink gap-1 px-2.5"
                title="Clear active filters"
              >
                <RotateCcw className="size-3.5" />
                <span>Reset</span>
              </Button>
            )}
          </div>
        </div>
      </Card>

      {query.isLoading && <LoadingState label="Loading shipments" />}
      {query.isError && <ErrorState error={query.error} onRetry={() => void query.refetch()} />}

      {query.data?.items.length === 0 && (
        <EmptyState
          title="No shipments match"
          description={
            hasFilters
              ? 'No records match your active search or filter criteria. Try clearing or relaxing them.'
              : 'You have not created any shipments yet. Get started by creating your first shipment.'
          }
          action={
            hasFilters ? (
              <Button variant="secondary" onClick={clearFilters} className="gap-1.5">
                <RotateCcw className="size-4" /> Clear filters
              </Button>
            ) : mode === 'customer' ? (
              <Link to="/customer/create-shipment">
                <Button>Create shipment</Button>
              </Link>
            ) : undefined
          }
        />
      )}

      {query.data && query.data.items.length > 0 && (
        <>
          <Card className="overflow-hidden shadow-xs border-line/80">
            {/* Desktop Table View */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse text-left text-sm">
                <caption className="sr-only">Shipments list</caption>
                <thead className="border-b border-line bg-subtle/60 text-xs font-bold uppercase tracking-wider text-muted">
                  <tr>
                    <Header>Tracking Identifier</Header>
                    <Header>Recipient</Header>
                    <Header>Destination</Header>
                    <Header>Type & Service</Header>
                    <Header>Status</Header>
                    <Header>Created</Header>
                    <Header>
                      <span className="sr-only">Open details</span>
                    </Header>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/70">
                  {query.data.items.map((shipment) => (
                    <tr
                      key={shipment.id}
                      className="group hover:bg-subtle/40 transition-colors"
                    >
                      <Cell>
                        <div className="flex items-center gap-1.5">
                          <Link
                            to={`${shipment.id}`}
                            className="font-mono text-xs font-extrabold tracking-wider text-brand hover:underline"
                          >
                            {shipment.trackingCode}
                          </Link>
                          <CopyButton text={shipment.trackingCode} />
                        </div>
                      </Cell>
                      <Cell>
                        <span className="font-bold text-ink">{shipment.recipientName}</span>
                      </Cell>
                      <Cell>
                        <span className="inline-flex items-center gap-1 text-muted font-medium">
                          <MapPin className="size-3 text-accent shrink-0" />
                          {shipment.destinationCity}
                        </span>
                      </Cell>
                      <Cell>
                        <span className="text-xs font-semibold capitalize text-muted">
                          {shipment.serviceLevel} · {shipment.type.toLowerCase()}
                        </span>
                      </Cell>
                      <Cell>
                        <StatusBadge status={shipment.status} size="sm" />
                      </Cell>
                      <Cell>
                        <span className="text-xs text-muted font-medium">
                          {new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(
                            new Date(shipment.createdAtUtc),
                          )}
                        </span>
                      </Cell>
                      <Cell>
                        <Link
                          className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline"
                          to={`${shipment.id}`}
                        >
                          <span>View</span>
                          <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </Cell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="divide-y divide-line/70 md:hidden">
              {query.data.items.map((shipment) => (
                <Link
                  key={shipment.id}
                  to={`${shipment.id}`}
                  className="block p-4 hover:bg-subtle/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-extrabold tracking-wider text-brand">
                        {shipment.trackingCode}
                      </span>
                    </div>
                    <StatusBadge status={shipment.status} size="sm" />
                  </div>

                  <p className="mt-2 text-sm font-bold text-ink">{shipment.recipientName}</p>

                  <div className="mt-1 flex items-center justify-between text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3 text-accent shrink-0" />
                      {shipment.destinationCity}
                    </span>
                    <span>
                      {new Intl.DateTimeFormat('en', { dateStyle: 'short' }).format(
                        new Date(shipment.createdAtUtc),
                      )}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          {/* Pagination Controls */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-muted pt-1">
            <p className="text-xs font-medium">
              Showing page <strong className="font-bold text-ink">{query.data.page}</strong> of{' '}
              <strong className="font-bold text-ink">{Math.max(1, query.data.totalPages)}</strong> ·{' '}
              <strong className="font-bold text-ink">{query.data.totalCount}</strong> total shipments
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                aria-label="Previous page"
                disabled={page <= 1}
                onClick={() => update('page', String(page - 1))}
                className="gap-1"
              >
                <ChevronLeft className="size-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                aria-label="Next page"
                disabled={page >= query.data.totalPages}
                onClick={() => update('page', String(page + 1))}
                className="gap-1"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function Header({ children }: React.PropsWithChildren) {
  return <th scope="col" className="px-4 py-3.5 font-bold">{children}</th>;
}

function Cell({ children }: React.PropsWithChildren) {
  return <td className="px-4 py-3.5">{children}</td>;
}
