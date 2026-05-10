import type { Meta, StoryObj } from '@storybook/react-vite';
import { ToastProvider, useToast, NotificationToast } from './notification-toast';
import { Button } from './button';

const meta: Meta<typeof NotificationToast> = {
  title: 'v2/Organisms/NotificationToast',
  component: NotificationToast,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Toast notification system. Wrap app with `<ToastProvider>`, then call `useToast().toast({ ... })`. Stacked top-right, auto-dismiss after `durationMs`. ARIA `alert` for errors, `status` otherwise.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof NotificationToast>;

function Demo() {
  const { toast, clear } = useToast();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="primary"
        onClick={() =>
          toast({
            tone: 'success',
            title: 'Saved',
            description: 'Your changes have been saved successfully.',
          })
        }
      >
        Success
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast({
            tone: 'warning',
            title: 'Unsaved changes',
            description: 'You have unsaved edits — save before leaving.',
            durationMs: 6000,
          })
        }
      >
        Warning
      </Button>
      <Button
        variant="destructive"
        onClick={() =>
          toast({
            tone: 'error',
            title: 'Save failed',
            description: 'Network error. Click Retry to try again.',
            action: { label: 'Retry', onClick: () => alert('retry') },
            durationMs: 0,
          })
        }
      >
        Error (persistent + action)
      </Button>
      <Button
        variant="ghost"
        onClick={() =>
          toast({
            tone: 'info',
            title: 'Background sync',
            description: 'Lead data is syncing from CRM.',
          })
        }
      >
        Info
      </Button>
      <Button variant="ghost" onClick={clear}>Clear all</Button>
    </div>
  );
}

export const ProviderDemo: Story = {
  render: () => (
    <ToastProvider>
      <Demo />
    </ToastProvider>
  ),
};

export const Standalone: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-2">
      <NotificationToast
        toast={{ id: '1', tone: 'success', title: 'Saved', description: 'Changes synced to server.', durationMs: 4000 }}
        onDismiss={() => undefined}
      />
      <NotificationToast
        toast={{ id: '2', tone: 'warning', title: 'Heads up', description: 'API quota at 85%.', durationMs: 4000 }}
        onDismiss={() => undefined}
      />
      <NotificationToast
        toast={{ id: '3', tone: 'error', title: 'Save failed', description: 'Network error.', durationMs: 0, action: { label: 'Retry', onClick: () => undefined } }}
        onDismiss={() => undefined}
      />
      <NotificationToast
        toast={{ id: '4', tone: 'info', title: 'Sync running', description: 'Lead data updating from CRM.', durationMs: 4000 }}
        onDismiss={() => undefined}
      />
    </div>
  ),
};
