import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton } from './skeleton';

const meta = {
  title: 'v2/Atoms/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Loading placeholder with shimmer (`animate-pulse`). Three variants: `text`, `circle`, `rect`. Multi-line text auto-shortens last line.',
      },
    },
  },
  argTypes: {
    variant: { control: 'radio', options: ['text', 'circle', 'rect'] },
    lines: { control: { type: 'number', min: 1, max: 8 } },
  },
  args: {
    variant: 'text',
    lines: 1,
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TextLine: Story = {
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export const TextParagraph: Story = {
  args: { lines: 4 },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export const Circle: Story = {
  args: { variant: 'circle', width: 48, height: 48 },
};

export const Rectangle: Story = {
  args: { variant: 'rect', height: 160 },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export const CardLoadingState: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-4 rounded-card border border-outline-variant bg-white p-4">
      <div className="flex items-center gap-3">
        <Skeleton variant="circle" width={40} height={40} />
        <div className="flex-1">
          <Skeleton variant="text" width="60%" />
          <div className="h-1" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <Skeleton variant="rect" height={120} />
      <Skeleton variant="text" lines={3} />
    </div>
  ),
};

export const TableRowLoading: Story = {
  render: () => (
    <div className="flex w-[28rem] flex-col gap-3 rounded-card border border-outline-variant bg-white p-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton variant="circle" width={32} height={32} />
          <Skeleton variant="text" width="35%" />
          <Skeleton variant="text" width="25%" />
          <Skeleton variant="text" width="20%" />
        </div>
      ))}
    </div>
  ),
};
