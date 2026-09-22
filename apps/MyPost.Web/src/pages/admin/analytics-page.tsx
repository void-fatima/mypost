import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  Boxes,
  PieChart,
  ShieldCheck,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ErrorState, LoadingState } from '../../components/page-state';
import { statusLabels } from '../../components/status-badge';
import { Card, PageHeader } from '../../components/ui';
import { api } from '../../lib/api';
import type { ShipmentStatus } from '../../types';

const statusColors: Record<string, string> = {
  Delivered: '#16a34a',
  'Out for delivery': '#2563eb',
  'In transit': '#3b82f6',
  Accepted: '#0284c7',
  'Awaiting pickup': '#ca8a04',
  Created: '#64748b',
  'Delivery failed': '#dc2626',
  Cancelled: '#991b1b',
  'Return initiated': '#ea580c',
  'Returning to sender': '#ea580c',
  'Returned to sender': '#c2410c',
};

export default function AnalyticsPage() {
  const query = useQuery({
    queryKey: ['admin-status-analytics'],
    queryFn: () => api.get<Record<ShipmentStatus, number>>('/admin/analytics/statuses'),
  });

  if (query.isLoading) return <LoadingState label="Loading operational analytics" />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;

  const rawData = query.data!;
  const totalCount = Object.values(rawData).reduce((acc, c) => acc + c, 0);

  const data = Object.entries(rawData).map(([status, count]) => {
    const label = statusLabels[status as ShipmentStatus];
    const percentage = totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : '0';
    return {
      statusKey: status,
      status: label,
      count,
      percentage,
      color: statusColors[label] || '#2563eb',
    };
  });

  const deliveredCount = rawData.Delivered || 0;
  const deliveryRate = totalCount > 0 ? ((deliveredCount / totalCount) * 100).toFixed(1) : '0';

  return (
    <>
      <PageHeader
        eyebrow="Operational analytics"
        title="Shipment status distribution"
        description="Persisted shipment counts categorized by lifecycle states, paired with strict tabular accessibility equivalents."
      />

      {/* Top Telemetry Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5 shadow-xs border-line/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Audited volume</span>
            <span className="grid size-9 place-items-center rounded-control bg-brand/10 text-brand">
              <Boxes className="size-4.5" />
            </span>
          </div>
          <p className="mt-4 text-3xl font-extrabold tracking-tight tabular-nums text-ink">{totalCount}</p>
          <p className="mt-1 text-xs text-muted">Total tracked packages in database</p>
        </Card>

        <Card className="p-5 shadow-xs border-line/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Delivered handoffs</span>
            <span className="grid size-9 place-items-center rounded-control bg-success/10 text-success">
              <BarChart3 className="size-4.5" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <p className="text-3xl font-extrabold tracking-tight tabular-nums text-ink">{deliveredCount}</p>
            <span className="text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded">
              {deliveryRate}%
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">Completion rate across all seeded records</p>
        </Card>

        <Card className="p-5 shadow-xs border-line/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Lifecycle categories</span>
            <span className="grid size-9 place-items-center rounded-control bg-accent/10 text-accent">
              <PieChart className="size-4.5" />
            </span>
          </div>
          <p className="mt-4 text-3xl font-extrabold tracking-tight tabular-nums text-ink">11</p>
          <p className="mt-1 text-xs text-muted">Explicit domain state transitions</p>
        </Card>
      </div>

      {/* Chart & Table Card */}
      <Card className="p-6 sm:p-7 shadow-xs border-line/80 space-y-8">
        <div>
          <h2 className="text-lg font-bold text-ink">Lifecycle stage breakdown</h2>
          <p className="text-xs text-muted mt-0.5">Distribution of shipments by authoritative legal milestone</p>
        </div>

        {/* Visual Chart with Recharts */}
        <div className="h-88 w-full" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 12, right: 12, left: -16, bottom: 80 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="status"
                stroke="var(--text-muted)"
                angle={-40}
                textAnchor="end"
                interval={0}
                height={80}
                fontSize={11}
                tick={{ fill: 'var(--text-muted)' }}
              />
              <YAxis
                allowDecimals={false}
                stroke="var(--text-muted)"
                fontSize={11}
                tick={{ fill: 'var(--text-muted)' }}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--surface)',
                  borderColor: 'var(--border)',
                  borderRadius: '0.5rem',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  color: 'var(--text)',
                  fontSize: '0.8125rem',
                  padding: '8px 12px',
                }}
                formatter={(value: unknown) => [`${value} parcels`, 'Count']}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {data.map((entry) => (
                  <Cell key={entry.status} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Accessible Data Table Parity */}
        <div className="border-t border-line/70 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-ink">Tabular distribution</h3>
            <span className="text-xs text-muted">WCAG 2.2 Accessible Data Parity</span>
          </div>

          <div className="overflow-x-auto rounded-control border border-line/70">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-subtle/70 text-xs font-bold uppercase tracking-wider text-muted border-b border-line">
                <tr>
                  <th className="px-4 py-3">Lifecycle status</th>
                  <th className="px-4 py-3 text-right">Shipment volume</th>
                  <th className="px-4 py-3 text-right">Proportion</th>
                  <th className="px-4 py-3">Distribution bar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {data.map((item) => (
                  <tr key={item.status} className="hover:bg-subtle/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-ink flex items-center gap-2">
                      <span
                        className="size-2 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                        aria-hidden="true"
                      />
                      <span>{item.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-ink">
                      {item.count}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-muted">
                      {item.percentage}%
                    </td>
                    <td className="px-4 py-3 w-40">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-subtle">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.max(Number(item.percentage), item.count > 0 ? 4 : 0)}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-control bg-subtle/40 p-4 text-xs text-muted flex items-start gap-2 border border-line/60">
          <ShieldCheck className="size-4 text-brand shrink-0 mt-0.5" />
          <span>
            Analytics are compiled directly from database records through SQL GROUP BY aggregations, reflecting live persisted entity invariants.
          </span>
        </div>
      </Card>
    </>
  );
}
