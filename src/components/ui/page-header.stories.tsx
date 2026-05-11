import type { Meta, StoryObj } from '@storybook/react-vite';
import { Home, Target, Plus, Filter, Download } from 'lucide-react';
import { PageHeader } from './page-header';
import { Button } from './button';

const meta = {
  title: 'v2/Molecules/PageHeader',
  component: PageHeader,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Canonical page header per Phase 1 audit. Italic accent word is brand signature. Action slot stretches right; collapses to vertical stack on mobile (<768px).',
      },
    },
  },
  args: {
    title: 'Q2 Objectives & ',
    accent: 'Key Results',
    description: 'Quarterly OKR tracking. Drag to reorder.',
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Minimal: Story = {
  args: { title: 'Settings', accent: undefined, description: undefined },
};

export const WithAccent: Story = {};

export const WithBreadcrumb: Story = {
  args: {
    breadcrumb: [
      { label: 'Dashboard', href: '/', icon: <Home /> },
      { label: 'OKRs', icon: <Target /> },
    ],
  },
};

export const WithActions: Story = {
  args: {
    actions: (
      <>
        <Button variant="ghost" iconLeft={<Filter />}>Filter</Button>
        <Button variant="primary" iconLeft={<Plus />}>Add Objective</Button>
      </>
    ),
  },
};

export const FullExample: Story = {
  args: {
    breadcrumb: [
      { label: 'Dashboard', href: '/', icon: <Home /> },
      { label: 'OKRs', icon: <Target /> },
    ],
    actions: (
      <>
        <Button variant="ghost" iconLeft={<Download />}>Export CSV</Button>
        <Button variant="primary" iconLeft={<Plus />}>Add Objective</Button>
      </>
    ),
  },
};

export const NoAccent: Story = {
  args: { title: 'Daily Sync', accent: undefined },
};

export const LongDescription: Story = {
  args: {
    title: 'Customer ',
    accent: 'Acquisition',
    description:
      'Track all media + ad spend across owned channels, KOL/PR, and paid platforms. Funnel attribution is cross-channel and includes lead source enrichment from CRM.',
    actions: <Button variant="primary">New Campaign</Button>,
  },
};
