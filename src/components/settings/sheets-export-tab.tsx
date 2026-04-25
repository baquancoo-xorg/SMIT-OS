import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  FolderOpen,
  Link2,
  Loader2,
  Search,
  Unlink,
} from 'lucide-react';
import { Badge, Button, Card } from '../ui';

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

export function SheetsExportTab({ exportTrigger, onExportingChange }: SheetsExportTabProps) {
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
  }, [exportTrigger]);

  useEffect(() => {
    onExportingChange?.(exporting);
  }, [exporting, onExportingChange]);

  const filteredFolders = useMemo(() => {
    if (!folderSearch.trim()) return folders;
    const search = folderSearch.toLowerCase();
    return folders.filter((folder) => folder.name.toLowerCase().includes(search));
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
      const res = await fetch('/api/google/status');
      const data = await res.json();
      setGoogleStatus(data);
      if (data.connected) {
        loadFolders();
      }
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
      const res = await fetch('/api/google/auth');
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
      await fetch('/api/google/disconnect', { method: 'DELETE' });
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
      const res = await fetch('/api/google/folders');
      const data = await res.json();
      if (res.ok) {
        setFolders(data.folders || []);
      } else {
        console.error('Failed to load folders:', data.error, data.details);
        setFolders([]);
      }
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
        body: JSON.stringify({ folderId: folderId || null, folderName: folderName || null }),
      });
      setGoogleStatus((prev) =>
        prev
          ? {
              ...prev,
              folderId: folderId || undefined,
              folderName: folderName || undefined,
            }
          : null,
      );
    } catch (error) {
      console.error('Failed to set folder:', error);
    }
  };

  const triggerExport = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/sheets-export/trigger', { method: 'POST' });
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
      const res = await fetch('/api/sheets-export/status');
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
      <div className="flex items-center justify-center py-12 text-on-surface-variant">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const statusBadgeVariant = googleStatus?.connected ? 'success' : 'neutral';
  const selectedFolder = googleStatus?.folderName || 'Root (My Drive)';

  return (
    <div className="max-w-6xl space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2">
          <Card variant="glass" className="p-6 space-y-6 h-full">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Google Account</p>
                <div className="flex items-center gap-2">
                  <Badge variant={statusBadgeVariant}>{googleStatus?.connected ? 'Connected' : 'Not connected'}</Badge>
                  {googleStatus?.connected && googleStatus.email && (
                    <span className="text-sm font-medium text-on-surface">{googleStatus.email}</span>
                  )}
                </div>
              </div>

              {googleStatus?.connected ? (
                <Button onClick={disconnectGoogle} variant="ghost" size="sm" className="gap-2 text-error">
                  <Unlink size={14} />
                  Disconnect
                </Button>
              ) : (
                <Button onClick={connectGoogle} disabled={connecting} className="gap-2">
                  {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 size={16} />}
                  Connect Google
                </Button>
              )}
            </div>

            {googleError && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-error/10 border border-error/20">
                <AlertCircle className="h-4 w-4 text-error shrink-0 mt-0.5" />
                <p className="text-sm text-error">{googleError}</p>
              </div>
            )}

            {googleStatus?.connected && (
              <div className="pt-5 border-t border-outline-variant/10 space-y-3">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-on-surface-variant" />
                  <p className="text-sm font-bold text-on-surface">Export Folder</p>
                </div>

                {loadingFolders ? (
                  <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading folders...
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant/70" />
                    <input
                      type="text"
                      value={showFolderDropdown ? folderSearch : selectedFolder}
                      onChange={(e) => setFolderSearch(e.target.value)}
                      onFocus={() => {
                        setShowFolderDropdown(true);
                        setFolderSearch('');
                      }}
                      onBlur={() => setTimeout(() => setShowFolderDropdown(false), 200)}
                      placeholder="Tìm kiếm folder..."
                      className="w-full rounded-xl border border-outline-variant/30 bg-white/50 py-2.5 pr-4 pl-10 text-sm text-on-surface placeholder:text-on-surface-variant/70 outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                    />

                    {showFolderDropdown && (
                      <div className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-2xl border border-outline-variant/20 bg-surface-container-lowest shadow-sm">
                        <button
                          type="button"
                          onClick={() => {
                            selectFolder('', 'Root (My Drive)');
                            setShowFolderDropdown(false);
                          }}
                          className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-surface-container-low ${
                            !googleStatus.folderId
                              ? 'bg-primary/10 text-primary font-semibold'
                              : 'text-on-surface'
                          }`}
                        >
                          Root (My Drive)
                        </button>

                        {filteredFolders.length === 0 ? (
                          <div className="px-4 py-3 text-center text-sm text-on-surface-variant">Không tìm thấy folder</div>
                        ) : (
                          filteredFolders.map((folder) => (
                            <button
                              key={folder.id}
                              type="button"
                              onClick={() => {
                                selectFolder(folder.id, folder.name);
                                setShowFolderDropdown(false);
                              }}
                              className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-surface-container-low ${
                                googleStatus.folderId === folder.id
                                  ? 'bg-primary/10 text-primary font-semibold'
                                  : 'text-on-surface'
                              }`}
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
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card variant="glass" className="p-5 space-y-2 h-full">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scheduled Export</p>
            <p className="text-sm font-bold text-on-surface">Daily at 11:00 AM</p>
            <Badge variant={googleStatus?.connected ? 'success' : 'neutral'}>
              {googleStatus?.connected ? 'Active' : 'Inactive'}
            </Badge>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card variant="glass" className="p-5 space-y-2 h-full">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sheets Created</p>
            <p className="text-sm font-bold text-on-surface">Per export cycle</p>
            <p className="text-4xl font-black font-headline text-primary">13</p>
          </Card>
        </div>
      </div>

      {exportStatus && (
        <div
          className={`p-5 rounded-2xl border backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-500 ${
            exportStatus.status === 'completed'
              ? 'bg-emerald-50/50 border-emerald-200'
              : exportStatus.status === 'failed'
                ? 'bg-error/5 border-error/20'
                : 'bg-primary/5 border-primary/20'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-xl ${
              exportStatus.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 
              exportStatus.status === 'failed' ? 'bg-error/10 text-error' : 
              'bg-primary/10 text-primary'
            }`}>
              {exportStatus.status === 'completed' ? (
                <CheckCircle2 size={20} />
              ) : exportStatus.status === 'failed' ? (
                <AlertCircle size={20} />
              ) : (
                <Loader2 size={20} className="animate-spin" />
              )}
            </div>

            <div className="min-w-0 flex-1 py-1">
              <p
                className={`text-sm font-black uppercase tracking-widest ${
                  exportStatus.status === 'completed'
                    ? 'text-emerald-700'
                    : exportStatus.status === 'failed'
                      ? 'text-error'
                      : 'text-primary'
                }`}
              >
                {exportStatus.status === 'completed'
                  ? 'Export Completed'
                  : exportStatus.status === 'failed'
                    ? 'Export Failed'
                    : 'Export in Progress...'}
              </p>

              {exportStatus.spreadsheetUrl && (
                <a
                  href={exportStatus.spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-on-surface hover:text-primary transition-colors"
                >
                  View Google Sheets <Link2 size={14} />
                </a>
              )}

              {exportStatus.error && <p className="mt-1 text-xs font-medium text-error opacity-80">{exportStatus.error}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
