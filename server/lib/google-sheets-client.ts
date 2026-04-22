import { google, sheets_v4, drive_v3 } from 'googleapis';

export class GoogleSheetsClient {
  private sheets: sheets_v4.Sheets | null = null;
  private drive: drive_v3.Drive | null = null;
  private folderId: string = '';
  private initialized = false;

  private ensureInitialized(): void {
    if (this.initialized) return;

    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!email || !privateKey) {
      throw new Error('Google Sheets credentials not configured. Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY.');
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: email,
        private_key: privateKey.replace(/\\n/g, '\n'),
      },
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file',
      ],
    });

    this.sheets = google.sheets({ version: 'v4', auth });
    this.drive = google.drive({ version: 'v3', auth });
    this.folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '';
    this.initialized = true;
  }

  async createSpreadsheet(title: string): Promise<{ id: string; url: string }> {
    this.ensureInitialized();
    const response = await this.sheets!.spreadsheets.create({
      requestBody: { properties: { title } },
    });

    const spreadsheetId = response.data.spreadsheetId!;
    const url = response.data.spreadsheetUrl!;

    if (this.folderId) {
      await this.drive!.files.update({
        fileId: spreadsheetId,
        addParents: this.folderId,
        removeParents: 'root',
        fields: 'id, parents',
      });
    }

    return { id: spreadsheetId, url };
  }

  async addSheet(spreadsheetId: string, sheetName: string): Promise<number> {
    this.ensureInitialized();
    const response = await this.sheets!.spreadsheets.batchUpdate({
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
    this.ensureInitialized();
    const values = [headers, ...rows];
    await this.sheets!.spreadsheets.values.update({
      spreadsheetId,
      range: `'${sheetName}'!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });
  }

  async deleteDefaultSheet(spreadsheetId: string): Promise<void> {
    this.ensureInitialized();
    try {
      await this.sheets!.spreadsheets.batchUpdate({
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
