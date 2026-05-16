/**
 * Two-stage modal for API key generation.
 * Stage 1: form (name + scope checkboxes)
 * Stage 2: success — display raw key ONCE with copy button + warning.
 * Raw key is discarded from state on close.
 */

import { useState } from 'react';
import { Key, Copy, Check, AlertTriangle } from 'lucide-react';
import { Button, Input, FormDialog, Modal } from '../../ui';
import { createApiKey } from '../../../api/admin-api-keys';
import type { CreatedApiKey } from '../../../api/admin-api-keys';

const ALL_SCOPES = [
  { value: 'read:reports', label: 'Reports' },
  { value: 'read:crm', label: 'CRM' },
  { value: 'read:ads', label: 'Ads' },
  { value: 'read:okr', label: 'OKR' },
  { value: 'read:dashboard', label: 'Dashboard' },
];

interface GenerateApiKeyModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void; // refresh list after success
}

export function GenerateApiKeyModal({ open, onClose, onCreated }: GenerateApiKeyModalProps) {
  const [name, setName] = useState('');
  const [scopes, setScopes] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedApiKey | null>(null);
  const [copied, setCopied] = useState(false);

  const reset = () => {
    setName('');
    setScopes([]);
    setSubmitting(false);
    setError(null);
    setCreated(null);
    setCopied(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const toggleScope = (scope: string) => {
    setScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope],
    );
  };

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const result = await createApiKey(name.trim(), scopes);
      setCreated(result);
      onCreated();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!created?.rawKey) return;
    await navigator.clipboard.writeText(created.rawKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Stage 2: success — show raw key once
  if (created) {
    return (
      <Modal open={open} onClose={handleClose} title="API key generated" size="md">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 rounded-lg bg-warning/10 p-3 text-warning">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p className="text-[length:var(--text-body-sm)] font-medium">
              Copy this key now — it will never be shown again.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-input border border-outline-variant bg-surface-container-lowest px-3 py-2">
            <code className="min-w-0 flex-1 break-all font-mono text-[length:var(--text-body-sm)] text-on-surface">
              {created.rawKey}
            </code>
            <Button
              variant="ghost"
              size="sm"
              iconLeft={copied ? <Check /> : <Copy />}
              onClick={handleCopy}
              aria-label="Copy API key"
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>

          <div className="text-[length:var(--text-body-sm)] text-on-surface-variant">
            <p><span className="font-semibold">Name:</span> {created.name}</p>
            <p><span className="font-semibold">Scopes:</span> {created.scopes.join(', ')}</p>
          </div>

          <div className="flex justify-end">
            <Button variant="primary" onClick={handleClose}>
              Done — I've saved the key
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  // Stage 1: form
  return (
    <FormDialog
      open={open}
      onClose={handleClose}
      onSubmit={(e) => { e.preventDefault(); void handleSubmit(); }}
      title="Generate API key"
      description="Keys provide programmatic read access to SMIT-OS data."
      icon={<Key />}
      size="md"
      submitLabel="Generate key"
      isSubmitting={submitting}
      submitDisabled={!name.trim() || scopes.length === 0}
    >
      <Input
        label="Key name"
        placeholder="e.g., Cowork MCP"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={50}
        required
        helperText="1–50 characters"
      />

      <fieldset className="flex flex-col gap-2">
        <legend className="text-[length:var(--text-label)] font-medium text-on-surface-variant">
          Scopes <span className="text-error">*</span>
        </legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {ALL_SCOPES.map(({ value, label }) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-outline-variant px-3 py-2 text-[length:var(--text-body-sm)] text-on-surface hover:bg-surface-container has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <input
                type="checkbox"
                className="accent-primary"
                checked={scopes.includes(value)}
                onChange={() => toggleScope(value)}
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      {error && (
        <p className="text-[length:var(--text-body-sm)] text-error">{error}</p>
      )}
    </FormDialog>
  );
}
