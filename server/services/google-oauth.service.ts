import { PrismaClient } from '@prisma/client';
import { google } from 'googleapis';
import { decryptIfEncrypted, encrypt } from '../lib/crypto';

const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
];

function isDev() {
  return process.env.NODE_ENV !== 'production';
}

function encryptToken(token: string | null | undefined): string | null {
  if (!token) {
    return null;
  }

  return encrypt(token);
}

function decryptToken(token: string | null | undefined): string | null {
  return decryptIfEncrypted(token);
}

function requireToken(token: string | null, name: string): string {
  if (!token) {
    throw new Error(`${name} is missing. Please reconnect Google account.`);
  }

  return token;
}

export function createGoogleOAuthService(prisma: PrismaClient) {
  const getOAuth2Client = () => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/google/callback';

    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth credentials not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env');
    }

    if (isDev()) {
      console.log('[GoogleOAuth] OAuth client configured', { redirectUri });
    }

    return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  };

  return {
    getAuthUrl(state: string): string {
      const oauth2Client = getOAuth2Client();
      return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent',
        state,
      });
    },

    async handleCallback(code: string) {
      const oauth2Client = getOAuth2Client();
      const { tokens } = await oauth2Client.getToken(code);

      if (!tokens.access_token || !tokens.refresh_token) {
        throw new Error('Failed to get tokens from Google');
      }

      oauth2Client.setCredentials(tokens);
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const { data } = await oauth2.userinfo.get();
      const email = data.email || 'unknown';

      return prisma.googleIntegration.upsert({
        where: { type: 'sheets_export' },
        create: {
          type: 'sheets_export',
          email,
          accessToken: encrypt(tokens.access_token),
          refreshToken: encrypt(tokens.refresh_token),
          expiresAt: new Date(tokens.expiry_date || Date.now() + 3600000),
        },
        update: {
          email,
          accessToken: encrypt(tokens.access_token),
          refreshToken: encrypt(tokens.refresh_token),
          expiresAt: new Date(tokens.expiry_date || Date.now() + 3600000),
        },
      });
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
      const accessToken = requireToken(decryptToken(integration.accessToken), 'Google access token');
      const refreshToken = requireToken(decryptToken(integration.refreshToken), 'Google refresh token');

      oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
        expiry_date: integration.expiresAt.getTime(),
      });

      if (integration.expiresAt < new Date()) {
        try {
          const { credentials } = await oauth2Client.refreshAccessToken();
          const nextAccessToken = requireToken(credentials.access_token ?? accessToken, 'Google access token');
          await prisma.googleIntegration.update({
            where: { type: 'sheets_export' },
            data: {
              accessToken: encrypt(nextAccessToken),
              refreshToken: encryptToken(credentials.refresh_token) ?? integration.refreshToken,
              expiresAt: new Date(credentials.expiry_date || Date.now() + 3600000),
            },
          });
          oauth2Client.setCredentials({
            ...credentials,
            access_token: nextAccessToken,
            refresh_token: credentials.refresh_token ?? refreshToken,
          });
        } catch (error: any) {
          console.error('[GoogleOAuth] Token refresh failed:', error.message);
          throw new Error('Failed to refresh token. Please reconnect Google account.');
        }
      }

      return oauth2Client;
    },

    async listFolders() {
      try {
        const auth = await this.getAuthenticatedClient();
        const drive = google.drive({ version: 'v3', auth });
        const response = await drive.files.list({
          q: "mimeType='application/vnd.google-apps.folder' and trashed=false",
          fields: 'files(id, name)',
          orderBy: 'name',
          pageSize: 100,
        });

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
