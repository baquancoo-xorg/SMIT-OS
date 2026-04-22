import { PrismaClient } from '@prisma/client';
import { google } from 'googleapis';

const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive',  // Full drive access to list folders
];

export function createGoogleOAuthService(prisma: PrismaClient) {
  const getOAuth2Client = () => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/google/callback';

    console.log('[GoogleOAuth] Config:', {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      redirectUri
    });

    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth credentials not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env');
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

      console.log('[GoogleOAuth] Getting authenticated client, token expires:', integration.expiresAt);

      const oauth2Client = getOAuth2Client();
      oauth2Client.setCredentials({
        access_token: integration.accessToken,
        refresh_token: integration.refreshToken,
        expiry_date: integration.expiresAt.getTime(),
      });

      // Auto-refresh if expired
      if (integration.expiresAt < new Date()) {
        console.log('[GoogleOAuth] Token expired, refreshing...');
        try {
          const { credentials } = await oauth2Client.refreshAccessToken();
          await prisma.googleIntegration.update({
            where: { type: 'sheets_export' },
            data: {
              accessToken: credentials.access_token!,
              expiresAt: new Date(credentials.expiry_date || Date.now() + 3600000),
            },
          });
          oauth2Client.setCredentials(credentials);
          console.log('[GoogleOAuth] Token refreshed successfully');
        } catch (error: any) {
          console.error('[GoogleOAuth] Token refresh failed:', error.message);
          throw new Error('Failed to refresh token. Please reconnect Google account.');
        }
      }

      return oauth2Client;
    },

    async listFolders() {
      try {
        console.log('[GoogleOAuth] Listing folders...');
        const auth = await this.getAuthenticatedClient();
        const drive = google.drive({ version: 'v3', auth });

        const response = await drive.files.list({
          q: "mimeType='application/vnd.google-apps.folder' and trashed=false",
          fields: 'files(id, name)',
          orderBy: 'name',
          pageSize: 100,
        });

        console.log('[GoogleOAuth] Found', response.data.files?.length || 0, 'folders');
        return response.data.files || [];
      } catch (error: any) {
        console.error('[GoogleOAuth] listFolders error:', error.message);
        throw error;
      }
    },

    async setFolder(folderId: string | null, folderName: string | null) {
      return prisma.googleIntegration.update({
        where: { type: 'sheets_export' },
        data: { folderId, folderName },
      });
    },
  };
}

export type GoogleOAuthService = ReturnType<typeof createGoogleOAuthService>;
