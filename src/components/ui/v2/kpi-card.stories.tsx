import type { Meta, StoryObj } from '@storybook/react-vite';
import { Users, DollarSign, Target, ShoppingCart, MousePointer, AlertTriangle } from 'lucide-react';
import { KpiCard } from './kpi-card';

const meta = {
  title: 'v2/Molecules/KpiCard',
  component: KpiCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Bento signature metric card. Decorative blob + hover scale (vanilla CSS, no motion lib). Trend auto-inferred from `deltaPercent` sign.',
      },
    },
  },
  argTypes: {
    accent: { control: 'select', options: ['primary', 'success', 'warning', 'error', 'info'] },
    trend: { control: 'select', options: ['up', 'down', 'flat', undefined] },
    decorative: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
  args: {
    label: 'Total Leads',
    value: '248',
    icon: <Users />,
    deltaPercent: 12.5,
    deltaLabel: 'vs last week',
    accent: 'primary',
    decorative: true,
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof KpiCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TrendDown: Story = {
  args: {
    label: 'Cost per Lead',
    value: '142,500',
    unit: 'đ',
    icon: <DollarSign />,
    deltaPercent: -8.3,
    deltaLabel: 'vs last week',
    accent: 'success', // cost going DOWN is good — accent stays success
  },
};

export const TrendFlat: Story = {
  args: {
    label: 'Conversion Rate',
    value: '3.2',
    unit: '%',
    icon: <Target />,
    deltaPercent: 0,
    deltaLabel: 'vs last week',
    accent: 'info',
  },
};

export const NoDelta: Story = {
  args: {
    label: 'Total Revenue',
    value: '₫ 3.2B',
    icon: <DollarSign />,
    deltaPercent: undefined,
    deltaLabel: undefined,
    accent: 'success',
  },
};

export const Loading: Story = {
  args: { loading: true },
};

export const WithoutBlob: Story = {
  args: { decorative: false },
};

export const Grid: Story = {
  render: () => (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        label="Total Leads"
        value="248"
        icon={<Users />}
        deltaPercent={12.5}
        deltaLabel="vs last week"
        accent="primary"
      />
      <KpiCard
        label="Revenue"
        value="3.2"
        unit="B đ"
        icon={<DollarSign />}
        deltaPercent={8.3}
        deltaLabel="vs last week"
        accent="success"
      />
      <KpiCard
        label="Conv. Rate"
        value="3.2"
        unit="%"
        icon={<Target />}
        deltaPercent={-1.4}
        deltaLabel="vs last week"
        accent="warning"
      />
      <KpiCard
        label="Cart Abandons"
        value="412"
        icon={<ShoppingCart />}
        deltaPercent={18.9}
        deltaLabel="vs last week"
        trend="down"
        accent="error"
      />
    </div>
  ),
  decorators: [(Story) => <div className="w-full max-w-5xl"><Story /></div>],
};

export const AccentVariants: Story = {
  render: () => (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <KpiCard label="Primary" value="100" icon={<Users />} deltaPercent={5} accent="primary" />
      <KpiCard label="Success" value="100" icon={<Target />} deltaPercent={5} accent="success" />
      <KpiCard label="Warning" value="100" icon={<AlertTriangle />} deltaPercent={5} accent="warning" />
      <KpiCard label="Error" value="100" icon={<AlertTriangle />} deltaPercent={5} accent="error" />
      <KpiCard label="Info" value="100" icon={<MousePointer />} deltaPercent={5} accent="info" />
    </div>
  ),
  decorators: [(Story) => <div className="w-full max-w-5xl"><Story /></div>],
};
