import { RefreshCcw } from 'lucide-react';

interface SyncFromCrmButtonProps {
  canSync: boolean;
  isSyncing: boolean;
  isRunning: boolean;
  onSync: () => void;
}

export default function SyncFromCrmButton({ canSync, isSyncing, isRunning, onSync }: SyncFromCrmButtonProps) {
  if (!canSync) {
    return null;
  }

  return (
    <button
      onClick={onSync}
      disabled={isSyncing || isRunning}
      className="flex items-center justify-center gap-2 h-10 px-5 rounded-full bg-surface-container-high text-slate-600 hover:bg-slate-200 font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
      title="Sync leads from CRM"
    >
      <RefreshCcw size={13} className={isSyncing || isRunning ? 'animate-spin' : ''} />
      {isSyncing || isRunning ? 'Syncing...' : 'Sync from CRM'}
    </button>
  );
}
