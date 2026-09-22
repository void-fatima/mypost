import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  CheckCircle2,
  RotateCcw,
  ShieldAlert,
  Truck,
  UserRoundCheck,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorState, LoadingState } from '../../components/page-state';
import { StatusBadge, statusLabels } from '../../components/status-badge';
import { TrackingTimeline } from '../../components/tracking-timeline';
import { Button, Card, CopyButton, Field, Input, PageHeader, Select } from '../../components/ui';
import { api } from '../../lib/api';
import type { PagedResult, ShipmentDetail, ShipmentStatus, UserSummary } from '../../types';

export default function AdminShipmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const client = useQueryClient();
  const [courierId, setCourierId] = useState('');
  const [status, setStatus] = useState<ShipmentStatus>('Accepted');
  const [description, setDescription] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [message, setMessage] = useState('');

  const shipment = useQuery({
    queryKey: ['shipment', 'admin', id],
    queryFn: () => api.get<ShipmentDetail>(`/admin/shipments/${id}`),
  });

  const users = useQuery({
    queryKey: ['admin-users', 'couriers'],
    queryFn: () => api.get<PagedResult<UserSummary>>('/admin/users?page=1&pageSize=100&search='),
  });

  async function refresh(messageText: string) {
    setMessage(messageText);
    await client.invalidateQueries({ queryKey: ['shipment', 'admin', id] });
    await client.invalidateQueries({ queryKey: ['admin-overview'] });
    setTimeout(() => setMessage(''), 4000);
  }

  const assign = useMutation({
    mutationFn: () => api.post<void>(`/admin/shipments/${id}/assign`, { courierUserId: courierId }),
    onSuccess: () => refresh('Courier assignment saved successfully.'),
  });

  const transition = useMutation({
    mutationFn: () => api.post<void>(`/admin/shipments/${id}/status`, { status, description }),
    onSuccess: () => refresh('Shipment status updated and recorded in audit ledger.'),
  });

  const initiateReturn = useMutation({
    mutationFn: () => api.post<void>(`/admin/shipments/${id}/return`, { reason: returnReason }),
    onSuccess: () => refresh('Return-to-sender workflow initiated.'),
  });

  if (shipment.isLoading || users.isLoading) return <LoadingState label="Loading operational shipment detail" />;
  if (shipment.isError) return <ErrorState error={shipment.error} onRetry={() => void shipment.refetch()} />;
  if (users.isError) return <ErrorState error={users.error} onRetry={() => void users.refetch()} />;

  const data = shipment.data!;
  const couriers = users.data!.items.filter((user) => user.role === 'Courier' && user.isActive);
  const error = assign.error ?? transition.error ?? initiateReturn.error;

  return (
    <>
      <div className="mb-2">
        <button
          type="button"
          onClick={() => navigate('/admin/shipments')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-ink transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to shipment directory</span>
        </button>
      </div>

      <PageHeader
        eyebrow="Operational shipment control"
        title={data.trackingCode}
        description={`${data.recipientName} · ${data.destinationAddress.city}, ${data.destinationAddress.province} · ${data.serviceLevel} ${data.type.toLowerCase()}`}
        action={
          <div className="flex items-center gap-2">
            <CopyButton text={data.trackingCode} />
            <StatusBadge status={data.status} size="md" />
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

      {error && (
        <div
          role="alert"
          className="rounded-control border border-danger/25 bg-danger/10 p-3.5 text-sm text-danger"
        >
          {error.message}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        {/* Left Column: Admin Operational Controls */}
        <div className="space-y-6">
          {/* Quick Context Card */}
          <Card className="p-6 shadow-xs border-line/80">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted border-b border-line/60 pb-3">
              Shipment context
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted block">Recipient</span>
                <strong className="text-sm text-ink">{data.recipientName}</strong>
              </div>
              <div>
                <span className="text-muted block">Contact</span>
                <strong className="text-sm font-mono text-ink">{data.recipientPhone}</strong>
              </div>
              <div>
                <span className="text-muted block">Destination</span>
                <span className="text-ink font-medium">{data.destinationAddress.city}, {data.destinationAddress.province}</span>
              </div>
              <div>
                <span className="text-muted block">Assigned Courier</span>
                <span className="font-semibold text-brand">
                  {couriers.find((c) => c.id === data.courierUserId)?.displayName ?? (data.courierUserId ? 'Assigned' : 'Unassigned')}
                </span>
              </div>
            </div>
          </Card>

          {/* Courier Assignment */}
          <Card className="p-6 sm:p-7 shadow-xs border-line/80">
            <div className="flex items-center justify-between border-b border-line/70 pb-3.5">
              <h2 className="text-base font-bold text-ink flex items-center gap-2">
                <Truck className="size-4 text-brand" />
                <span>Courier allocation</span>
              </h2>
              <span className="text-xs text-muted font-medium">{couriers.length} available</span>
            </div>

            <div className="mt-4 space-y-4">
              <Field label="Assign active courier" htmlFor="courier">
                <Select
                  id="courier"
                  value={courierId}
                  onChange={(event) => setCourierId(event.target.value)}
                >
                  <option value="">Select a courier from pool</option>
                  {couriers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.displayName} ({user.email})
                    </option>
                  ))}
                </Select>
              </Field>

              <Button
                disabled={!courierId || assign.isPending}
                onClick={() => assign.mutate()}
                className="w-full gap-2"
              >
                <UserRoundCheck className="size-4" />
                <span>{assign.isPending ? 'Assigning courier…' : 'Save courier assignment'}</span>
              </Button>
            </div>
          </Card>

          {/* Status Transition */}
          <Card className="p-6 sm:p-7 shadow-xs border-line/80">
            <h2 className="text-base font-bold text-ink border-b border-line/70 pb-3.5">
              Operational status transition
            </h2>

            <div className="mt-4 space-y-4">
              <Field label="Next legal status" htmlFor="next-status">
                <Select
                  id="next-status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value as ShipmentStatus)}
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field
                label="Public-facing event audit note"
                htmlFor="description"
                hint="Visible on public tracking milestones"
              >
                <Input
                  id="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="e.g. Scanned at central Tehran sorting hub"
                />
              </Field>

              <Button
                disabled={!description || transition.isPending}
                onClick={() => transition.mutate()}
                className="w-full"
              >
                {transition.isPending ? 'Updating lifecycle…' : 'Advance shipment status'}
              </Button>
            </div>
          </Card>

          {/* Return To Sender */}
          <Card className="border-warning/40 bg-warning/5 dark:bg-warning/10 p-6 sm:p-7 shadow-xs">
            <div className="flex items-center gap-2 text-warning mb-1">
              <ShieldAlert className="size-4" />
              <h2 className="text-base font-bold text-ink">Initiate return-to-sender</h2>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Available only from domain-permitted states (e.g. DeliveryFailed or InTransit). Invalid transitions will be rejected by the domain model.
            </p>

            <div className="mt-4 space-y-4">
              <Field label="Return authorization reason" htmlFor="return-reason">
                <Input
                  id="return-reason"
                  value={returnReason}
                  onChange={(event) => setReturnReason(event.target.value)}
                  placeholder="e.g. 3 failed delivery attempts, address unlocatable"
                />
              </Field>

              <Button
                variant="secondary"
                disabled={!returnReason || initiateReturn.isPending}
                onClick={() => {
                  if (window.confirm('Initiate return-to-sender? This will reverse transit towards the sender address.')) {
                    initiateReturn.mutate();
                  }
                }}
                className="w-full gap-2 border-warning/40 text-warning hover:bg-warning/10"
              >
                <RotateCcw className="size-4" />
                <span>{initiateReturn.isPending ? 'Initiating…' : 'Initiate return to sender'}</span>
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column: Persisted Audit Ledger */}
        <Card className="p-6 sm:p-7 shadow-xs border-line/80">
          <div className="flex items-center justify-between border-b border-line/70 pb-4 mb-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-ink">Persisted audit timeline</h2>
              <p className="text-xs text-muted mt-0.5">Immutable event history stored with optimistic concurrency</p>
            </div>
            <span className="rounded-full bg-subtle px-2.5 py-1 font-mono text-xs font-bold text-muted">
              {data.history.length} records
            </span>
          </div>

          <TrackingTimeline events={data.history} />
        </Card>
      </div>
    </>
  );
}
