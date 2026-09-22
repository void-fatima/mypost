import { AlertTriangle, Check, MapPin, PackageCheck, Route, Truck } from 'lucide-react';
import clsx from 'clsx';
import type { ShipmentStatus, TrackingEvent } from '../types';
import { StatusBadge } from './status-badge';

function getMilestoneIcon(status: ShipmentStatus, isLatest: boolean) {
  if (status === 'Delivered') return Check;
  if (status === 'DeliveryFailed') return AlertTriangle;
  if (status === 'OutForDelivery') return Truck;
  if (status === 'InTransit') return Route;
  if (status === 'Accepted') return PackageCheck;
  if (isLatest) return Route;
  return Check;
}

export function TrackingTimeline({ events }: { events: TrackingEvent[] }) {
  return (
    <ol className="relative space-y-0" aria-label="Shipment history">
      {events.map((event, index) => {
        const isLatest = index === events.length - 1;
        const Icon = getMilestoneIcon(event.status, isLatest);
        const isTerminalFailure = event.status === 'DeliveryFailed' || event.status === 'Cancelled';
        const isDelivered = event.status === 'Delivered';

        return (
          <li key={`${event.status}-${event.occurredAtUtc}-${index}`} className="relative grid grid-cols-[40px_1fr] gap-4">
            {/* Left track column */}
            <div className="flex flex-col items-center">
              <span
                className={clsx(
                  'relative z-10 grid size-9 shrink-0 place-items-center rounded-full border-2 transition-all duration-200',
                  isDelivered
                    ? 'border-success bg-success/15 text-success dark:bg-success/20'
                    : isTerminalFailure
                      ? 'border-danger bg-danger/15 text-danger dark:bg-danger/20'
                      : isLatest
                        ? 'border-brand bg-brand text-white shadow-md shadow-brand/30 ring-4 ring-brand/15 dark:ring-brand/25'
                        : 'border-brand/50 bg-surface text-brand/70 hover:border-brand',
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
              </span>
              {index < events.length - 1 && (
                <span
                  className={clsx(
                    'min-h-12 w-0.5 flex-1 transition-colors',
                    isDelivered ? 'bg-success/40' : 'bg-brand/30 dark:bg-brand/20',
                  )}
                  aria-hidden="true"
                />
              )}
            </div>

            {/* Right content card */}
            <div className="pb-8">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={event.status} size="sm" />
                {isLatest && !isDelivered && !isTerminalFailure && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-bold text-brand">
                    <span className="size-1.5 rounded-full bg-brand animate-ping" aria-hidden="true" />
                    Latest update
                  </span>
                )}
              </div>

              <p className="mt-2 text-sm font-bold text-ink leading-snug">{event.description}</p>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                <time dateTime={event.occurredAtUtc} className="font-medium">
                  {new Intl.DateTimeFormat('en', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(new Date(event.occurredAtUtc))}
                </time>
                {event.location && (
                  <span className="inline-flex items-center gap-1 text-muted/90 font-medium">
                    <MapPin className="size-3 text-accent shrink-0" aria-hidden="true" />
                    {event.location}
                  </span>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
