import type { Meta, StoryObj } from '@storybook/react-vite';
import { Mail, Search, User, Lock } from 'lucide-react';
import { Input } from './input';

const meta = {
  title: 'v2/Atoms/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Form input with label, helper text, error state, and optional left/right icons. Auto-generates ID for label association. ARIA-compliant error reporting.',
      },
    },
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
    },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Email',
    placeholder: 'user@smitx.org',
    type: 'email',
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHelperText: Story = {
  args: { helperText: 'We will never share your email.' },
};

export const WithError: Story = {
  args: { error: 'Email already registered.', defaultValue: 'taken@smitx.org' },
};

export const Required: Story = {
  args: { required: true, label: 'Email *' },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'readonly@smitx.org' },
};

export const IconLeft: Story = {
  args: { iconLeft: <Mail />, label: 'Work email' },
};

export const IconRight: Story = {
  args: { iconRight: <Search />, label: 'Search', placeholder: 'Search OKRs...' },
};

export const PasswordWithIcons: Story = {
  args: {
    type: 'password',
    label: 'Password',
    placeholder: '••••••••',
    iconLeft: <Lock />,
  },
};

export const NoLabel: Story = {
  args: { label: undefined, 'aria-label': 'Quick search', placeholder: 'Quick search...' },
};

export const FormStack: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <Input label="Username" iconLeft={<User />} placeholder="dominium" />
      <Input label="Email" iconLeft={<Mail />} type="email" placeholder="user@smitx.org" />
      <Input
        label="Password"
        iconLeft={<Lock />}
        type="password"
        helperText="At least 8 characters"
      />
      <Input
        label="Confirm password"
        iconLeft={<Lock />}
        type="password"
        error="Passwords do not match"
      />
    </div>
  ),
};
