import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Phone,
  Route,
  ShieldAlert,
  Truck,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorState, LoadingState } from '../../components/page-state';
import { StatusBadge } from '../../components/status-badge';
import { TrackingTimeline } from '../../components/tracking-timeline';
import { Button, Card, CopyButton, PageHeader, Select, Textarea } from '../../components/ui';
import { api } from '../../lib/api';
import type { DeliveryResult, ShipmentDetail } from '../../types';

export default function CourierDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const client = useQueryClient();
  const [result, setResult] = useState<DeliveryResult>('Delivered');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');

  const query = useQuery({
    queryKey: ['courier-shipment', id],
    queryFn: () => api.get<ShipmentDetail>(`/courier/shipments/${id}`),
  });

  const update = useMutation({
    mutationFn: (body: unknown) => api.post<void>(`/courier/shipments/${id}/status`, body),
    onSuccess: refresh,
  });

  const delivery = useMutation({
    mutationFn: () => api.post<void>(`/courier/shipments/${id}/delivery`, { result, note }),
    onSuccess: refresh,
  });

  async function refresh() {
    setMessage('Shipment status updated and recorded in audit ledger.');
    await client.invalidateQueries({ queryKey: ['courier-shipment', id] });
    setTimeout(() => setMessage(''), 4000);
  }

  if (query.isLoading) return <LoadingState label="Loading delivery assignment" />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;

  const shipment = query.data!;

  return (
    <>
      <div className="mb-2">
        <button
          type="button"
          onClick={() => navigate('/courier')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-ink transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to deliveries</span>
        </button>
      </div>

      <PageHeader
        eyebrow="Delivery assignment"
        title={shipment.trackingCode}
        description={`${shipment.recipientName} · ${shipment.destinationAddress.city}, ${shipment.destinationAddress.province}`}
        action={
          <div className="flex items-center gap-2">
            <CopyButton text={shipment.trackingCode} />
            <StatusBadge status={shipment.status} size="md" />
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

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-6">
          {/* Destination & Recipient Card */}
          <Card className="p-6 sm:p-7 shadow-xs border-line/80">
            <div className="flex items-center justify-between border-b border-line/70 pb-4">
              <h2 className="text-base font-bold text-ink flex items-center gap-2">
                <MapPin className="size-4 text-accent" />
                <span>Destination doorstep</span>
              </h2>
              <span className="rounded bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent uppercase">
                Final Mile
              </span>
            </div>

            <address className="mt-4 not-italic leading-relaxed text-sm text-muted">
              <div className="flex items-center gap-2 text-ink font-bold text-base mb-1">
                <User className="size-4 text-brand" />
                <span>{shipment.recipientName}</span>
              </div>
              <p className="text-ink font-medium">{shipment.destinationAddress.line1}</p>
              <p className="mt-0.5">
                {shipment.destinationAddress.city}, {shipment.destinationAddress.province}
              </p>
              <p className="font-mono text-xs text-muted/80 mt-1">
                Postal Code: <strong className="text-ink">{shipment.destinationAddress.postalCode}</strong>
              </p>

              <div className="mt-4 flex items-center gap-2 rounded-control border border-line bg-subtle/50 p-3 text-xs font-semibold text-ink">
                <Phone className="size-3.5 text-brand" />
                <span>Contact recipient: {shipment.recipientPhone}</span>
              </div>
            </address>
          </Card>

          {/* Operational Action Card */}
          <Card className="p-6 sm:p-7 shadow-xs border-line/80">
            <h2 className="text-base font-bold text-ink border-b border-line/70 pb-4">
              Next operational milestone
            </h2>

            <div className="mt-5 space-y-4">
              {shipment.status === 'Accepted' && (
                <div className="space-y-3">
                  <p className="text-xs text-muted">
                    Shipment has been received at the hub. Confirm collection to advance to transit state.
                  </p>
                  <Button
                    disabled={update.isPending}
                    onClick={() =>
                      update.mutate({
                        status: 'InTransit',
                        description: 'Courier collected shipment and initiated transit',
                      })
                    }
                    className="w-full gap-2"
                  >
                    <Route className="size-4" />
                    <span>{update.isPending ? 'Updating…' : 'Mark in transit'}</span>
                  </Button>
                </div>
              )}

              {shipment.status === 'InTransit' && (
                <div className="space-y-3">
                  <p className="text-xs text-muted">
                    Shipment is arriving in destination territory. Start final delivery run to recipient address.
                  </p>
                  <Button
                    disabled={update.isPending}
                    onClick={() =>
                      update.mutate({
                        status: 'OutForDelivery',
                        description: 'Courier started final doorstep delivery run',
                      })
                    }
                    className="w-full gap-2"
                  >
                    <Truck className="size-4" />
                    <span>{update.isPending ? 'Updating…' : 'Start out-for-delivery run'}</span>
                  </Button>
                </div>
              )}

              {shipment.status === 'OutForDelivery' && (
                <form
                  className="space-y-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    delivery.mutate();
                  }}
                >
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-ink" htmlFor="delivery-result">
                      Delivery outcome
                    </label>
                    <Select
                      id="delivery-result"
                      value={result}
                      onChange={(event) => setResult(event.target.value as DeliveryResult)}
                    >
                      <option value="Delivered">✓ Delivered successfully</option>
                      <option value="RecipientUnavailable">⚠ Recipient unavailable</option>
                      <option value="AddressNotFound">⚠ Address not found</option>
                      <option value="Refused">✕ Delivery refused</option>
                      <option value="Damaged">✕ Package damaged</option>
                      <option value="Other">Other exception</option>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-ink" htmlFor="delivery-note">
                      Operational delivery note
                    </label>
                    <Textarea
                      id="delivery-note"
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      placeholder="e.g. Left with building security, or recipient requested redelivery tomorrow."
                      className="min-h-24"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={delivery.isPending}
                    className="w-full gap-2"
                    variant={result === 'Delivered' ? 'primary' : 'secondary'}
                  >
                    {result === 'Delivered' ? (
                      <CheckCircle2 className="size-4" />
                    ) : (
                      <AlertTriangle className="size-4 text-warning" />
                    )}
                    <span>{delivery.isPending ? 'Recording milestone…' : 'Record delivery result'}</span>
                  </Button>
                </form>
              )}

              {!['Accepted', 'InTransit', 'OutForDelivery'].includes(shipment.status) && (
                <div className="rounded-control bg-subtle/70 p-4 text-xs text-muted flex items-start gap-2.5">
                  <ShieldAlert className="size-4 text-muted shrink-0 mt-0.5" />
                  <span>
                    No active courier transitions permitted. Shipment has reached terminal or administrative state ({shipment.status}).
                  </span>
                </div>
              )}
            </div>

            {(update.isError || delivery.isError) && (
              <div
                className="mt-4 rounded-control border border-danger/25 bg-danger/10 p-3 text-xs text-danger"
                role="alert"
              >
                {(update.error ?? delivery.error)?.message}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Audit Timeline */}
        <Card className="p-6 sm:p-7 shadow-xs border-line/80">
          <div className="flex items-center justify-between border-b border-line/70 pb-4 mb-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-ink">Recorded journey</h2>
              <p className="text-xs text-muted mt-0.5">Chronological audit ledger of custody handoffs</p>
            </div>
            <span className="rounded-full bg-subtle px-2.5 py-1 font-mono text-xs font-bold text-muted">
              {shipment.history.length} events
            </span>
          </div>

          <TrackingTimeline events={shipment.history} />
        </Card>
      </div>
    </>
  );
}
