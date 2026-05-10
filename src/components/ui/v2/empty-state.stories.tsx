import type { Meta, StoryObj } from '@storybook/react-vite';
import { Inbox, Search, AlertTriangle, FileText, Users } from 'lucide-react';
import { EmptyState } from './empty-state';
import { Button } from './button';

const meta = {
  title: 'v2/Molecules/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Canonical empty state. Use `decorative` for page-level (Bento blob signature). `inline` variant skips the card wrapper for nesting inside other containers.',
      },
    },
  },
  args: {
    title: 'No leads yet',
    description: 'Connect your CRM to start tracking leads.',
  },
  decorators: [
    (Story) => (
      <div className="w-[32rem]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { icon: <Inbox /> },
};

export const WithAction: Story = {
  args: {
    icon: <Inbox />,
    actions: <Button variant="primary">Connect CRM</Button>,
  },
};

export const Decorative: Story = {
  args: {
    icon: <Inbox />,
    decorative: true,
    actions: <Button variant="primary">Connect CRM</Button>,
  },
};

export const SearchEmpty: Story = {
  args: {
    icon: <Search />,
    title: 'No results match',
    description: 'Try adjusting your filters or clearing the search.',
    actions: (
      <>
        <Button variant="ghost">Clear filters</Button>
        <Button variant="primary">Reset</Button>
      </>
    ),
  },
};

export const ErrorState: Story = {
  args: {
    icon: <AlertTriangle />,
    title: 'Something went wrong',
    description: 'We could not load your dashboard. Try refreshing the page.',
    actions: <Button variant="primary">Retry</Button>,
  },
};

export const Inline: Story = {
  args: {
    icon: <FileText />,
    title: 'No notes',
    description: 'Click the + icon to add your first note.',
    variant: 'inline',
  },
  decorators: [
    (Story) => (
      <div className="w-80 rounded-card border border-outline-variant bg-white p-2">
        <Story />
      </div>
    ),
  ],
};

export const NoDescription: Story = {
  args: {
    icon: <Users />,
    title: 'No team members',
    description: undefined,
    actions: <Button variant="primary">Invite</Button>,
  },
};
