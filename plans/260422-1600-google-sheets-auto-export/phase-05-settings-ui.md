# Phase 5: Settings UI

## Priority: Medium | Effort: Small

## Overview

Add Google Sheets Export section to Settings page with "Export Now" button.

## Files to Create/Update

### 1. Create `src/components/settings/GoogleSheetsExport.tsx`

```tsx
import { useState } from 'react';
import { FileSpreadsheet, Download, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ExportStatus {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  spreadsheetUrl?: string;
  error?: string;
  retryCount: number;
}

export default function GoogleSheetsExport() {
  const { currentUser } = useAuth();
  const [status, setStatus] = useState<ExportStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);

  const isAdmin = currentUser?.isAdmin;

  const triggerExport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sheets-export/trigger', { method: 'POST' });
      const data = await res.json();
      
      if (res.ok) {
        setStatus(data.status);
        startPolling();
      } else {
        setStatus({ ...data.status, error: data.error });
      }
    } catch (error) {
      console.error('Failed to trigger export:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/sheets-export/status');
      const data = await res.json();
      setStatus(data.status);
      return data.status;
    } catch (error) {
      console.error('Failed to check status:', error);
      return null;
    }
  };

  const startPolling = () => {
    setPolling(true);
    const interval = setInterval(async () => {
      const currentStatus = await checkStatus();
      if (currentStatus?.status === 'completed' || currentStatus?.status === 'failed') {
        clearInterval(interval);
        setPolling(false);
      }
    }, 3000);
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="bg-white/50 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-emerald-100">
          <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-on-surface">Google Sheets Export</h3>
          <p className="text-sm text-slate-500">Export SMIT OS data to Google Sheets</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
          <div>
            <p className="text-sm font-medium text-slate-700">Scheduled Export</p>
            <p className="text-xs text-slate-500">Runs daily at 11:00 AM</p>
          </div>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
            Active
          </span>
        </div>

        <button
          onClick={triggerExport}
          disabled={loading || polling}
          className="w-full flex items-center justify-center gap-2 h-12 bg-primary text-white rounded-xl font-bold text-sm hover:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading || polling ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {polling ? 'Exporting...' : 'Starting...'}
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Export Now
            </>
          )}
        </button>

        {status && (
          <div className={`p-4 rounded-xl border ${
            status.status === 'completed' 
              ? 'bg-emerald-50 border-emerald-200' 
              : status.status === 'failed'
                ? 'bg-red-50 border-red-200'
                : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-start gap-3">
              {status.status === 'completed' ? (
                <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : status.status === 'failed' ? (
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              ) : (
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${
                  status.status === 'completed' ? 'text-emerald-700' :
                  status.status === 'failed' ? 'text-red-700' : 'text-blue-700'
                }`}>
                  {status.status === 'completed' ? 'Export Completed' :
                   status.status === 'failed' ? 'Export Failed' : 'Export Running'}
                </p>
                {status.spreadsheetUrl && (
                  <a 
                    href={status.spreadsheetUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline truncate block"
                  >
                    Open in Google Sheets →
                  </a>
                )}
                {status.error && (
                  <p className="text-xs text-red-600 mt-1">{status.error}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

### 2. Update `src/pages/Settings.tsx`

Add import and component:

```tsx
import GoogleSheetsExport from '../components/settings/GoogleSheetsExport';

// In the settings page layout, add:
<GoogleSheetsExport />
```

## Tasks

- [ ] Create GoogleSheetsExport.tsx component
- [ ] Add to Settings.tsx page
- [ ] Implement polling for export status
- [ ] Show export result with link to spreadsheet

## Validation

- [ ] "Export Now" button visible only for admins
- [ ] Button triggers export and shows loading state
- [ ] Status updates via polling
- [ ] Success shows link to Google Sheet
- [ ] Failure shows error message
