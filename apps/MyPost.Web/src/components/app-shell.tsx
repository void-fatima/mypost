import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  BarChart3,
  BookUser,
  Boxes,
  ChevronDown,
  CircleUserRound,
  LayoutDashboard,
  LogOut,
  MapPinHouse,
  Moon,
  PackagePlus,
  Search,
  Sun,
  Truck,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/auth-context';
import type { UserRole } from '../types';
import { Logo } from './logo';
import { Button } from './ui';

const navigation: Record<UserRole, { to: string; label: string; icon: typeof Boxes }[]> = {
  Customer: [
    { to: '/customer', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/customer/shipments', label: 'Shipments', icon: Boxes },
    { to: '/customer/create-shipment', label: 'Create', icon: PackagePlus },
    { to: '/customer/addresses', label: 'Addresses', icon: MapPinHouse },
    { to: '/customer/profile', label: 'Profile', icon: CircleUserRound },
  ],
  Courier: [
    { to: '/courier', label: 'Deliveries', icon: Truck },
    { to: '/courier/profile', label: 'Profile', icon: CircleUserRound },
  ],
  Admin: [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/shipments', label: 'Shipments', icon: Boxes },
    { to: '/admin/users', label: 'Users', icon: BookUser },
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  ],
};

const roleColors: Record<UserRole, string> = {
  Customer: 'bg-brand/10 text-brand border-brand/20',
  Courier: 'bg-accent/10 text-accent border-accent/20',
  Admin: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
};

export function AppShell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [quickTrack, setQuickTrack] = useState('');
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  if (!user) return null;

  const links = navigation[user.role];
  const segments = location.pathname.split('/').filter(Boolean);

  function handleQuickTrack(e: React.FormEvent) {
    e.preventDefault();
    if (quickTrack.trim()) {
      const code = quickTrack.trim().toUpperCase();
      setQuickTrack('');
      navigate(`/track/${encodeURIComponent(code)}`);
    }
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <a
        href="#main-content"
        className="fixed left-3 top-3 z-50 -translate-y-24 rounded-control bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-68 border-r border-line/80 bg-surface p-5 lg:flex lg:flex-col shadow-xs">
        <div className="flex items-center justify-between">
          <Logo />
        </div>

        <div className="mt-6 flex items-center justify-between rounded-control border border-line/80 bg-subtle/70 px-3 py-2">
          <div className="flex items-center gap-2">
            <span className={`inline-block size-2 rounded-full ${user.role === 'Admin' ? 'bg-purple-500' : user.role === 'Courier' ? 'bg-accent' : 'bg-brand'}`} />
            <span className="text-xs font-bold uppercase tracking-wider text-muted">{user.role} workspace</span>
          </div>
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase border ${roleColors[user.role]}`}>
            Active
          </span>
        </div>

        <nav className="mt-5 space-y-1" aria-label="Primary">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to.split('/').length === 2}
              className={({ isActive }) =>
                `group flex min-h-11 items-center gap-3 rounded-control px-3.5 text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-brand text-white shadow-xs dark:text-white'
                    : 'text-muted hover:bg-subtle hover:text-ink'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`size-5 shrink-0 transition-transform group-hover:scale-105 ${
                      isActive ? 'text-white' : 'text-muted group-hover:text-ink'
                    }`}
                    aria-hidden="true"
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer Info Card */}
        <div className="mt-auto rounded-card border border-line/70 bg-gradient-to-br from-subtle/80 to-surface p-4 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-accent animate-pulse" />
            <p className="text-[11px] font-bold uppercase tracking-wider text-accent">Virtual Operations</p>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            All postal events and routes are simulated for portfolio demonstration.
          </p>
        </div>
      </aside>

      {/* Main Container */}
      <div className="lg:pl-68">
        {/* Sticky Glassmorphic Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line/70 bg-surface/85 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="lg:hidden">
            <Logo />
          </div>

          {/* Breadcrumbs */}
          <nav className="hidden items-center gap-2 text-xs font-medium text-muted lg:flex" aria-label="Breadcrumb">
            <Link to={`/${user.role.toLowerCase()}`} className="hover:text-ink transition-colors">
              {user.role}
            </Link>
            {segments.slice(1).map((segment) => (
              <span key={segment} className="flex items-center gap-2">
                <span className="text-muted/50">/</span>
                <span className="capitalize font-semibold text-ink">{segment.replaceAll('-', ' ')}</span>
              </span>
            ))}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Track Search Input */}
            <form onSubmit={handleQuickTrack} className="hidden md:flex relative items-center">
              <Search className="pointer-events-none absolute left-3 size-4 text-muted" aria-hidden="true" />
              <input
                type="search"
                value={quickTrack}
                onChange={(e) => setQuickTrack(e.target.value)}
                placeholder="Quick track (MP-DEMO-…)"
                className="h-9 w-52 rounded-control border border-line/80 bg-subtle/50 pl-9 pr-3 text-xs font-mono placeholder:text-muted placeholder:font-sans focus:w-64 focus:border-brand focus:bg-surface transition-all"
              />
            </form>

            {/* Dark mode toggle */}
            <Button
              variant="ghost"
              className="size-10 px-0 rounded-control"
              onClick={() => setDark((value) => !value)}
              aria-label={dark ? 'Use light theme' : 'Use dark theme'}
            >
              {dark ? <Sun className="size-4.5 text-warning" /> : <Moon className="size-4.5 text-muted hover:text-ink" />}
            </Button>

            {/* User Profile Dropdown */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2.5 rounded-control border border-line/80 bg-surface px-3 py-1.5 text-sm font-semibold text-ink shadow-2xs hover:bg-subtle transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <span className="grid size-7 place-items-center rounded-full bg-brand/10 font-mono text-xs font-bold text-brand">
                    {user.displayName.charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden sm:inline text-xs font-bold">{user.displayName}</span>
                  <ChevronDown className="size-3.5 text-muted" aria-hidden="true" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={8}
                  className="z-50 min-w-60 rounded-card border border-line/80 bg-surface p-1.5 shadow-xl animate-in fade-in-50 zoom-in-95"
                >
                  <div className="border-b border-line/80 px-3 py-2.5">
                    <p className="text-sm font-bold text-ink">{user.displayName}</p>
                    <p className="text-xs text-muted truncate">{user.email}</p>
                    <div className="mt-2">
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase border ${roleColors[user.role]}`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                  <DropdownMenu.Item asChild>
                    <button
                      className="flex min-h-10 w-full items-center gap-2 rounded-control px-3 text-sm font-semibold text-danger hover:bg-danger/10 transition-colors cursor-pointer mt-1"
                      onClick={() => void logout()}
                    >
                      <LogOut className="size-4" />
                      Sign out
                    </button>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </header>

        {/* Content Area */}
        <main id="main-content" className="mx-auto max-w-[1440px] space-y-8 px-4 py-8 pb-28 sm:px-6 lg:px-8 lg:pb-12">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid border-t border-line/80 bg-surface/95 backdrop-blur-md px-1 pb-[env(safe-area-inset-bottom)] lg:hidden shadow-lg"
        style={{ gridTemplateColumns: `repeat(${Math.min(links.length, 5)}, minmax(0, 1fr))` }}
        aria-label="Mobile navigation"
      >
        {links.slice(0, 5).map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to.split('/').length === 2}
            className={({ isActive }) =>
              `flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors ${
                isActive ? 'text-brand' : 'text-muted hover:text-ink'
              }`
            }
          >
            <Icon className="size-5" aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder = 'Search shipments',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="relative block flex-1">
      <span className="sr-only">Search</span>
      <Search className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-muted" aria-hidden="true" />
      <input
        className="min-h-11 w-full rounded-control border border-line bg-surface pl-10 pr-3.5 text-sm text-ink placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type="search"
      />
    </label>
  );
}
