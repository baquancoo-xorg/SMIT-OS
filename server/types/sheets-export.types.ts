export interface SheetData {
  sheetName: string;
  headers: string[];
  rows: (string | number | boolean | null)[][];
}

export interface ExportResult {
  success: boolean;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  error?: string;
  sheetsCreated: number;
  exportDate?: string;
  reusedExisting?: boolean;
}

export interface ExportJobStatus {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  spreadsheetUrl?: string;
  error?: string;
  retryCount: number;
  exportDate?: string;
}
