import { useState, useEffect } from 'react';
import { FileSpreadsheet, Download, CheckCircle, AlertCircle, Loader2, Link2, Unlink, FolderOpen } from 'lucide-react';

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

export function SheetsExportTab() {
  const [googleStatus, setGoogleStatus] = useState<GoogleStatus | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [exportStatus, setExportStatus] = useState<ExportStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [loadingFolders, setLoadingFolders] = useState(false);

  useEffect(() => {
    checkGoogleStatus();
    // Check URL params for OAuth callback
    const params = new URLSearchParams(window.location.search);
    if (params.get('connected') === 'true') {
      checkGoogleStatus();
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
    try {
      const res = await fetch('/api/google/auth');
      const data = await res.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Failed to start OAuth:', error);
      setConnecting(false);
    }
  };

  const disconnectGoogle = async () => {
    if (!confirm('Disconnect Google account?')) return;
    try {
      await fetch('/api/google/disconnect', { method: 'DELETE' });
      setGoogleStatus({ connected: false });
      setFolders([]);
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  const loadFolders = async () => {
    setLoadingFolders(true);
    try {
      const res = await fetch('/api/google/folders');
      const data = await res.json();
      setFolders(data.folders || []);
    } catch (error) {
      console.error('Failed to load folders:', error);
    } finally {
      setLoadingFolders(false);
    }
  };

  const selectFolder = async (folderId: string, folderName: string) => {
    try {
      await fetch('/api/google/folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId, folderName }),
      });
      setGoogleStatus(prev => prev ? { ...prev, folderId, folderName } : null);
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
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-emerald-100">
          <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-on-surface">Google Sheets Export</h3>
          <p className="text-sm text-slate-500">Export toàn bộ SMIT OS data ra Google Sheets</p>
        </div>
      </div>

      {/* Google Account Connection */}
      <div className="p-5 bg-slate-50 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-700">Google Account</p>
            {googleStatus?.connected ? (
              <p className="text-xs text-emerald-600">{googleStatus.email}</p>
            ) : (
              <p className="text-xs text-slate-500">Not connected</p>
            )}
          </div>
          {googleStatus?.connected ? (
            <button
              onClick={disconnectGoogle}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors"
            >
              <Unlink className="h-4 w-4" />
              Disconnect
            </button>
          ) : (
            <button
              onClick={connectGoogle}
              disabled={connecting}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:scale-[0.98] transition-all disabled:opacity-50"
            >
              {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
              Connect Google
            </button>
          )}
        </div>

        {/* Folder Selection */}
        {googleStatus?.connected && (
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <FolderOpen className="h-4 w-4 text-slate-500" />
              <p className="text-sm font-medium text-slate-700">Export Folder</p>
            </div>
            {loadingFolders ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            ) : (
              <select
                value={googleStatus.folderId || ''}
                onChange={(e) => {
                  const folder = folders.find(f => f.id === e.target.value);
                  if (folder) selectFolder(folder.id, folder.name);
                }}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Root (My Drive)</option>
                {folders.map(folder => (
                  <option key={folder.id} value={folder.id}>{folder.name}</option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-5 bg-slate-50 rounded-2xl">
          <p className="text-sm font-semibold text-slate-700 mb-1">Scheduled Export</p>
          <p className="text-xs text-slate-500 mb-3">Runs daily at 11:00 AM</p>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            googleStatus?.connected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
          }`}>
            {googleStatus?.connected ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="p-5 bg-slate-50 rounded-2xl">
          <p className="text-sm font-semibold text-slate-700 mb-1">Sheets Created</p>
          <p className="text-xs text-slate-500 mb-3">Per export</p>
          <span className="text-2xl font-bold text-primary">13</span>
        </div>
      </div>

      {/* Export Button */}
      <button
        onClick={triggerExport}
        disabled={!googleStatus?.connected || exporting}
        className="w-full flex items-center justify-center gap-2 h-12 bg-primary text-white rounded-xl font-bold text-sm hover:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {exporting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Export Now
          </>
        )}
      </button>

      {/* Export Status */}
      {exportStatus && (
        <div className={`p-5 rounded-2xl border ${
          exportStatus.status === 'completed'
            ? 'bg-emerald-50 border-emerald-200'
            : exportStatus.status === 'failed'
              ? 'bg-red-50 border-red-200'
              : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-start gap-3">
            {exportStatus.status === 'completed' ? (
              <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
            ) : exportStatus.status === 'failed' ? (
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            ) : (
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${
                exportStatus.status === 'completed' ? 'text-emerald-700' :
                exportStatus.status === 'failed' ? 'text-red-700' : 'text-blue-700'
              }`}>
                {exportStatus.status === 'completed' ? 'Export Completed' :
                 exportStatus.status === 'failed' ? 'Export Failed' : 'Exporting...'}
              </p>
              {exportStatus.spreadsheetUrl && (
                <a
                  href={exportStatus.spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline block mt-1"
                >
                  Open in Google Sheets →
                </a>
              )}
              {exportStatus.error && (
                <p className="text-xs text-red-600 mt-1">{exportStatus.error}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
