import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { LayoutDashboard, ShoppingCart, Package, Megaphone, Image } from 'lucide-react';
import { TabPill } from './tab-pill';

const meta: Meta<typeof TabPill> = {
  title: 'v2/Molecules/TabPill',
  component: TabPill,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Pill-style tab toggle. Controlled (`value` + `onChange`). Keyboard: ArrowLeft/Right cycle, Home/End jump. ARIA tablist pattern.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TabPill>;

export const Basic: Story = {
  render: () => {
    const [value, setValue] = useState('overview');
    return (
      <TabPill
        label="Dashboard tabs"
        value={value}
        onChange={setValue}
        items={[
          { value: 'overview', label: 'Overview' },
          { value: 'sale', label: 'Sale' },
          { value: 'product', label: 'Product' },
        ]}
      />
    );
  },
};

export const WithIcons: Story = {
  render: () => {
    const [value, setValue] = useState('overview');
    return (
      <TabPill
        label="Dashboard tabs with icons"
        value={value}
        onChange={setValue}
        items={[
          { value: 'overview', label: 'Overview', icon: <LayoutDashboard /> },
          { value: 'sale', label: 'Sale', icon: <ShoppingCart /> },
          { value: 'product', label: 'Product', icon: <Package /> },
          { value: 'marketing', label: 'Marketing', icon: <Megaphone /> },
          { value: 'media', label: 'Media', icon: <Image /> },
        ]}
      />
    );
  },
};

export const WithCounts: Story = {
  render: () => {
    const [value, setValue] = useState('logs');
    return (
      <TabPill
        label="Lead tracker tabs"
        value={value}
        onChange={setValue}
        items={[
          { value: 'logs', label: 'Logs', count: 248 },
          { value: 'stats', label: 'Daily Stats', count: 12 },
        ]}
      />
    );
  },
};

export const SmallSize: Story = {
  render: () => {
    const [value, setValue] = useState('all');
    return (
      <TabPill
        label="Filter tabs"
        size="sm"
        value={value}
        onChange={setValue}
        items={[
          { value: 'all', label: 'All', count: 248 },
          { value: 'active', label: 'Active', count: 192 },
          { value: 'paused', label: 'Paused', count: 56 },
        ]}
      />
    );
  },
};

export const WithDisabled: Story = {
  render: () => {
    const [value, setValue] = useState('owned');
    return (
      <TabPill
        label="Media channels"
        value={value}
        onChange={setValue}
        items={[
          { value: 'owned', label: 'Owned' },
          { value: 'kol', label: 'KOL' },
          { value: 'pr', label: 'PR' },
          { value: 'paid', label: 'Paid (coming soon)', disabled: true },
        ]}
      />
    );
  },
};
