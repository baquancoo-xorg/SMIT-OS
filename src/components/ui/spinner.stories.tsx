import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from './spinner';

const meta = {
  title: 'v2/Atoms/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Loading spinner inheriting `currentColor` (recolor via parent `text-*` class). ARIA `role="status"` + screen-reader-only label by default.',
      },
    },
  },
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md', 'lg', 'xl'] },
    hideLabel: { control: 'boolean' },
  },
  args: {
    size: 'md',
    label: 'Loading',
    hideLabel: true,
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const VisibleLabel: Story = {
  args: { hideLabel: false, label: 'Loading dashboard...' },
};

export const SizeComparison: Story = {
  render: () => (
    <div className="flex items-center gap-6 text-primary">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
      <Spinner size="xl" />
    </div>
  ),
};

export const ColorByParent: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <span className="text-primary"><Spinner size="md" /></span>
      <span className="text-secondary"><Spinner size="md" /></span>
      <span className="text-success"><Spinner size="md" /></span>
      <span className="text-error"><Spinner size="md" /></span>
      <span className="text-on-surface-variant"><Spinner size="md" /></span>
    </div>
  ),
};

export const InCard: Story = {
  render: () => (
    <div className="flex h-48 w-72 items-center justify-center rounded-card border border-outline-variant bg-white">
      <span className="text-primary">
        <Spinner size="lg" hideLabel={false} label="Fetching OKRs..." />
      </span>
    </div>
  ),
};
