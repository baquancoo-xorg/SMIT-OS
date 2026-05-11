import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Settings, LogOut, User } from 'lucide-react';
import { Header } from './header';
import { OkrCycleCountdown } from './okr-cycle-countdown';
import { NotificationCenter } from './notification-center';
import { DropdownMenu } from './dropdown-menu';

const meta: Meta<typeof Header> = {
  title: 'v2/Layout/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Top app bar. Sticky. Mobile: hamburger + logo + right slot. Desktop: breadcrumb + countdown + right slot. Logo hidden on lg+ when Sidebar shows it (override with `showLogoLg`).',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Header>;

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

const USER_MENU_ITEMS = [
  { key: 'profile', label: 'My profile', icon: <User /> },
  { key: 'settings', label: 'Settings', icon: <Settings />, trailingSeparator: true },
  { key: 'logout', label: 'Sign out', icon: <LogOut />, destructive: true },
];

export const Full: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="bg-surface min-h-[24rem]">
        <Header
          logo={LOGO}
          breadcrumb={<span className="text-sm text-on-surface-variant">Dashboard / <span className="text-on-surface font-medium">OKRs</span></span>}
          countdown={<OkrCycleCountdown deadline={days(12)} cycleLabel="Q2 2026" />}
          rightSlot={
            <>
              <NotificationCenter.Trigger count={3} onClick={() => setOpen(true)} />
              <DropdownMenu trigger={USER_AVATAR} items={USER_MENU_ITEMS} />
            </>
          }
          onMobileMenuClick={() => alert('Open mobile sidebar')}
        />
        <NotificationCenter.Panel open={open} onClose={() => setOpen(false)} notifications={[]} />
      </div>
    );
  },
};

export const Minimal: Story = {
  render: () => (
    <div className="bg-surface min-h-[24rem]">
      <Header
        logo={LOGO}
        showLogoLg
        breadcrumb={<span className="font-headline font-bold text-on-surface">Settings</span>}
        rightSlot={<DropdownMenu trigger={USER_AVATAR} items={USER_MENU_ITEMS} />}
      />
    </div>
  ),
};

export const NoBreadcrumb: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="bg-surface min-h-[24rem]">
        <Header
          logo={LOGO}
          showLogoLg
          countdown={<OkrCycleCountdown deadline={days(2)} cycleLabel="Q2 2026" />}
          rightSlot={
            <>
              <NotificationCenter.Trigger count={142} onClick={() => setOpen(true)} />
              <DropdownMenu trigger={USER_AVATAR} items={USER_MENU_ITEMS} />
            </>
          }
        />
      </div>
    );
  },
};
