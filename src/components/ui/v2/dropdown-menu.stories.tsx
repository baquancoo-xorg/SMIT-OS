import type { Meta, StoryObj } from '@storybook/react-vite';
import { Pencil, Copy, Trash2, MoreHorizontal, ExternalLink, Archive, Star } from 'lucide-react';
import { DropdownMenu } from './dropdown-menu';
import { Button } from './button';

const meta: Meta<typeof DropdownMenu> = {
  title: 'v2/Organisms/DropdownMenu',
  component: DropdownMenu,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Headless UI Menu wrapper. Keyboard nav (Up/Down/Enter/ESC). Destructive items render in error color. Optional trailing separator per item.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-[16rem]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DropdownMenu>;

export const Default: Story = {
  args: {
    trigger: <Button variant="ghost">Actions</Button>,
    items: [
      { key: 'edit', label: 'Edit', icon: <Pencil />, onClick: () => alert('Edit') },
      { key: 'duplicate', label: 'Duplicate', icon: <Copy />, onClick: () => alert('Duplicate') },
      { key: 'archive', label: 'Archive', icon: <Archive />, onClick: () => alert('Archive'), trailingSeparator: true },
      { key: 'delete', label: 'Delete', icon: <Trash2 />, destructive: true, onClick: () => alert('Delete') },
    ],
  },
};

export const IconOnlyTrigger: Story = {
  args: {
    label: 'Row actions',
    trigger: (
      <button
        type="button"
        className="inline-flex size-8 items-center justify-center rounded-button text-on-surface-variant hover:bg-surface-container focus-visible:outline-none"
        aria-label="Open menu"
      >
        <MoreHorizontal className="size-4" />
      </button>
    ),
    items: [
      { key: 'edit', label: 'Edit', icon: <Pencil /> },
      { key: 'delete', label: 'Delete', icon: <Trash2 />, destructive: true },
    ],
  },
};

export const WithLinks: Story = {
  args: {
    trigger: <Button variant="ghost">Open in...</Button>,
    items: [
      { key: 'docs', label: 'Open docs', icon: <ExternalLink />, href: 'https://example.com/docs' },
      { key: 'cloudflare', label: 'Cloudflare dashboard', icon: <ExternalLink />, href: 'https://dash.cloudflare.com' },
      { key: 'posthog', label: 'PostHog', icon: <ExternalLink />, href: 'https://posthog.com' },
    ],
  },
};

export const WithDisabled: Story = {
  args: {
    trigger: <Button variant="ghost">Actions</Button>,
    items: [
      { key: 'edit', label: 'Edit', icon: <Pencil /> },
      { key: 'star', label: 'Star (locked)', icon: <Star />, disabled: true },
      { key: 'delete', label: 'Delete', icon: <Trash2 />, destructive: true },
    ],
  },
};

export const AnchorTopEnd: Story = {
  args: {
    anchor: 'top end',
    trigger: <Button variant="ghost">Anchor: top end</Button>,
    items: [
      { key: 'a', label: 'Option A' },
      { key: 'b', label: 'Option B' },
      { key: 'c', label: 'Option C' },
    ],
  },
  decorators: [(Story) => <div className="flex min-h-[24rem] items-end justify-center"><Story /></div>],
};
