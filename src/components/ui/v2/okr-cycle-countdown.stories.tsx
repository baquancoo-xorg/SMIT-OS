import type { Meta, StoryObj } from '@storybook/react-vite';
import { OkrCycleCountdown } from './okr-cycle-countdown';

const meta: Meta<typeof OkrCycleCountdown> = {
  title: 'v2/Layout/OkrCycleCountdown',
  component: OkrCycleCountdown,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Live-ticking countdown pill (refresh every 60s). Color shifts: success > 14d, warning ≤ 14d, error ≤ 3d, neutral when past.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof OkrCycleCountdown>;

const days = (n: number) => new Date(Date.now() + n * 86_400_000);

export const Safe: Story = {
  args: { deadline: days(40), cycleLabel: 'Q3 2026' },
};

export const Soon: Story = {
  args: { deadline: days(10), cycleLabel: 'Q2 2026' },
};

export const Urgent: Story = {
  args: { deadline: days(2), cycleLabel: 'Q2 2026' },
};

export const Past: Story = {
  args: { deadline: days(-3), cycleLabel: 'Q1 2026' },
};

export const ExpandedFormat: Story = {
  args: { deadline: days(2), cycleLabel: 'Q2 2026', compact: false },
};

export const InHeader: Story = {
  render: () => (
    <div className="flex w-full items-center justify-between rounded-card border border-outline-variant bg-white px-4 py-3">
      <span className="font-headline text-lg font-bold text-on-surface">SMIT-OS</span>
      <OkrCycleCountdown deadline={days(12)} cycleLabel="Q2 2026" />
    </div>
  ),
  decorators: [(Story) => <div className="w-[36rem]"><Story /></div>],
};
