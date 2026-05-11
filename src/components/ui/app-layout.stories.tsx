import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Home, Target, Users, Settings, LogOut, User as UserIcon } from 'lucide-react';
import { AppLayout } from './app-layout';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { OkrCycleCountdown } from './okr-cycle-countdown';
import { NotificationCenter } from './notification-center';
import { DropdownMenu } from './dropdown-menu';
import { PageHeader } from './page-header';
import { KpiCard } from './kpi-card';
import { GlassCard } from './glass-card';

const meta: Meta = {
  title: 'v2/Layout/AppLayout',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Top-level composition wrapper. Sidebar + (Header + Main) layout. Header sticky, main scrolls independently. Demonstrates full v2 app shell.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const days = (n: number) => new Date(Date.now() + n * 86_400_000);

const LOGO = (
  <div className="flex items-center gap-2">
    <div className="flex size-8 items-center justify-center rounded-button bg-primary text-on-primary font-headline font-bold">S</div>
    <span className="font-headline font-bold text-on-surface">SMIT-OS</span>
  </div>
);

const USER_AVATAR = (
  <button
    type="button"
    aria-label="User menu"
    className="inline-flex size-9 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container font-semibold focus-visible:outline-none hover:opacity-90"
  >
    QB
  </button>
);

const FOOTER = (
  <div className="flex items-center gap-2">
    <div className="size-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-semibold">QB</div>
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold text-on-surface">Quân Bá</p>
      <p className="truncate text-xs text-on-surface-variant">baquan.coo@smitx.org</p>
    </div>
  </div>
);

export const FullShell: Story = {
  render: () => {
    const [mobileNav, setMobileNav] = useState(false);
    const [notifs, setNotifs] = useState(false);

    return (
      <AppLayout
        sidebar={
          <Sidebar
            header={LOGO}
            items={[
              { key: 'home', label: 'Dashboard', icon: <Home />, href: '/', active: true },
              { key: 'okrs', label: 'OKRs', icon: <Target />, href: '/okrs', count: 12 },
              { key: 'leads', label: 'Lead Tracker', icon: <Users />, href: '/leads', count: 248 },
              { key: 'settings', label: 'Settings', icon: <Settings />, href: '/settings' },
            ]}
            mobileOpen={mobileNav}
            onMobileClose={() => setMobileNav(false)}
            footer={FOOTER}
          />
        }
        header={
          <Header
            logo={LOGO}
            countdown={<OkrCycleCountdown deadline={days(12)} cycleLabel="Q2 2026" />}
            breadcrumb={
              <span className="text-sm text-on-surface-variant">
                Dashboard / <span className="text-on-surface font-medium">Overview</span>
              </span>
            }
            rightSlot={
              <>
                <NotificationCenter.Trigger count={3} onClick={() => setNotifs(true)} />
                <DropdownMenu
                  trigger={USER_AVATAR}
                  items={[
                    { key: 'profile', label: 'My profile', icon: <UserIcon /> },
                    { key: 'settings', label: 'Settings', icon: <Settings />, trailingSeparator: true },
                    { key: 'logout', label: 'Sign out', icon: <LogOut />, destructive: true },
                  ]}
                />
              </>
            }
            onMobileMenuClick={() => setMobileNav(true)}
          />
        }
      >
        <PageHeader
          title="Q2 Overview & "
          accent="Performance"
          description="High-level snapshot of the quarter. KPIs refresh every 5 minutes."
        />

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Total Leads" value="248" deltaPercent={12.5} deltaLabel="vs last week" accent="primary" />
          <KpiCard label="Revenue" value="3.2" unit="B đ" deltaPercent={8.3} deltaLabel="vs last week" accent="success" />
          <KpiCard label="Conv. Rate" value="3.2" unit="%" deltaPercent={-1.4} deltaLabel="vs last week" accent="warning" />
          <KpiCard label="Cart Abandons" value="412" deltaPercent={18.9} deltaLabel="vs last week" trend="down" accent="error" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <GlassCard variant="raised" padding="lg" className="lg:col-span-2">
            <h3 className="font-headline text-lg font-semibold text-on-surface">Recent Activity</h3>
            <p className="mt-1 text-sm text-on-surface-variant">Last 24h actions across the team.</p>
            <div className="mt-4 h-48 rounded-card bg-surface-container-low" aria-hidden="true" />
          </GlassCard>
          <GlassCard variant="surface" padding="md" decorative decorativeAccent="primary">
            <h3 className="font-headline text-base font-semibold text-on-surface">Weekly Checkin</h3>
            <p className="mt-1 text-sm text-on-surface-variant">Submit before Friday EOD.</p>
          </GlassCard>
        </div>

        <NotificationCenter.Panel
          open={notifs}
          onClose={() => setNotifs(false)}
          notifications={[
            {
              id: '1',
              title: 'Q2 Revenue Goal hit 100%',
              description: 'You smashed it!',
              timestamp: new Date(Date.now() - 2 * 60_000),
              unread: true,
              tone: 'success',
              icon: <Target />,
            },
            {
              id: '2',
              title: 'New lead assigned',
              description: 'Anh Nguyen from Facebook Ads.',
              timestamp: new Date(Date.now() - 15 * 60_000),
              unread: true,
              tone: 'info',
              icon: <Users />,
            },
          ]}
        />
      </AppLayout>
    );
  },
};
