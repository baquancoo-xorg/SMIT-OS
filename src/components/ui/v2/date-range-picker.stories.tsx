import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { DateRangePicker, DEFAULT_PRESETS } from './date-range-picker';
import type { DateRange } from './date-range-picker';

const meta: Meta<typeof DateRangePicker> = {
  title: 'v2/Molecules/DateRangePicker',
  component: DateRangePicker,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Date range picker with preset shortcuts (Today / Last 7d / Last 30d / This month / Last month / This quarter) + custom from/to native date inputs. Headless UI Popover for portal/focus management.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-[28rem] w-[40rem]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DateRangePicker>;

export const Default: Story = {
  render: () => {
    const [range, setRange] = useState<DateRange>(DEFAULT_PRESETS[2].range());
    return <DateRangePicker value={range} onChange={setRange} />;
  },
};

export const WithLabel: Story = {
  render: () => {
    const [range, setRange] = useState<DateRange>(DEFAULT_PRESETS[3].range());
    return (
      <label className="flex flex-col gap-1.5">
        <span className="text-[length:var(--text-label)] font-medium text-on-surface-variant">Filter date</span>
        <DateRangePicker value={range} onChange={setRange} label="Filter date" />
      </label>
    );
  },
};

export const Disabled: Story = {
  render: () => {
    const [range, setRange] = useState<DateRange>(DEFAULT_PRESETS[2].range());
    return <DateRangePicker value={range} onChange={setRange} disabled />;
  },
};

export const CustomPresets: Story = {
  render: () => {
    const [range, setRange] = useState<DateRange>(DEFAULT_PRESETS[2].range());
    return (
      <DateRangePicker
        value={range}
        onChange={setRange}
        presets={[
          DEFAULT_PRESETS[0], // Today
          DEFAULT_PRESETS[2], // Last 7 days
          DEFAULT_PRESETS[6], // This quarter
          {
            key: 'ytd',
            label: 'Year to date',
            range: () => {
              const now = new Date();
              const start = new Date(now.getFullYear(), 0, 1);
              return { from: start, to: now };
            },
          },
        ]}
      />
    );
  },
};

export const InToolbar: Story = {
  render: () => {
    const [range, setRange] = useState<DateRange>(DEFAULT_PRESETS[3].range());
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-card border border-outline-variant bg-white p-3">
        <span className="text-sm font-semibold text-on-surface">Show data for</span>
        <DateRangePicker value={range} onChange={setRange} />
        <span className="text-xs text-on-surface-variant">
          ({Math.ceil((range.to.getTime() - range.from.getTime()) / 86400000)} days)
        </span>
      </div>
    );
  },
};
