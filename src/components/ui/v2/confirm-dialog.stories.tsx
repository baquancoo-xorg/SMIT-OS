import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { ConfirmDialog } from './confirm-dialog';
import { Button } from './button';

const meta: Meta<typeof ConfirmDialog> = {
  title: 'v2/Organisms/ConfirmDialog',
  component: ConfirmDialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Opinionated Modal preset for binary confirms. Three tones (destructive/warning/info). Optional type-to-confirm for high-stakes actions.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ConfirmDialog>;

export const Destructive: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="destructive" onClick={() => setOpen(true)}>Delete OKR</Button>
        <ConfirmDialog
          open={open}
          onClose={() => setOpen(false)}
          onConfirm={() => setOpen(false)}
          tone="destructive"
          title="Delete Objective?"
          description={
            <>
              This will permanently delete <strong className="text-on-surface">Q2 Revenue Goal</strong> and all its key results. This action cannot be undone.
            </>
          }
        />
      </>
    );
  },
};

export const Warning: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Discard changes</Button>
        <ConfirmDialog
          open={open}
          onClose={() => setOpen(false)}
          onConfirm={() => setOpen(false)}
          tone="warning"
          title="Discard unsaved changes?"
          description="You have unsaved edits. Discarding will lose them."
          confirmLabel="Discard"
        />
      </>
    );
  },
};

export const Info: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Mark complete</Button>
        <ConfirmDialog
          open={open}
          onClose={() => setOpen(false)}
          onConfirm={() => setOpen(false)}
          tone="info"
          title="Mark this objective complete?"
          description="This will lock the objective. You can reopen it later from Settings."
          confirmLabel="Mark complete"
        />
      </>
    );
  },
};

export const TypeToConfirm: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="destructive" onClick={() => setOpen(true)}>Delete project (type-to-confirm)</Button>
        <ConfirmDialog
          open={open}
          onClose={() => setOpen(false)}
          onConfirm={() => setOpen(false)}
          tone="destructive"
          title="Delete project SMIT-OS?"
          description={
            <>
              This will permanently delete the <strong className="text-on-surface">SMIT-OS</strong> project, all its OKRs, leads, and reports. This action cannot be undone.
            </>
          }
          typeToConfirm="SMIT-OS"
        />
      </>
    );
  },
};

export const Loading: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    return (
      <>
        <Button variant="destructive" onClick={() => setOpen(true)}>Async delete</Button>
        <ConfirmDialog
          open={open}
          onClose={() => setOpen(false)}
          onConfirm={async () => {
            setLoading(true);
            await new Promise((r) => setTimeout(r, 1500));
            setLoading(false);
            setOpen(false);
          }}
          tone="destructive"
          title="Delete (with async loading)?"
          description="Click Delete and watch the spinner. ESC + close button are disabled during the action."
          isLoading={loading}
        />
      </>
    );
  },
};
