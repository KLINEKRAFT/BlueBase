'use client';
import { Suspense, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ChartNoAxesCombined,
  Wallet,
  Users,
  CalendarDays,
  Grid2X2,
  LifeBuoy,
  Settings as SettingsIcon,
  Search,
  Bell,
  ChevronDown,
  ArrowRight,
  LogOut,
  ArrowUpRight,
  Command,
  MoreHorizontal,
  UserRound,
  Eye,
  EyeOff,
  Check,
  Home,
} from 'lucide-react';
import { AuthProvider, useAuth } from '@/lib/auth';
import { agent, tools, events, notifications, SNAPSHOT } from '@/data/mock';
import type { AgentProfile, Event } from '@/lib/types';
import { Brand, Modal, useStoredState, Empty } from './ui';
import { Production } from './production';
import { Wealth } from './wealth';
import { Vendors } from './vendors';
import { useDirectory } from '@/lib/vendors/use-directory';
import { Events, EventDetail } from './events';
import { Tools, Profile, Settings, Resources } from './account';
const nav = [
  { href: '/production', label: 'Production', icon: ChartNoAxesCombined },
  { href: '/wealth', label: 'Wealth Builder', icon: Wallet },
  { href: '/vendors', label: 'Vendor List', icon: Users },
  { href: '/events', label: 'Events', icon: CalendarDays },
  { href: '/tools', label: 'Tools', icon: Grid2X2 },
];
export function BlueBase() {
  return (
    <Suspense
      fallback={
        <div className="boot">
          <Brand />
        </div>
      }
    >
      <AuthProvider>
        <Workspace />
      </AuthProvider>
    </Suspense>
  );
}
function Login() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [visible, setVisible] = useState(false);
  return (
    <div className="login">
      <section className="login-story">
        <Brand />
        <div className="login-story-content">
          <div className="eyebrow">A LITTLE MORE CONNECTED.</div>
          <h1>
            Your business.
            <br />
            Your people.
            <br />
            <em>Your possibilities.</em>
          </h1>
          <p>One place for everything that moves you forward.</p>
          <div className="login-preview">
            <span className="eyebrow">MADE FOR YOUR NEXT CHAPTER</span>
            <div>
              <span>
                <ChartNoAxesCombined size={18} />
                Your production
              </span>
              <span>
                <Users size={18} />
                Your community
              </span>
              <span>
                <Wallet size={18} />
                Your future
              </span>
            </div>
          </div>
        </div>
        <div className="login-brand-family">
          COLDWELL BANKER <span>SELECT + PLAZA</span>
        </div>
        <div className="login-art" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>
      </section>
      <section className="login-form-side">
        <span className="login-top-note">YOUR EVERYDAY, SIMPLIFIED.</span>
        <div className="login-form-wrap">
          <div className="mobile-login-brand">
            <Brand />
          </div>
          <span className="eyebrow">WELCOME TO BLUEBASE</span>
          <h2>Good to have you here.</h2>
          <p>Sign in. Settle in. Make your next move.</p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError('');
              const fd = new FormData(e.currentTarget);
              try {
                await signIn(
                  String(fd.get('email')),
                  String(fd.get('password')),
                  fd.get('remember') === 'on',
                );
                router.replace('/production');
              } catch (err) {
                setError((err as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <label>
              Email address
              <input
                name="email"
                type="email"
                autoComplete="username"
                defaultValue="agent@bluebase.demo"
                required
              />
            </label>
            <label>
              Password
              <span className="password-input">
                <input
                  name="password"
                  type={visible ? 'text' : 'password'}
                  defaultValue="demo123"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={visible ? 'Hide password' : 'Show password'}
                  onClick={() => setVisible(!visible)}
                >
                  {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </label>
            <div className="login-options">
              <label className="checkbox-label">
                <input type="checkbox" name="remember" defaultChecked />
                Remember me
              </label>
              <button className="text-link" type="button" onClick={() => setForgot(true)}>
                Forgot password?
              </button>
            </div>
            {error && (
              <p className="error-text" role="alert">
                {error}
              </p>
            )}
            <button disabled={busy} className="btn primary full login-submit">
              {busy ? 'Getting your workspace ready…' : 'Sign in'}
              <ArrowRight size={17} />
            </button>
          </form>
          <div className="demo-credentials">
            <span className="demo-dot" />
            <div>
              <strong>A first look at BlueBase</strong>
              <p>Demo: agent@bluebase.demo / demo123</p>
              <small>Fictional data. Real possibilities.</small>
            </div>
          </div>
        </div>
        <p className="login-bottom-note">
          A shared home for Coldwell Banker Select & Coldwell Banker Plaza.
        </p>
      </section>
      {forgot && (
        <Modal title="You’re in the demo workspace." onClose={() => setForgot(false)}>
          <div className="prose">
            <p>
              Use <strong>agent@bluebase.demo</strong> with password <strong>demo123</strong> to
              explore.
            </p>
            <p>
              Password reset emails aren’t sent in this demo. Secure account recovery will be
              available when live authentication is connected.
            </p>
          </div>
          <button className="btn primary full" onClick={() => setForgot(false)}>
            Back to sign in
          </button>
        </Modal>
      )}
    </div>
  );
}
function Workspace() {
  const { session, ready, signOut } = useAuth();
  const directory = useDirectory(!!session);
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [storageError, setStorageError] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [read, setRead] = useStoredState<string[]>('read-notifications', []);
  const [profile] = useStoredState<AgentProfile>('profile', agent);
  const [appearance, setAppearance] = useStoredState<string>('appearance', 'Light');
  const page = pathname === '/' ? 'production' : pathname.slice(1);
  const unread = notifications.filter((n) => !read.includes(n.id)).length;
  useEffect(() => {
    const handler = () => setStorageError(true);
    window.addEventListener('bluebase-storage-error', handler);
    return () => window.removeEventListener('bluebase-storage-error', handler);
  }, []);
  useEffect(() => {
    const dark = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () =>
      (document.documentElement.dataset.theme =
        appearance === 'Dark' || (appearance === 'System' && dark.matches) ? 'dark' : 'light');
    apply();
    dark.addEventListener('change', apply);
    return () => dark.removeEventListener('change', apply);
  }, [appearance]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((x) => !x);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
  useEffect(() => {
    if (ready && !session && pathname !== '/login') router.replace('/login');
    if (ready && session && (pathname === '/login' || pathname === '/'))
      router.replace('/production');
  }, [ready, session, pathname, router]);
  const navigate = (path: string) => {
    setMoreOpen(false);
    setSearchOpen(false);
    setNotificationsOpen(false);
    router.push(path);
  };
  if (!ready)
    return (
      <div className="boot">
        <Brand />
        <div className="skeleton" />
        <p>Making a little room for your day.</p>
      </div>
    );
  if (!session) return <Login />;
  const searchResults: {
    id: string;
    title: string;
    kind: string;
    keywords: string;
    path: string;
    event?: Event;
  }[] = [
    ...tools
      .filter((t) => t.status === 'Available')
      .map((t) => ({
        id: t.id,
        title: t.name,
        kind: 'Tool',
        keywords: t.description,
        path: t.href,
      })),
    {
      id: 'goals',
      title: 'Your annual goals',
      kind: 'Production',
      keywords: 'goal target volume units gci',
      path: '/production#goals',
    },
    ...(directory.data?.vendors || []).map((v) => ({
      id: v.id,
      title: v.name,
      kind: 'Vendor',
      keywords:
        v.categoryIds
          .map((id) => directory.data?.categories.find((c) => c.id === id)?.name || id)
          .join(' · ') +
        ' · ' +
        v.markets
          .map((m) => m.detail || directory.data?.markets.find((a) => a.id === m.id)?.name || m.id)
          .join(' · '),
      path: '/vendors?search=' + encodeURIComponent(v.name),
    })),
    ...events.map((e) => ({
      id: e.id,
      title: e.title,
      kind: e.type,
      keywords: e.description,
      path: '/events',
      event: e,
    })),
  ]
    .filter((r) =>
      (r.title + ' ' + r.kind + ' ' + r.keywords).toLowerCase().includes(query.toLowerCase()),
    )
    .slice(0, 14);
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="app-shell">
        <aside className="sidebar">
          <Link href="/production" className="brand-link" aria-label="BlueBase home">
            <Brand />
          </Link>
          <div className="workspace-label">
            <span className="workspace-monogram">CB</span>
            <div>
              <strong>Your agent workspace</strong>
              <span>SELECT + PLAZA</span>
            </div>
          </div>
          <div className="nav-label">WORKSPACE</div>
          <nav aria-label="Main navigation">
            {nav.map((n) => (
              <Link
                href={n.href}
                key={n.href}
                className={`nav-item ${pathname === n.href ? 'active' : ''}`}
                aria-current={pathname === n.href ? 'page' : undefined}
              >
                <n.icon size={19} strokeWidth={1.7} />
                {n.label}
                {n.label === 'Events' && <span className="nav-count">11</span>}
              </Link>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <div className="sidebar-note">
              <span className="tiny-dot" />A little more connected.
              <p>Your business, all together.</p>
            </div>
            <Link className={`nav-item ${page === 'resources' ? 'active' : ''}`} href="/resources">
              <LifeBuoy size={18} />
              Help & resources
            </Link>
            <Link className={`nav-item ${page === 'settings' ? 'active' : ''}`} href="/settings">
              <SettingsIcon size={18} />
              Settings
            </Link>
            <button className="sidebar-profile" onClick={() => navigate('/profile')}>
              <img src={profile.avatar} alt="" />
              <span>
                <strong>{profile.name}</strong>
                <small>{profile.office}</small>
              </span>
              <ChevronDown size={16} />
            </button>
          </div>
        </aside>
        <div className="workspace">
          <header className="topbar">
            <div className="breadcrumb">
              <span>Workspace</span>
              <ChevronDown size={12} className="crumb-chevron" />
              <strong>
                {nav.find((n) => n.href === pathname)?.label ||
                  page.charAt(0).toUpperCase() + page.slice(1)}
              </strong>
            </div>
            <Link href="/production" className="mobile-brand">
              <Brand />
            </Link>
            <div className="header-actions">
              <button
                aria-label="Search workspace"
                className="global-search"
                onClick={() => {
                  setQuery('');
                  setSearchOpen(true);
                }}
              >
                <Search size={17} />
                <span>Search your workspace</span>
                <kbd>⌘ K</kbd>
              </button>
              <span className="demo-label">
                <i />
                DEMO
              </span>
              <button
                className="icon-btn notification-trigger"
                aria-label={`Notifications, ${unread} unread`}
                onClick={() => setNotificationsOpen(true)}
              >
                <Bell size={19} />
                {unread > 0 && <i />}
              </button>
              <button
                className="header-avatar"
                aria-label="Open profile menu"
                onClick={() => setMoreOpen(true)}
              >
                <img src={profile.avatar} alt="" />
              </button>
            </div>
          </header>
          <main id="main" className="main-content">
            {page === 'production' && (
              <Production navigate={navigate} openEvent={setSelectedEvent} />
            )}{' '}
            {page === 'wealth' && <Wealth />}
            {page === 'vendors' && (
              <Vendors
                key={params.get('search') || 'all'}
                initialQuery={params.get('search') || ''}
              />
            )}
            {page === 'events' && <Events onOpen={setSelectedEvent} />}{' '}
            {page === 'tools' && <Tools navigate={navigate} />} {page === 'profile' && <Profile />}
            {page === 'settings' && (
              <Settings appearance={appearance} setAppearance={setAppearance} />
            )}{' '}
            {page === 'resources' && <Resources />}
            <footer className="app-footer">
              <span>
                BLUEBASE <span className="footer-dot">·</span> A little more connected.
              </span>
              <span>Demo workspace · Data as of {SNAPSHOT.label}</span>
            </footer>
          </main>
        </div>
      </div>
      <nav className="bottom-nav" aria-label="Mobile navigation">
        {[{ href: '/production', label: 'Home', icon: Home }, ...nav.slice(1, 4)].map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={pathname === n.href ? 'active' : ''}
            aria-current={pathname === n.href ? 'page' : undefined}
          >
            <n.icon size={20} />
            <span>
              {n.label === 'Wealth Builder'
                ? 'Wealth'
                : n.label === 'Vendor List'
                  ? 'Vendors'
                  : n.label}
            </span>
          </Link>
        ))}
        <button onClick={() => setMoreOpen(true)} aria-label="More navigation">
          <MoreHorizontal size={21} />
          <span>More</span>
        </button>
      </nav>
      {searchOpen && (
        <Modal title="A shortcut to your workspace." onClose={() => setSearchOpen(false)}>
          <label className="search-input command-input">
            <Search size={19} />
            <input
              autoFocus
              value={query}
              placeholder="Try “roofing”, “broker open”, or “goals”…"
              aria-label="Search workspace"
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <div className="command-results">
            {searchResults.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  if (r.event) {
                    setSearchOpen(false);
                    setSelectedEvent(r.event!);
                  } else navigate(r.path);
                }}
              >
                <span>
                  <strong>{r.title}</strong>
                  <small>
                    {r.kind}
                    {r.kind === 'Vendor' ? ` · ${r.keywords}` : ''}
                  </small>
                </span>
                <ArrowUpRight size={17} />
              </button>
            ))}
            {!searchResults.length && (
              <Empty
                title="Nothing here just yet."
                description="Try searching for a tool, event, or vendor category."
              />
            )}
          </div>
          <div className="command-footer">
            <Command size={13} />K to open · Tab to browse · Enter to select · Esc to close
          </div>
        </Modal>
      )}
      {notificationsOpen && (
        <Modal title="A few things to know." onClose={() => setNotificationsOpen(false)}>
          <div className="section-heading">
            <span className="muted">{unread} unread updates</span>
            <button className="text-link" onClick={() => setRead(notifications.map((n) => n.id))}>
              <Check size={15} />
              Mark all read
            </button>
          </div>
          <div className="notification-list">
            {notifications.map((n) => (
              <button
                key={n.id}
                className={read.includes(n.id) ? 'read' : ''}
                onClick={() => {
                  setRead([...new Set([...read, n.id])]);
                  navigate(n.href);
                }}
              >
                <span className="notification-dot" />
                <span>
                  <strong>{n.title}</strong>
                  <p>{n.detail}</p>
                  <small>{n.time}</small>
                </span>
                <ArrowUpRight size={16} />
              </button>
            ))}
          </div>
        </Modal>
      )}
      {moreOpen && (
        <Modal title="Your workspace" onClose={() => setMoreOpen(false)}>
          <div className="more-profile">
            <img src={profile.avatar} alt="" />
            <div>
              <h3>{profile.name}</h3>
              <p>{profile.company}</p>
            </div>
          </div>
          <div className="more-links">
            {[
              { href: '/tools', label: 'Tools', icon: Grid2X2 },
              { href: '/profile', label: 'My profile', icon: UserRound },
              { href: '/settings', label: 'Settings', icon: SettingsIcon },
              { href: '/resources', label: 'Help & resources', icon: LifeBuoy },
            ].map((n) => (
              <button key={n.href} onClick={() => navigate(n.href)}>
                <n.icon size={19} />
                {n.label}
                <ArrowUpRight size={17} />
              </button>
            ))}
            <button
              onClick={async () => {
                await signOut();
                setMoreOpen(false);
                router.replace('/login');
              }}
            >
              <LogOut size={19} />
              Sign out
            </button>
          </div>
        </Modal>
      )}
      {storageError && (
        <div role="alert" className="storage-error">
          Your browser couldn’t save this change. Please enable local storage and try again.
          <button onClick={() => setStorageError(false)}>Dismiss</button>
        </div>
      )}
      {selectedEvent && (
        <EventDetail event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </>
  );
}
