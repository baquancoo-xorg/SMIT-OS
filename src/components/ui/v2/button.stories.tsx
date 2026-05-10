import type { Meta, StoryObj } from '@storybook/react-vite';
import { Plus, Trash2, ArrowRight } from 'lucide-react';
import { Button } from './button';

const meta = {
  title: 'v2/Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Token-driven button with 4 variants and 3 sizes. Uses semantic radius (`rounded-button` = pill) and motion tokens. Focus-visible ring inherits from global a11y rule.',
      },
    },
  },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'destructive'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    isLoading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
  },
  args: {
    children: 'Click me',
    variant: 'primary',
    size: 'md',
    isLoading: false,
    disabled: false,
    fullWidth: false,
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: { variant: 'secondary' },
};

export const Ghost: Story = {
  args: { variant: 'ghost' },
};

export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Delete Objective' },
};

export const Loading: Story = {
  args: { isLoading: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const WithIconLeft: Story = {
  args: { iconLeft: <Plus />, children: 'Add Objective' },
};

export const WithIconRight: Story = {
  args: { iconRight: <ArrowRight />, children: 'Continue' },
};

export const DestructiveWithIcon: Story = {
  args: { variant: 'destructive', iconLeft: <Trash2 />, children: 'Remove' },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
};

export const FullWidth: Story = {
  args: { fullWidth: true },
  decorators: [
    (Story) => (
      <div className="w-96 rounded-card border border-outline-variant bg-surface-container-low p-4">
        <Story />
      </div>
    ),
  ],
};
