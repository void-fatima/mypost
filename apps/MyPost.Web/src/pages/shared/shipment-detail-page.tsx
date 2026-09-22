import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Phone,
  Scale,
  ShieldCheck,
  Truck,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ErrorState, LoadingState } from '../../components/page-state';
import { StatusBadge } from '../../components/status-badge';
import { TrackingTimeline } from '../../components/tracking-timeline';
import { Button, Card, CopyButton, PageHeader } from '../../components/ui';
import { api } from '../../lib/api';
import type { ShipmentDetail } from '../../types';

export default function ShipmentDetailPage({ mode }: { mode: 'customer' | 'admin' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const client = useQueryClient();
  const [message, setMessage] = useState('');
  const prefix = mode === 'admin' ? '/admin' : '/customer';

  const query = useQuery({
    queryKey: ['shipment', mode, id],
    queryFn: () => api.get<ShipmentDetail>(`${prefix}/shipments/${id}`),
  });

  const cancel = useMutation({
    mutationFn: () => api.post<void>(`/customer/shipments/${id}/cancel`),
    onSuccess: async () => {
      setMessage('Shipment has been cancelled successfully.');
      await client.invalidateQueries({ queryKey: ['shipment', mode, id] });
      setTimeout(() => setMessage(''), 4000);
    },
  });

  if (query.isLoading) return <LoadingState label="Loading shipment details" />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;

  const shipment = query.data!;
  const canCancel = mode === 'customer' && ['Created', 'AwaitingPickup'].includes(shipment.status);

  return (
    <>
      <div className="mb-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-ink transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to shipments</span>
        </button>
      </div>

      <PageHeader
        eyebrow="Shipment Manifest"
        title={shipment.trackingCode}
        description={`Created ${new Intl.DateTimeFormat('en', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(new Date(shipment.createdAtUtc))} · ${shipment.serviceLevel} ${shipment.type.toLowerCase()}`}
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <CopyButton text={shipment.trackingCode} label="Copy code" />

            <Link to={`/track/${encodeURIComponent(shipment.trackingCode)}`}>
              <Button variant="secondary" size="sm" className="gap-1.5">
                <ExternalLink className="size-3.5" />
                <span>Public tracker</span>
              </Button>
            </Link>

            {canCancel && (
              <Button
                variant="danger"
                size="sm"
                className="gap-1.5"
                disabled={cancel.isPending}
                onClick={() => {
                  if (window.confirm('Cancel this shipment? This cannot be undone.')) {
                    cancel.mutate();
                  }
                }}
              >
                <Ban className="size-3.5" />
                <span>{cancel.isPending ? 'Cancelling…' : 'Cancel shipment'}</span>
              </Button>
            )}
          </div>
        }
      />

      {message && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-control border border-success/30 bg-success/10 p-3.5 text-sm font-semibold text-success animate-in fade-in"
        >
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {cancel.isError && (
        <div
          role="alert"
          className="rounded-control border border-danger/25 bg-danger/10 p-3.5 text-sm text-danger"
        >
          {cancel.error.message}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        {/* Left Column: Shipment Specs & Addresses */}
        <div className="space-y-6">
          {/* Status & Pricing Card */}
          <Card className="p-6 sm:p-7 shadow-xs border-line/80">
            <div className="flex items-start justify-between border-b border-line/70 pb-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Lifecycle Status</p>
                <div className="mt-2">
                  <StatusBadge status={shipment.status} size="md" />
                </div>
              </div>

              <div className="text-right">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Authoritative Fee</p>
                <p className="mt-1 font-mono text-xl font-extrabold text-ink">
                  {shipment.calculatedPrice.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-muted">IRR</span>
                </p>
              </div>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm divide-y divide-line/60 sm:divide-y-0 sm:grid-cols-2">
              <Fact icon={User} label="Recipient" value={shipment.recipientName} />
              <Fact icon={Phone} label="Contact phone" value={shipment.recipientPhone} />
              <Fact icon={Scale} label="Declared weight" value={`${shipment.weightGrams.toLocaleString()} g`} />
              <Fact
                icon={Truck}
                label="Courier allocation"
                value={shipment.courierUserId ? 'Assigned to courier' : 'Pending allocation'}
                badge={shipment.courierUserId ? 'Assigned' : 'Unassigned'}
              />
            </dl>

            {shipment.dimensions && (
              <div className="mt-6 rounded-control border border-line/70 bg-subtle/50 p-3.5 text-xs text-muted flex items-center justify-between">
                <span className="font-semibold text-ink">Parcel dimensions:</span>
                <span className="font-mono font-bold text-ink">
                  {shipment.dimensions.lengthCm} × {shipment.dimensions.widthCm} × {shipment.dimensions.heightCm} cm
                </span>
              </div>
            )}
          </Card>

          {/* Origin & Return Address Card */}
          <AddressCard
            title="Origin & Return Snapshot"
            badge="Sender"
            value={shipment.senderAddress}
          />

          {/* Destination Address Card */}
          <AddressCard
            title="Destination Address"
            badge="Recipient"
            value={shipment.destinationAddress}
          />
        </div>

        {/* Right Column: Complete Timeline */}
        <div>
          <Card className="p-6 sm:p-7 shadow-xs border-line/80">
            <div className="flex items-center justify-between border-b border-line/70 pb-5 mb-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-ink">Tracking history</h2>
                <p className="text-xs text-muted mt-0.5">Immutable audit events recorded across all custody handoffs</p>
              </div>
              <span className="rounded-full bg-subtle px-2.5 py-1 font-mono text-xs font-bold text-muted">
                {shipment.history.length} records
              </span>
            </div>

            <TrackingTimeline events={shipment.history} />

            <div className="mt-6 pt-5 border-t border-line/70 flex items-center justify-between text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-brand" />
                <span>Audited domain state machine</span>
              </span>
              <Link
                to={`/track/${encodeURIComponent(shipment.trackingCode)}`}
                className="font-bold text-brand hover:underline inline-flex items-center gap-1"
              >
                <span>Open public view</span>
                <ExternalLink className="size-3" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
  badge,
}: {
  icon: typeof User;
  label: string;
  value: string;
  badge?: string;
}) {
  return (
    <div className="space-y-1">
      <dt className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted">
        <Icon className="size-3.5 text-muted" aria-hidden="true" />
        <span>{label}</span>
      </dt>
      <dd className="font-bold text-ink text-sm flex items-center gap-2">
        <span className="truncate">{value}</span>
        {badge && (
          <span className="rounded bg-subtle px-1.5 py-0.5 text-[10px] font-semibold text-muted">
            {badge}
          </span>
        )}
      </dd>
    </div>
  );
}

function AddressCard({
  title,
  badge,
  value,
}: {
  title: string;
  badge: string;
  value: ShipmentDetail['senderAddress'];
}) {
  return (
    <Card className="p-6 shadow-xs border-line/80">
      <div className="flex items-center justify-between border-b border-line/60 pb-3">
        <h3 className="text-sm font-bold text-ink flex items-center gap-2">
          <MapPin className="size-4 text-accent" />
          <span>{title}</span>
        </h3>
        <span className="rounded bg-subtle px-2 py-0.5 text-[10px] font-bold uppercase text-muted">
          {badge}
        </span>
      </div>

      <address className="mt-4 text-xs not-italic leading-relaxed text-muted">
        <strong className="text-sm font-bold text-ink block">{value.label}</strong>
        <p className="mt-1 text-ink/90 font-medium">{value.line1}</p>
        <p className="mt-0.5">
          {value.city}, {value.province}
        </p>
        <p className="font-mono text-muted/80 mt-1">
          Postal Code: <span className="font-bold text-ink">{value.postalCode}</span> · {value.country}
        </p>
      </address>
    </Card>
  );
}
