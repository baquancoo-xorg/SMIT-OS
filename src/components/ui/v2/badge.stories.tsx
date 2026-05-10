import type { Meta, StoryObj } from '@storybook/react-vite';
import { CheckCircle2, AlertTriangle, AlertCircle, Info as InfoIcon, Sparkles } from 'lucide-react';
import { Badge } from './badge';

const meta = {
  title: 'v2/Atoms/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Status pill with semantic variants (success/warning/error/info/neutral/primary). Default `soft=true` uses *-container tokens. Set `soft={false}` for solid high-contrast.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['success', 'warning', 'error', 'info', 'neutral', 'primary'],
    },
    size: { control: 'radio', options: ['sm', 'md'] },
    soft: { control: 'boolean' },
  },
  args: {
    children: 'Active',
    variant: 'success',
    size: 'sm',
    soft: true,
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {};

export const Warning: Story = {
  args: { variant: 'warning', children: 'At Risk' },
};

export const Error: Story = {
  args: { variant: 'error', children: 'Off Track' },
};

export const Info: Story = {
  args: { variant: 'info', children: 'Pending' },
};

export const Neutral: Story = {
  args: { variant: 'neutral', children: 'Draft' },
};

export const SoftVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="success" iconLeft={<CheckCircle2 />}>Success</Badge>
      <Badge variant="warning" iconLeft={<AlertTriangle />}>Warning</Badge>
      <Badge variant="error" iconLeft={<AlertCircle />}>Error</Badge>
      <Badge variant="info" iconLeft={<InfoIcon />}>Info</Badge>
      <Badge variant="primary" iconLeft={<Sparkles />}>New</Badge>
      <Badge variant="neutral">Neutral</Badge>
    </div>
  ),
};

export const SolidVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="success" soft={false}>Success</Badge>
      <Badge variant="warning" soft={false}>Warning</Badge>
      <Badge variant="error" soft={false}>Error</Badge>
      <Badge variant="info" soft={false}>Info</Badge>
      <Badge variant="primary" soft={false}>Primary</Badge>
      <Badge variant="neutral" soft={false}>Neutral</Badge>
    </div>
  ),
};

export const SizeComparison: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Badge variant="success" size="sm">Small</Badge>
      <Badge variant="success" size="md">Medium</Badge>
    </div>
  ),
};

export const InContext: Story = {
  render: () => (
    <div className="flex flex-col gap-2 rounded-card border border-outline-variant bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-on-surface">Q1 Revenue Goal</span>
        <Badge variant="success" iconLeft={<CheckCircle2 />}>120% Achieved</Badge>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-on-surface">Q1 Lead Conversion</span>
        <Badge variant="warning" iconLeft={<AlertTriangle />}>At Risk</Badge>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-on-surface">Q1 Mobile Launch</span>
        <Badge variant="error" iconLeft={<AlertCircle />}>Off Track</Badge>
      </div>
    </div>
  ),
};
