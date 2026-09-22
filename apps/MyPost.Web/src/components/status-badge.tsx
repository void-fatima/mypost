import { AlertTriangle, Ban, CheckCircle2, Clock3, PackageCheck, RotateCcw, Route, Truck } from 'lucide-react';
import clsx from 'clsx';
import type { ShipmentStatus } from '../types';

export const statusLabels: Record<ShipmentStatus, string> = {
  Created: 'Created',
  AwaitingPickup: 'Awaiting pickup',
  Accepted: 'Accepted',
  InTransit: 'In transit',
  OutForDelivery: 'Out for delivery',
  DeliveryFailed: 'Delivery failed',
  Delivered: 'Delivered',
  ReturnInitiated: 'Return initiated',
  ReturningToSender: 'Returning to sender',
  ReturnedToSender: 'Returned to sender',
  Cancelled: 'Cancelled',
};

export function StatusBadge({ status, size = 'sm' }: { status: ShipmentStatus; size?: 'sm' | 'md' }) {
  const Icon =
    status === 'Delivered'
      ? CheckCircle2
      : status === 'DeliveryFailed'
        ? AlertTriangle
        : status === 'Cancelled'
          ? Ban
          : status.includes('Return')
            ? RotateCcw
            : status === 'OutForDelivery'
              ? Truck
              : status === 'InTransit'
                ? Route
                : status === 'Accepted'
                  ? PackageCheck
                  : Clock3;

  const isLive = status === 'InTransit' || status === 'OutForDelivery';

  const tone =
    status === 'Delivered'
      ? 'text-success bg-success/10 border-success/25 dark:bg-success/15 dark:text-success'
      : status === 'DeliveryFailed' || status === 'Cancelled'
        ? 'text-danger bg-danger/10 border-danger/25 dark:bg-danger/15 dark:text-danger'
        : status.includes('Return') || status === 'AwaitingPickup'
          ? 'text-warning bg-warning/10 border-warning/25 dark:bg-warning/15 dark:text-warning'
          : 'text-info bg-info/10 border-info/25 dark:bg-info/15 dark:text-info';

  return (
    <span
      className={clsx(
        'inline-flex w-fit items-center gap-1.5 rounded-full font-semibold border transition-all duration-150',
        size === 'sm' && 'px-2.5 py-0.5 text-xs',
        size === 'md' && 'px-3 py-1 text-sm',
        tone,
      )}
    >
      <Icon className={clsx('shrink-0', size === 'sm' ? 'size-3.5' : 'size-4', isLive && 'animate-pulse')} aria-hidden="true" />
      {statusLabels[status]}
    </span>
  );
}
