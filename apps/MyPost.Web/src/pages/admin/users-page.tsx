import { useQuery } from '@tanstack/react-query';
import {
  RotateCcw,
  ShieldCheck,
  Truck,
  Users,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { SearchField } from '../../components/app-shell';
import { EmptyState, ErrorState, LoadingState } from '../../components/page-state';
import { Button, Card, PageHeader } from '../../components/ui';
import { api } from '../../lib/api';
import type { PagedResult, UserRole, UserSummary } from '../../types';

const roleStyles: Record<UserRole, { badge: string; icon: typeof Users }> = {
  Customer: {
    badge: 'bg-brand/10 text-brand border-brand/20',
    icon: Users,
  },
  Courier: {
    badge: 'bg-accent/10 text-accent border-accent/20',
    icon: Truck,
  },
  Admin: {
    badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    icon: ShieldCheck,
  },
};

export default function UsersPage() {
  const [params, setParams] = useSearchParams();
  const search = params.get('search') ?? '';

  const query = useQuery({
    queryKey: ['admin-users', search],
    queryFn: () =>
      api.get<PagedResult<UserSummary>>(
        `/admin/users?page=1&pageSize=100&search=${encodeURIComponent(search)}`,
      ),
  });

  const users = query.data?.items ?? [];
  const adminCount = users.filter((u) => u.role === 'Admin').length;
  const courierCount = users.filter((u) => u.role === 'Courier').length;
  const customerCount = users.filter((u) => u.role === 'Customer').length;

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="User directory"
        description="Role assignments, account statuses, and system access policies for all seeded and registered users."
      />

      {/* Role Breakdown Badges */}
      {query.data && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex items-center justify-between rounded-card border border-line/80 bg-surface p-4 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-control bg-brand/10 text-brand">
                <Users className="size-4" />
              </span>
              <span className="text-xs font-bold text-ink">Customers</span>
            </div>
            <strong className="font-mono text-lg font-extrabold text-ink">{customerCount}</strong>
          </div>

          <div className="flex items-center justify-between rounded-card border border-line/80 bg-surface p-4 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-control bg-accent/10 text-accent">
                <Truck className="size-4" />
              </span>
              <span className="text-xs font-bold text-ink">Couriers</span>
            </div>
            <strong className="font-mono text-lg font-extrabold text-ink">{courierCount}</strong>
          </div>

          <div className="flex items-center justify-between rounded-card border border-line/80 bg-surface p-4 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-control bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <ShieldCheck className="size-4" />
              </span>
              <span className="text-xs font-bold text-ink">Administrators</span>
            </div>
            <strong className="font-mono text-lg font-extrabold text-ink">{adminCount}</strong>
          </div>
        </div>
      )}

      {/* Search Input Card */}
      <Card className="p-4 shadow-xs border-line/80">
        <div className="flex items-center gap-3">
          <SearchField
            value={search}
            placeholder="Search by full name or email address..."
            onChange={(value) => setParams(value ? { search: value } : {}, { replace: true })}
          />
          {search && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setParams({}, { replace: true })}
              className="gap-1 text-xs text-muted hover:text-ink shrink-0"
            >
              <RotateCcw className="size-3.5" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </Card>

      {query.isLoading && <LoadingState label="Loading users" />}
      {query.isError && <ErrorState error={query.error} onRetry={() => void query.refetch()} />}

      {query.data?.items.length === 0 && (
        <EmptyState
          title="No users match"
          description={
            search
              ? `No user accounts found matching "${search}".`
              : 'No registered user accounts found in this environment.'
          }
          action={
            search ? (
              <Button variant="secondary" onClick={() => setParams({}, { replace: true })}>
                Clear search
              </Button>
            ) : undefined
          }
        />
      )}

      {query.data && query.data.items.length > 0 && (
        <Card className="overflow-hidden shadow-xs border-line/80">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <caption className="sr-only">MyPost users list</caption>
              <thead className="bg-subtle/60 text-xs font-bold uppercase tracking-wider text-muted border-b border-line">
                <tr>
                  <th scope="col" className="px-5 py-3.5">
                    User identity
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Email address
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Assigned role
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Account status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {query.data.items.map((user) => {
                  const roleConfig = roleStyles[user.role] ?? roleStyles.Customer;
                  const Icon = roleConfig.icon;

                  return (
                    <tr key={user.id} className="hover:bg-subtle/30 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-ink">
                        <div className="flex items-center gap-3">
                          <span className="grid size-8 place-items-center rounded-full bg-brand/10 text-brand font-mono text-xs font-bold">
                            {user.displayName.charAt(0).toUpperCase()}
                          </span>
                          <span>{user.displayName}</span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-muted font-medium font-mono text-xs">
                        {user.email}
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase ${roleConfig.badge}`}
                        >
                          <Icon className="size-3" />
                          <span>{user.role}</span>
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                            user.isActive ? 'text-success' : 'text-danger'
                          }`}
                        >
                          <span
                            className={`size-2 rounded-full ${
                              user.isActive ? 'bg-success animate-pulse' : 'bg-danger'
                            }`}
                          />
                          <span>{user.isActive ? 'Active' : 'Disabled'}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}
