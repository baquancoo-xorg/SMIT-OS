import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusDot } from './status-dot';

const meta = {
  title: 'v2/Atoms/StatusDot',
  component: StatusDot,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Live status indicator. Pulse ring animates when `pulse` is true and respects `prefers-reduced-motion`. Provide `label` for screen readers; otherwise dot is decorative.',
      },
    },
  },
  argTypes: {
    variant: { control: 'select', options: ['success', 'warning', 'error', 'info', 'neutral'] },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
    pulse: { control: 'boolean' },
  },
  args: {
    variant: 'success',
    size: 'md',
    pulse: false,
    label: 'Online',
  },
} satisfies Meta<typeof StatusDot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Pulsing: Story = {
  args: { pulse: true, label: 'Live syncing' },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <span className="flex items-center gap-2 text-sm text-on-surface">
        <StatusDot variant="success" pulse label="Online" /> Online
      </span>
      <span className="flex items-center gap-2 text-sm text-on-surface">
        <StatusDot variant="warning" pulse label="Syncing" /> Syncing
      </span>
      <span className="flex items-center gap-2 text-sm text-on-surface">
        <StatusDot variant="error" pulse label="Offline" /> Offline
      </span>
      <span className="flex items-center gap-2 text-sm text-on-surface">
        <StatusDot variant="info" label="Idle" /> Idle
      </span>
      <span className="flex items-center gap-2 text-sm text-on-surface">
        <StatusDot variant="neutral" label="Unknown" /> Unknown
      </span>
    </div>
  ),
};

export const SizeComparison: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <StatusDot variant="success" size="sm" pulse label="Small" />
      <StatusDot variant="success" size="md" pulse label="Medium" />
      <StatusDot variant="success" size="lg" pulse label="Large" />
    </div>
  ),
};

export const InHeader: Story = {
  render: () => (
    <div className="flex items-center justify-between rounded-card border border-outline-variant bg-white px-4 py-3 w-80">
      <span className="text-sm font-semibold text-on-surface">Cloudflare Tunnel</span>
      <span className="flex items-center gap-2 text-xs text-on-surface-variant">
        <StatusDot variant="success" pulse label="Tunnel up" />
        Connected
      </span>
    </div>
  ),
};
