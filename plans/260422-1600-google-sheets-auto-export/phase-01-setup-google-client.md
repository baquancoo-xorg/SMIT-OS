# Phase 1: Setup & Google API Client

## Priority: High | Effort: Medium

## Overview

Setup googleapis package và tạo Google Sheets client wrapper với Service Account auth.

## Tasks

- [ ] Install `googleapis` package
- [ ] Create TypeScript types for sheets export
- [ ] Create Google Sheets client wrapper
- [ ] Add environment variables

## Files to Create

### 1. `server/types/sheets-export.types.ts`

```typescript
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
}

export interface ExportJobStatus {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  spreadsheetUrl?: string;
  error?: string;
  retryCount: number;
}
```

### 2. `server/lib/google-sheets-client.ts`

```typescript
import { google, sheets_v4, drive_v3 } from 'googleapis';

export class GoogleSheetsClient {
  private sheets: sheets_v4.Sheets;
  private drive: drive_v3.Drive;
  private folderId: string;

  constructor() {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file',
      ],
    });

    this.sheets = google.sheets({ version: 'v4', auth });
    this.drive = google.drive({ version: 'v3', auth });
    this.folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '';
  }

  async createSpreadsheet(title: string): Promise<{ id: string; url: string }> {
    // Create spreadsheet
    const response = await this.sheets.spreadsheets.create({
      requestBody: { properties: { title } },
    });

    const spreadsheetId = response.data.spreadsheetId!;
    const url = response.data.spreadsheetUrl!;

    // Move to folder
    if (this.folderId) {
      await this.drive.files.update({
        fileId: spreadsheetId,
        addParents: this.folderId,
        removeParents: 'root',
        fields: 'id, parents',
      });
    }

    return { id: spreadsheetId, url };
  }

  async addSheet(spreadsheetId: string, sheetName: string): Promise<number> {
    const response = await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title: sheetName } } }],
      },
    });
    return response.data.replies![0].addSheet!.properties!.sheetId!;
  }

  async writeData(
    spreadsheetId: string,
    sheetName: string,
    headers: string[],
    rows: (string | number | boolean | null)[][]
  ): Promise<void> {
    const values = [headers, ...rows];
    await this.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `'${sheetName}'!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });
  }

  async deleteDefaultSheet(spreadsheetId: string): Promise<void> {
    try {
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{ deleteSheet: { sheetId: 0 } }],
        },
      });
    } catch {
      // Ignore if default sheet already deleted
    }
  }
}
```

## Environment Variables

Add to `.env`:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=smitos-export@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=1abc123xyz
```

## Commands

```bash
npm install googleapis
```

## Validation

- [ ] GoogleSheetsClient instantiates without error
- [ ] Can create test spreadsheet
- [ ] File appears in correct Drive folder
