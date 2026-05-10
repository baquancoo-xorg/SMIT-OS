import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Home, Target, CheckSquare, Calendar, Users, Megaphone, BarChart3, Settings, LogOut, Menu } from 'lucide-react';
import { Sidebar } from './sidebar';
import { Button } from './button';

const meta: Meta<typeof Sidebar> = {
  title: 'v2/Layout/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Vertical primary nav. Desktop = always-visible static panel (lg+). Mobile = Dialog slide-in. Items can be flat or grouped with collapsible Disclosure.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

const HEADER = (
  <div className="flex items-center gap-2">
    <div className="flex size-8 items-center justify-center rounded-button bg-primary text-on-primary font-headline font-bold">S</div>
    <span className="font-headline font-bold text-on-surface">SMIT-OS</span>
  </div>
);

const FOOTER = (
  <div className="flex items-center gap-2">
    <div className="size-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-semibold">QB</div>
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold text-on-surface">Quân Bá</p>
      <p className="truncate text-xs text-on-surface-variant">baquan.coo@smitx.org</p>
    </div>
    <button aria-label="Sign out" className="rounded-button p-1 text-on-surface-variant hover:bg-surface-container">
      <LogOut className="size-4" />
    </button>
  </div>
);

const FLAT_ITEMS = [
  { key: 'home', label: 'Dashboard', icon: <Home />, href: '/', active: true },
  { key: 'okrs', label: 'OKRs', icon: <Target />, href: '/okrs', count: 12 },
  { key: 'daily', label: 'Daily Sync', icon: <CheckSquare />, href: '/daily-sync' },
  { key: 'weekly', label: 'Weekly Checkin', icon: <Calendar />, href: '/weekly-checkin' },
];

export const Flat: Story = {
  render: () => (
    <div className="h-screen bg-surface">
      <Sidebar header={HEADER} items={FLAT_ITEMS} footer={FOOTER} />
    </div>
  ),
};

export const Grouped: Story = {
  render: () => (
    <div className="h-screen bg-surface">
      <Sidebar
        header={HEADER}
        items={FLAT_ITEMS}
        groups={[
          {
            key: 'acquisition',
            label: 'Acquisition',
            items: [
              { key: 'leads', label: 'Lead Tracker', icon: <Users />, href: '/leads', count: 248 },
              { key: 'media', label: 'Media Tracker', icon: <Megaphone />, href: '/media' },
              { key: 'ads', label: 'Ads Tracker', icon: <BarChart3 />, href: '/ads' },
            ],
          },
          {
            key: 'admin',
            label: 'Admin',
            defaultOpen: false,
            items: [{ key: 'settings', label: 'Settings', icon: <Settings />, href: '/settings' }],
          },
        ]}
        footer={FOOTER}
      />
    </div>
  ),
};

export const MobileDialog: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="h-screen bg-surface flex flex-col items-start gap-4 p-6">
        <p className="text-sm text-on-surface-variant">
          Sidebar is hidden on `lg-` screens. Click the hamburger to open the slide-in dialog.
        </p>
        <Button onClick={() => setOpen(true)} iconLeft={<Menu />}>Open mobile sidebar</Button>
        <Sidebar
          header={HEADER}
          items={FLAT_ITEMS}
          mobileOpen={open}
          onMobileClose={() => setOpen(false)}
          footer={FOOTER}
        />
      </div>
    );
  },
};
