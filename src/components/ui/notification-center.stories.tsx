import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Target, Users, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { NotificationCenter } from './notification-center';
import { Button } from './button';

const meta: Meta = {
  title: 'v2/Layout/NotificationCenter',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Compound API: `<NotificationCenter.Trigger>` (bell + count badge) + `<NotificationCenter.Panel>` (right slide-in). Caller manages open state + notifications list.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const NOW = new Date();
const minutes = (n: number) => new Date(NOW.getTime() - n * 60_000);

const SAMPLE = [
  {
    id: '1',
    title: 'Q2 Revenue Goal hit 100%',
    description: 'You smashed it! Target ₫3.2B reached.',
    timestamp: minutes(2),
    unread: true,
    tone: 'success' as const,
    icon: <CheckCircle2 />,
  },
  {
    id: '2',
    title: 'New lead assigned',
    description: 'Anh Nguyen from Facebook Ads.',
    timestamp: minutes(15),
    unread: true,
    tone: 'info' as const,
    icon: <Users />,
  },
  {
    id: '3',
    title: 'OKR cycle ending soon',
    description: 'Q2 ends in 3 days. Submit your weekly checkin.',
    timestamp: minutes(60 * 4),
    unread: true,
    tone: 'warning' as const,
    icon: <AlertTriangle />,
  },
  {
    id: '4',
    title: 'Q1 review completed',
    description: 'View the retro report.',
    timestamp: minutes(60 * 24 * 2),
    unread: false,
    tone: 'info' as const,
    icon: <Target />,
    onClick: () => alert('Navigate to retro'),
  },
];

export const WithUnread: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <NotificationCenter.Trigger count={3} onClick={() => setOpen(true)} />
        <NotificationCenter.Panel
          open={open}
          onClose={() => setOpen(false)}
          notifications={SAMPLE}
          headerActions={<Button variant="ghost" size="sm">Mark all read</Button>}
        />
      </>
    );
  },
};

export const NoUnread: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const allRead = SAMPLE.map((n) => ({ ...n, unread: false }));
    return (
      <>
        <NotificationCenter.Trigger count={0} onClick={() => setOpen(true)} />
        <NotificationCenter.Panel open={open} onClose={() => setOpen(false)} notifications={allRead} />
      </>
    );
  },
};

export const Empty: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <NotificationCenter.Trigger count={0} onClick={() => setOpen(true)} />
        <NotificationCenter.Panel open={open} onClose={() => setOpen(false)} notifications={[]} />
      </>
    );
  },
};

export const HighCount: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <NotificationCenter.Trigger count={142} onClick={() => setOpen(true)} />
        <NotificationCenter.Panel open={open} onClose={() => setOpen(false)} notifications={SAMPLE} />
      </>
    );
  },
};

export const InHeader: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <div className="flex w-[40rem] items-center justify-between rounded-card border border-outline-variant bg-white px-4 py-2.5">
          <span className="font-headline text-lg font-bold text-on-surface">SMIT-OS</span>
          <NotificationCenter.Trigger count={3} onClick={() => setOpen(true)} />
        </div>
        <NotificationCenter.Panel open={open} onClose={() => setOpen(false)} notifications={SAMPLE} />
      </>
    );
  },
};
