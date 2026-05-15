/**
 * ApiKeysPanel — admin-only settings panel for API key lifecycle management.
 * Composes ApiKeysTable + GenerateApiKeyModal + revoke confirm dialog.
 */

import { useState, useEffect, useCallback } from 'react';
import { Key, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/notification-toast';
import { Spinner } from '@/components/ui/spinner';
import { ApiKeysTable } from './api-keys-table';
import { GenerateApiKeyModal } from './generate-api-key-modal';
import { listApiKeys, revokeApiKey } from '@/api/admin-api-keys';
import type { ApiKeyListItem } from '@/api/admin-api-keys';

interface ApiKeysPanelProps {
  /** Controlled from Settings parent — open generate modal via header button */
  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;
}

export function ApiKeysPanelV2({ isGenerating, setIsGenerating }: ApiKeysPanelProps) {
  const { toast } = useToast();
  const [keys, setKeys] = useState<ApiKeyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokeTarget, setRevokeTarget] = useState<ApiKeyListItem | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    try {
      const data = await listApiKeys();
      setKeys(data);
    } catch (err) {
      toast({ tone: 'error', title: 'Failed to load API keys', description: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { void fetchKeys(); }, [fetchKeys]);

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    setRevokingId(revokeTarget.id);
    try {
      await revokeApiKey(revokeTarget.id);
      toast({ tone: 'success', title: `Key "${revokeTarget.name}" revoked` });
      setRevokeTarget(null);
      await fetchKeys();
    } catch (err) {
      toast({ tone: 'error', title: 'Revoke failed', description: (err as Error).message });
    } finally {
      setRevokingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-primary">
        <Spinner size="lg" hideLabel={false} label="Loading API keys…" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      {keys.length > 0 ? (
        <ApiKeysTable keys={keys} onRevoke={setRevokeTarget} revokingId={revokingId} />
      ) : (
        <EmptyState
          icon={<Key />}
          title="No API keys"
          description="Generate a key to allow external services to read SMIT-OS data."
          actions={
            <Button variant="primary" iconLeft={<Plus />} onClick={() => setIsGenerating(true)}>Generate Key</Button>
          }
          decorative
        />
      )}

      <GenerateApiKeyModal
        open={isGenerating}
        onClose={() => setIsGenerating(false)}
        onCreated={fetchKeys}
      />

      <ConfirmDialog
        open={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        onConfirm={handleRevoke}
        tone="destructive"
        title={`Revoke "${revokeTarget?.name}"?`}
        description="This key will stop working immediately. This action cannot be undone."
        isLoading={!!revokingId}
      />
    </div>
  );
}
