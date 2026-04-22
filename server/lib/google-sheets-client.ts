import { google, sheets_v4, drive_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export class GoogleSheetsClient {
  private sheets: sheets_v4.Sheets;
  private drive: drive_v3.Drive;
  private folderId?: string;

  constructor(authClient: OAuth2Client, folderId?: string) {
    this.sheets = google.sheets({ version: 'v4', auth: authClient });
    this.drive = google.drive({ version: 'v3', auth: authClient });
    this.folderId = folderId;
  }

  async createSpreadsheet(title: string): Promise<{ id: string; url: string }> {
    const response = await this.sheets.spreadsheets.create({
      requestBody: { properties: { title } },
    });

    const spreadsheetId = response.data.spreadsheetId!;
    const url = response.data.spreadsheetUrl!;

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
