import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowLeft, LifeBuoy, Home } from 'lucide-react';
import { NotFoundPage } from './not-found-page';
import { Button } from './button';

const meta: Meta<typeof NotFoundPage> = {
  title: 'v2/Misc/NotFoundPage',
  component: NotFoundPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Full-page 404 with Bento decorative blobs (primary + secondary). Default actions = Home + Go back. Override with custom Link components for router integration.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof NotFoundPage>;

export const Default: Story = {};

export const WithAttemptedPath: Story = {
  args: { attemptedPath: '/okrs/q5-2099' },
};

export const CustomTitle: Story = {
  args: {
    title: 'Đường dẫn không tồn tại',
    description: 'Có thể link đã bị thay đổi hoặc OKR này đã bị xoá.',
  },
};

export const CustomActions: Story = {
  args: {
    primaryAction: (
      <Button variant="primary" iconLeft={<Home />} onClick={() => alert('Custom: navigate /')}>
        Custom home
      </Button>
    ),
    secondaryAction: (
      <Button variant="secondary" iconLeft={<LifeBuoy />} onClick={() => alert('Open support')}>
        Contact support
      </Button>
    ),
  },
};

export const SingleAction: Story = {
  args: {
    secondaryAction: <></>, // no secondary action
    primaryAction: (
      <Button variant="primary" iconLeft={<ArrowLeft />} onClick={() => window.history.back()}>
        Go back
      </Button>
    ),
  },
};
