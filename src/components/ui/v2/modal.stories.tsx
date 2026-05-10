import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Pencil, Trash2, AlertTriangle, Sparkles } from 'lucide-react';
import { Modal } from './modal';
import { Button } from './button';
import { Input } from './input';

const meta: Meta<typeof Modal> = {
  title: 'v2/Organisms/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Headless UI Dialog wrapper. Portal + focus trap + ESC + scroll lock. Mobile = bottom sheet, desktop = centered. Lazy mount via Transition.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

function Template({ size = 'md', icon, iconAccent }: { size?: 'sm' | 'md' | 'lg' | 'xl'; icon?: React.ReactNode; iconAccent?: 'primary' | 'success' | 'warning' | 'error' | 'info' }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open modal ({size})</Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Edit Objective"
        description="Update the title and target. Changes save on submit."
        size={size}
        icon={icon}
        iconAccent={iconAccent}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Save</Button>
          </>
        }
      >
        <form className="flex flex-col gap-4">
          <Input label="Title" defaultValue="Q2 Revenue Goal" />
          <Input label="Target" type="number" defaultValue="3200000000" />
        </form>
      </Modal>
    </>
  );
}

export const Default: Story = {
  render: () => <Template />,
};

export const Small: Story = {
  render: () => <Template size="sm" />,
};

export const Large: Story = {
  render: () => <Template size="lg" />,
};

export const ExtraLarge: Story = {
  render: () => <Template size="xl" />,
};

export const WithIcon: Story = {
  render: () => <Template icon={<Pencil />} iconAccent="primary" />,
};

export const Destructive: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="destructive" onClick={() => setOpen(true)}>Delete Objective</Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Delete Objective?"
          description="This action cannot be undone. The objective and all its key results will be permanently removed."
          icon={<Trash2 />}
          iconAccent="error"
          size="sm"
          footer={
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => setOpen(false)}>Delete</Button>
            </>
          }
        >
          <p className="text-sm text-on-surface-variant">
            Are you sure you want to delete <strong className="text-on-surface">Q2 Revenue Goal</strong>?
          </p>
        </Modal>
      </>
    );
  },
};

export const NonDismissible: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open required-action modal</Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Action required"
          description="ESC + outside click are disabled. Pick an option to proceed."
          icon={<AlertTriangle />}
          iconAccent="warning"
          dismissible={false}
          hideCloseButton
          footer={
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>Skip</Button>
              <Button onClick={() => setOpen(false)}>Continue</Button>
            </>
          }
        >
          <p className="text-sm text-on-surface-variant">
            You have unsaved changes. Close them or continue editing.
          </p>
        </Modal>
      </>
    );
  },
};

export const HeadlessNoFooter: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open headless modal</Button>
        <Modal open={open} onClose={() => setOpen(false)} hideCloseButton size="md">
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <Sparkles className="size-10 text-primary" />
            <h3 className="font-headline text-xl font-bold text-on-surface">All clear!</h3>
            <p className="text-sm text-on-surface-variant">Your weekly checkin is complete.</p>
            <Button onClick={() => setOpen(false)} className="mt-4">Done</Button>
          </div>
        </Modal>
      </>
    );
  },
};
