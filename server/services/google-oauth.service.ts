import { PrismaClient } from '@prisma/client';
import { google } from 'googleapis';

const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

export function createGoogleOAuthService(prisma: PrismaClient) {
  const getOAuth2Client = () => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/google/callback';

    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth credentials not configured');
    }

    return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  };

  return {
    getAuthUrl(): string {
      const oauth2Client = getOAuth2Client();
      return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent',
      });
    },

    async handleCallback(code: string) {
      const oauth2Client = getOAuth2Client();
      const { tokens } = await oauth2Client.getToken(code);

      if (!tokens.access_token || !tokens.refresh_token) {
        throw new Error('Failed to get tokens from Google');
      }

      oauth2Client.setCredentials(tokens);

      // Get user email
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const { data } = await oauth2.userinfo.get();
      const email = data.email || 'unknown';

      // Upsert integration
      const integration = await prisma.googleIntegration.upsert({
        where: { type: 'sheets_export' },
        create: {
          type: 'sheets_export',
          email,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: new Date(tokens.expiry_date || Date.now() + 3600000),
        },
        update: {
          email,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: new Date(tokens.expiry_date || Date.now() + 3600000),
        },
      });

      return integration;
    },

    async getIntegration() {
      return prisma.googleIntegration.findUnique({
        where: { type: 'sheets_export' },
      });
    },

    async disconnect() {
      await prisma.googleIntegration.deleteMany({
        where: { type: 'sheets_export' },
      });
    },

    async getAuthenticatedClient() {
      const integration = await this.getIntegration();
      if (!integration) {
        throw new Error('Google account not connected');
      }

      const oauth2Client = getOAuth2Client();
      oauth2Client.setCredentials({
        access_token: integration.accessToken,
        refresh_token: integration.refreshToken,
        expiry_date: integration.expiresAt.getTime(),
      });

      // Auto-refresh if expired
      if (integration.expiresAt < new Date()) {
        const { credentials } = await oauth2Client.refreshAccessToken();
        await prisma.googleIntegration.update({
          where: { type: 'sheets_export' },
          data: {
            accessToken: credentials.access_token!,
            expiresAt: new Date(credentials.expiry_date || Date.now() + 3600000),
          },
        });
        oauth2Client.setCredentials(credentials);
      }

      return oauth2Client;
    },

    async listFolders() {
      const auth = await this.getAuthenticatedClient();
      const drive = google.drive({ version: 'v3', auth });

      const response = await drive.files.list({
        q: "mimeType='application/vnd.google-apps.folder' and trashed=false",
        fields: 'files(id, name)',
        orderBy: 'name',
        pageSize: 100,
      });

      return response.data.files || [];
    },

    async setFolder(folderId: string, folderName: string) {
      return prisma.googleIntegration.update({
        where: { type: 'sheets_export' },
        data: { folderId, folderName },
      });
    },
  };
}

export type GoogleOAuthService = ReturnType<typeof createGoogleOAuthService>;
