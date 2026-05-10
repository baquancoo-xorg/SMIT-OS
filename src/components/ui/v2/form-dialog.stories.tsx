import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Target, UserPlus } from 'lucide-react';
import { FormDialog } from './form-dialog';
import { Button } from './button';
import { Input } from './input';

const meta: Meta<typeof FormDialog> = {
  title: 'v2/Organisms/FormDialog',
  component: FormDialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Modal + native HTML form. Submit on Enter works automatically. Caller manages form state + validation (Zod, RHF, or controlled inputs).',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof FormDialog>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>New Objective</Button>
        <FormDialog
          open={open}
          onClose={() => setOpen(false)}
          onSubmit={() => setOpen(false)}
          title="New Objective"
          description="Set a quarterly objective with measurable key results."
          icon={<Target />}
        >
          <Input label="Title" name="title" required placeholder="Q3 Revenue Goal" />
          <Input label="Owner" name="owner" placeholder="Sales team" />
          <Input
            label="Target value"
            name="target"
            type="number"
            required
            placeholder="3000000000"
          />
        </FormDialog>
      </>
    );
  },
};

export const WithValidation: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const isValid = name.length >= 2 && /^\S+@\S+\.\S+$/.test(email);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Invite Member</Button>
        <FormDialog
          open={open}
          onClose={() => {
            setOpen(false);
            setName('');
            setEmail('');
          }}
          onSubmit={() => {
            alert(`Invited: ${name} <${email}>`);
            setOpen(false);
          }}
          title="Invite team member"
          description="They will receive an email with a magic link."
          icon={<UserPlus />}
          submitLabel="Send invite"
          submitDisabled={!isValid}
          footerLeft={!isValid ? '* All fields required' : undefined}
        >
          <Input
            label="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={name.length > 0 && name.length < 2 ? 'Name must be at least 2 characters.' : undefined}
            required
          />
          <Input
            label="Work email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={email.length > 0 && !/^\S+@\S+\.\S+$/.test(email) ? 'Invalid email format.' : undefined}
            required
          />
        </FormDialog>
      </>
    );
  },
};

export const AsyncSubmit: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Save with delay</Button>
        <FormDialog
          open={open}
          onClose={() => setOpen(false)}
          onSubmit={async () => {
            setSubmitting(true);
            await new Promise((r) => setTimeout(r, 1500));
            setSubmitting(false);
            setOpen(false);
          }}
          title="Saving with async..."
          description="Click Save and watch the spinner. Cancel + ESC are disabled while submitting."
          icon={<Target />}
          isSubmitting={submitting}
        >
          <Input label="Title" defaultValue="Sample" />
        </FormDialog>
      </>
    );
  },
};

export const DestructiveSubmit: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="destructive" onClick={() => setOpen(true)}>Delete + form</Button>
        <FormDialog
          open={open}
          onClose={() => setOpen(false)}
          onSubmit={() => setOpen(false)}
          title="Delete objective?"
          description="Type the reason for deletion (audit log)."
          submitLabel="Delete"
          submitVariant="destructive"
          icon={<Target />}
          iconAccent="error"
        >
          <Input label="Reason" name="reason" required placeholder="Duplicate / outdated / etc." />
        </FormDialog>
      </>
    );
  },
};
