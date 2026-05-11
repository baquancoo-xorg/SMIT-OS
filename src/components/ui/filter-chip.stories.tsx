import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Filter, Building2, Activity } from 'lucide-react';
import { FilterChip, type FilterChipProps } from './filter-chip';

// Concrete story wrapper — avoids generic inference issues với Storybook Meta
function FilterChipStory(props: FilterChipProps<string>) {
  return <FilterChip<string> {...props} />;
}

const DEPT_OPTIONS = [
  { value: 'All', label: 'All Departments' },
  { value: 'Tech', label: 'Tech' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Media', label: 'Media' },
  { value: 'Sale', label: 'Sale' },
];

const STATUS_OPTIONS = [
  { value: 'All', label: 'All Status' },
  { value: 'Active', label: 'Active' },
  { value: 'AtRisk', label: 'At Risk' },
  { value: 'Critical', label: 'Critical' },
];

const meta: Meta<typeof FilterChipStory> = {
  title: 'v2/Molecules/FilterChip',
  component: FilterChipStory,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Single-select value-bound filter chip with dropdown. Replaces v1 CustomFilter. Use `size="md"` (default) for page-level filters or `size="sm"` for compact table-density filter bars. Built on Headless UI Listbox for keyboard navigation + a11y.',
      },
    },
  },
  args: {
    value: 'All',
    onChange: () => {},
    options: DEPT_OPTIONS,
    icon: <Filter size={14} />,
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FilterChipStory>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState('All');
    return <FilterChipStory {...args} value={value} onChange={setValue} />;
  },
};

export const Compact: Story = {
  args: { size: 'sm' },
  render: (args) => {
    const [value, setValue] = useState('All');
    return <FilterChipStory {...args} value={value} onChange={setValue} />;
  },
};

export const WithoutIcon: Story = {
  args: { icon: undefined, placeholder: 'Pick department' },
  render: (args) => {
    const [value, setValue] = useState('All');
    return <FilterChipStory {...args} value={value} onChange={setValue} />;
  },
};

export const Disabled: Story = {
  args: { disabled: true, value: 'Tech' },
  render: (args) => <FilterChipStory {...args} />,
};

export const FilterBar: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Multiple FilterChips in a horizontal toolbar — typical OKR/dashboard filtering pattern.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="flex flex-wrap items-center gap-3">
        <Story />
      </div>
    ),
  ],
  render: () => {
    const [dept, setDept] = useState('All');
    const [status, setStatus] = useState('All');
    return (
      <>
        <FilterChip<string> value={dept} onChange={setDept} options={DEPT_OPTIONS} icon={<Building2 size={14} />} label="Department filter" />
        <FilterChip<string> value={status} onChange={setStatus} options={STATUS_OPTIONS} icon={<Activity size={14} />} label="Status filter" />
      </>
    );
  },
};
