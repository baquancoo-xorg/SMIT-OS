import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  FolderOpen,
  Link2,
  Search,
  Unlink,
} from 'lucide-react';
import {
  Badge,
  Button,
  GlassCard,
  KpiCard,
  Spinner,
} from '../ui';

interface GoogleStatus {
  connected: boolean;
  email?: string;
  folderId?: string;
  folderName?: string;
}

interface Folder {
  id: string;
  name: string;
}

interface ExportStatus {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  spreadsheetUrl?: string;
  error?: string;
  retryCount: number;
}

interface SheetsExportTabProps {
  exportTrigger?: number;
  onExportingChange?: (exporting: boolean) => void;
}

/**
 * SheetsExportTab v2 — Google Sheets export config + status.
 *
 * Logic + API identical to v1: /api/google/{status,auth,disconnect,folder,folders}
 * + /api/sheets-export/{trigger,status}. Visual layer migrated to v2.
 */
export function SheetsExportTabV2({ exportTrigger, onExportingChange }: SheetsExportTabProps) {
  const [googleStatus, setGoogleStatus] = useState<GoogleStatus | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [exportStatus, setExportStatus] = useState<ExportStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [folderSearch, setFolderSearch] = useState('');
  const [showFolderDropdown, setShowFolderDropdown] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  useEffect(() => {
    if (exportTrigger && exportTrigger > 0) {
      triggerExport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportTrigger]);

  useEffect(() => {
    onExportingChange?.(exporting);
  }, [exporting, onExportingChange]);

  const filteredFolders = useMemo(() => {
    if (!folderSearch.trim()) return folders;
    const search = folderSearch.toLowerCase();
    return folders.filter((f) => f.name.toLowerCase().includes(search));
  }, [folders, folderSearch]);

  useEffect(() => {
    checkGoogleStatus();
    const params = new URLSearchParams(window.location.search);
    if (params.get('connected') === 'true') {
      setGoogleError(null);
      checkGoogleStatus();
      window.history.replaceState({}, '', '/settings?tab=export');
    }
    const errorParam = params.get('error');
    if (errorParam) {
      setGoogleError(decodeURIComponent(errorParam));
      window.history.replaceState({}, '', '/settings?tab=export');
    }
  }, []);

  const checkGoogleStatus = async () => {
    try {
      const res = await fetch('/api/google/status', { credentials: 'include' });
      const data = await res.json();
      setGoogleStatus(data);
      if (data.connected) loadFolders();
    } catch (error) {
      console.error('Failed to check Google status:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectGoogle = async () => {
    setConnecting(true);
    setGoogleError(null);
    try {
      const res = await fetch('/api/google/auth', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) {
        setGoogleError(data.error || 'Failed to start OAuth');
        setConnecting(false);
        return;
      }
      if (!data.authUrl) {
        setGoogleError('Google OAuth URL missing. Check server configuration.');
        setConnecting(false);
        return;
      }
      window.location.href = data.authUrl;
    } catch (error) {
      console.error('Failed to start OAuth:', error);
      setGoogleError('Network error. Please try again.');
      setConnecting(false);
    }
  };

  const disconnectGoogle = async () => {
    if (!confirm('Disconnect Google account?')) return;
    try {
      await fetch('/api/google/disconnect', { method: 'DELETE', credentials: 'include' });
      setGoogleStatus({ connected: false });
      setFolders([]);
      setGoogleError(null);
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  const loadFolders = async () => {
    setLoadingFolders(true);
    try {
      const res = await fetch('/api/google/folders', { credentials: 'include' });
      const data = await res.json();
      if (res.ok) setFolders(data.folders || []);
      else setFolders([]);
    } catch (error) {
      console.error('Failed to load folders:', error);
      setFolders([]);
    } finally {
      setLoadingFolders(false);
    }
  };

  const selectFolder = async (folderId: string, folderName: string) => {
    try {
      await fetch('/api/google/folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ folderId: folderId || null, folderName: folderName || null }),
      });
      setGoogleStatus((prev) =>
        prev ? { ...prev, folderId: folderId || undefined, folderName: folderName || undefined } : null,
      );
    } catch (error) {
      console.error('Failed to set folder:', error);
    }
  };

  const triggerExport = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/sheets-export/trigger', { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        setExportStatus(data.status);
        startPolling();
      } else {
        setExportStatus({ ...data.status, error: data.error });
        setExporting(false);
      }
    } catch (error) {
      console.error('Failed to trigger export:', error);
      setExporting(false);
    }
  };

  const startPolling = () => {
    const interval = setInterval(async () => {
      const res = await fetch('/api/sheets-export/status', { credentials: 'include' });
      const data = await res.json();
      setExportStatus(data.status);
      if (data.status?.status === 'completed' || data.status?.status === 'failed') {
        clearInterval(interval);
        setExporting(false);
      }
    }, 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-primary">
        <Spinner size="lg" hideLabel={false} label="Loading export config..." />
      </div>
    );
  }

  const selectedFolder = googleStatus?.folderName || 'Root (My Drive)';

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {/* Account card */}
        <GlassCard variant="raised" padding="lg" className="lg:col-span-2" ariaLabel="Google account connection">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant">
                Google account
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={googleStatus?.connected ? 'success' : 'neutral'}>
                  {googleStatus?.connected ? 'Connected' : 'Not connected'}
                </Badge>
                {googleStatus?.connected && googleStatus.email && (
                  <span className="text-sm font-medium text-on-surface">{googleStatus.email}</span>
                )}
              </div>
            </div>
            {googleStatus?.connected ? (
              <Button onClick={disconnectGoogle} variant="ghost" size="sm" iconLeft={<Unlink />} className="text-error hover:bg-error-container/40">
                Disconnect
              </Button>
            ) : (
              <Button onClick={connectGoogle} variant="primary" iconLeft={<Link2 />} isLoading={connecting}>
                Connect Google
              </Button>
            )}
          </div>

          {googleError && (
            <div className="mt-4 flex items-start gap-2 rounded-card bg-error-container/40 border border-error/30 p-3">
              <AlertCircle className="size-4 text-error shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-on-error-container">{googleError}</p>
            </div>
          )}

          {googleStatus?.connected && (
            <div className="mt-5 pt-5 border-t border-outline-variant/40 flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <FolderOpen className="size-4 text-on-surface-variant" aria-hidden="true" />
                <p className="text-sm font-semibold text-on-surface">Export folder</p>
              </div>

              {loadingFolders ? (
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <Spinner size="sm" hideLabel={false} label="Loading folders..." />
                </div>
              ) : (
                <div className="relative">
                  <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                  <input
                    type="text"
                    value={showFolderDropdown ? folderSearch : selectedFolder}
                    onChange={(e) => setFolderSearch(e.target.value)}
                    onFocus={() => {
                      setShowFolderDropdown(true);
                      setFolderSearch('');
                    }}
                    onBlur={() => setTimeout(() => setShowFolderDropdown(false), 200)}
                    placeholder="Search folder..."
                    className="h-10 w-full rounded-input border border-outline-variant bg-surface-container-lowest pl-10 pr-3 text-[length:var(--text-body)] text-on-surface placeholder:text-on-surface-variant/60 focus-visible:outline-none focus-visible:border-primary"
                  />

                  {showFolderDropdown && (
                    <div className="absolute z-dropdown mt-2 max-h-64 w-full overflow-auto rounded-card border border-outline-variant/40 bg-white shadow-md">
                      <button
                        type="button"
                        onClick={() => {
                          selectFolder('', 'Root (My Drive)');
                          setShowFolderDropdown(false);
                        }}
                        className={[
                          'block w-full px-3 py-2 text-left text-[length:var(--text-body-sm)] transition-colors hover:bg-surface-container-low',
                          !googleStatus.folderId ? 'bg-primary-container/40 text-on-primary-container font-semibold' : 'text-on-surface',
                        ].join(' ')}
                      >
                        Root (My Drive)
                      </button>

                      {filteredFolders.length === 0 ? (
                        <div className="px-3 py-3 text-center text-sm text-on-surface-variant">No folders found.</div>
                      ) : (
                        filteredFolders.map((folder) => (
                          <button
                            key={folder.id}
                            type="button"
                            onClick={() => {
                              selectFolder(folder.id, folder.name);
                              setShowFolderDropdown(false);
                            }}
                            className={[
                              'block w-full px-3 py-2 text-left text-[length:var(--text-body-sm)] transition-colors hover:bg-surface-container-low',
                              googleStatus.folderId === folder.id ? 'bg-primary-container/40 text-on-primary-container font-semibold' : 'text-on-surface',
                            ].join(' ')}
                          >
                            {folder.name}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </GlassCard>

        {/* Schedule + Sheets KPIs */}
        <KpiCard
          label="Scheduled export"
          value="Daily"
          unit="11:00 AM"
          icon={<CheckCircle2 />}
          accent={googleStatus?.connected ? 'success' : 'info'}
          decorative
        />
        <KpiCard
          label="Sheets per cycle"
          value="13"
          icon={<FolderOpen />}
          accent="primary"
          decorative
        />
      </div>

      {exportStatus && (
        <GlassCard
          variant={exportStatus.status === 'completed' ? 'surface' : 'raised'}
          padding="lg"
          ariaLabel="Export status"
          className={[
            'border',
            exportStatus.status === 'completed'
              ? 'border-success/30'
              : exportStatus.status === 'failed'
              ? 'border-error/30'
              : 'border-primary/30',
          ].join(' ')}
        >
          <div className="flex items-start gap-4">
            <div
              className={[
                'flex size-10 shrink-0 items-center justify-center rounded-card',
                exportStatus.status === 'completed'
                  ? 'bg-success-container text-on-success-container'
                  : exportStatus.status === 'failed'
                  ? 'bg-error-container text-on-error-container'
                  : 'bg-primary-container text-on-primary-container',
              ].join(' ')}
            >
              {exportStatus.status === 'completed' ? (
                <CheckCircle2 className="size-5" aria-hidden="true" />
              ) : exportStatus.status === 'failed' ? (
                <AlertCircle className="size-5" aria-hidden="true" />
              ) : (
                <Spinner size="sm" />
              )}
            </div>

            <div className="min-w-0 flex-1 py-1">
              <p
                className={[
                  'text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)]',
                  exportStatus.status === 'completed' ? 'text-success' : exportStatus.status === 'failed' ? 'text-error' : 'text-primary',
                ].join(' ')}
              >
                {exportStatus.status === 'completed'
                  ? 'Export completed'
                  : exportStatus.status === 'failed'
                  ? 'Export failed'
                  : 'Export in progress...'}
              </p>

              {exportStatus.spreadsheetUrl && (
                <a
                  href={exportStatus.spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-on-surface hover:text-primary motion-fast ease-standard transition-colors rounded-button focus-visible:outline-none"
                >
                  View Google Sheets
                  <Link2 className="size-3.5" aria-hidden="true" />
                </a>
              )}

              {exportStatus.error && <p className="mt-1 text-sm text-error">{exportStatus.error}</p>}
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
