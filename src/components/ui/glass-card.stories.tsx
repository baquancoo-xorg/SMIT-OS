import type { Meta, StoryObj } from '@storybook/react-vite';
import { GlassCard } from './glass-card';
import { Badge } from './badge';
import { Button } from './button';

const meta: Meta<typeof GlassCard> = {
  title: 'v2/Organisms/GlassCard',
  component: GlassCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Canonical glass-morphism container. 4 variants × 4 padding presets. Optional decorative blob (Bento accent) and interactive hover lift.',
      },
    },
  },
  argTypes: {
    variant: { control: 'select', options: ['surface', 'raised', 'ghost', 'outlined'] },
    padding: { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
    interactive: { control: 'boolean' },
    decorative: { control: 'boolean' },
    decorativeAccent: { control: 'select', options: ['primary', 'success', 'warning', 'error', 'info'] },
  },
  args: {
    variant: 'surface',
    padding: 'md',
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof GlassCard>;

export const Surface: Story = {
  args: {
    children: (
      <>
        <h3 className="font-headline text-lg font-semibold text-on-surface">Surface</h3>
        <p className="text-sm text-on-surface-variant">Default variant — soft glass with light border.</p>
      </>
    ),
  },
};

export const Raised: Story = {
  args: {
    variant: 'raised',
    children: (
      <>
        <h3 className="font-headline text-lg font-semibold text-on-surface">Raised</h3>
        <p className="text-sm text-on-surface-variant">Higher opacity + shadow. Use for primary content blocks.</p>
      </>
    ),
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: (
      <>
        <h3 className="font-headline text-lg font-semibold text-on-surface">Ghost</h3>
        <p className="text-sm text-on-surface-variant">Transparent with outlined border. Use inside other cards.</p>
      </>
    ),
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    children: (
      <>
        <h3 className="font-headline text-lg font-semibold text-on-surface">Outlined</h3>
        <p className="text-sm text-on-surface-variant">Solid surface + border. Use for forms / data input zones.</p>
      </>
    ),
  },
};

export const Interactive: Story = {
  args: {
    interactive: true,
    children: (
      <>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-headline text-base font-semibold text-on-surface">Hover me</h3>
          <Badge variant="info">Clickable</Badge>
        </div>
        <p className="text-sm text-on-surface-variant">Adds shadow + border accent on hover. Use when entire card is a link or button.</p>
      </>
    ),
  },
};

export const WithDecorative: Story = {
  args: {
    variant: 'raised',
    padding: 'lg',
    decorative: true,
    decorativeAccent: 'success',
    children: (
      <>
        <Badge variant="success">+12.5%</Badge>
        <h3 className="mt-3 font-headline text-2xl font-bold text-on-surface">3.2B đ</h3>
        <p className="mt-1 text-sm text-on-surface-variant">Total Q2 revenue</p>
        <Button variant="primary" size="sm" className="mt-4">View detail</Button>
      </>
    ),
  },
};

export const Grid: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <GlassCard variant="surface"><h4 className="font-semibold">Surface</h4></GlassCard>
      <GlassCard variant="raised"><h4 className="font-semibold">Raised</h4></GlassCard>
      <GlassCard variant="ghost"><h4 className="font-semibold">Ghost</h4></GlassCard>
      <GlassCard variant="outlined"><h4 className="font-semibold">Outlined</h4></GlassCard>
      <GlassCard variant="raised" decorative decorativeAccent="primary">
        <h4 className="font-semibold">Decorative blob — primary</h4>
      </GlassCard>
      <GlassCard variant="raised" interactive>
        <h4 className="font-semibold">Interactive</h4>
      </GlassCard>
    </div>
  ),
  decorators: [(Story) => <div className="w-full max-w-5xl"><Story /></div>],
};
