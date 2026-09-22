import { AlertCircle, Inbox, RefreshCw } from 'lucide-react';
import { Button, Card } from './ui';

export function LoadingState({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="space-y-6" aria-busy="true" aria-label={label}>
      <span className="sr-only">{label}</span>
      {/* Top skeleton header */}
      <div className="space-y-3">
        <div className="skeleton h-5 w-32 rounded-control" />
        <div className="skeleton h-8 w-64 rounded-control" />
      </div>

      {/* Metric cards skeleton grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-28 rounded-card" />
        ))}
      </div>

      {/* Main card skeleton */}
      <div className="skeleton h-64 rounded-card" />
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="relative overflow-hidden flex min-h-72 flex-col items-center justify-center p-8 text-center border-dashed border-2 border-line">
      <div className="mb-4 relative">
        <span className="grid size-14 place-items-center rounded-2xl bg-brand/10 text-brand shadow-inner">
          <Inbox className="size-7" aria-hidden="true" />
        </span>
      </div>
      <h2 className="text-xl font-bold tracking-tight text-ink">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted">{description}</p>
      {action && <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div>}
    </Card>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while loading this view.';
  return (
    <Card className="flex min-h-60 flex-col items-center justify-center p-8 text-center border-danger/30 bg-danger/5 dark:bg-danger/10" role="alert">
      <span className="mb-4 grid size-12 place-items-center rounded-full bg-danger/15 text-danger">
        <AlertCircle className="size-6" aria-hidden="true" />
      </span>
      <h2 className="text-lg font-bold text-ink">We could not load this view</h2>
      <p className="mt-2 max-w-md text-sm text-muted">{errorMessage}</p>
      {onRetry && (
        <Button className="mt-6 gap-2" variant="secondary" onClick={onRetry}>
          <RefreshCw className="size-4" aria-hidden="true" />
          Retry
        </Button>
      )}
    </Card>
  );
}
