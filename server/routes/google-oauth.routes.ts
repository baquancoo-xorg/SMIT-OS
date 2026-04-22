import { Router, Request, Response } from 'express';
import { GoogleOAuthService } from '../services/google-oauth.service';

export function createGoogleOAuthRoutes(googleOAuthService: GoogleOAuthService) {
  const router = Router();

  // Admin-only check
  router.use((req: Request, res: Response, next) => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });

  // GET /api/google/auth - Start OAuth flow
  router.get('/auth', (req: Request, res: Response) => {
    try {
      const authUrl = googleOAuthService.getAuthUrl();
      res.json({ authUrl });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/google/callback - OAuth callback
  router.get('/callback', async (req: Request, res: Response) => {
    const { code } = req.query;
    if (!code || typeof code !== 'string') {
      return res.status(400).send('Missing authorization code');
    }

    try {
      await googleOAuthService.handleCallback(code);
      // Redirect to settings page
      res.redirect('/settings?tab=export&connected=true');
    } catch (error: any) {
      console.error('[GoogleOAuth] Callback error:', error);
      res.redirect('/settings?tab=export&error=' + encodeURIComponent(error.message));
    }
  });

  // GET /api/google/status - Get connection status
  router.get('/status', async (req: Request, res: Response) => {
    try {
      const integration = await googleOAuthService.getIntegration();
      if (!integration) {
        return res.json({ connected: false });
      }
      res.json({
        connected: true,
        email: integration.email,
        folderId: integration.folderId,
        folderName: integration.folderName,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/google/disconnect - Disconnect Google account
  router.delete('/disconnect', async (req: Request, res: Response) => {
    try {
      await googleOAuthService.disconnect();
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/google/folders - List Drive folders
  router.get('/folders', async (req: Request, res: Response) => {
    try {
      const folders = await googleOAuthService.listFolders();
      res.json({ folders });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/google/folder - Set export folder
  router.post('/folder', async (req: Request, res: Response) => {
    const { folderId, folderName } = req.body;
    if (!folderId || !folderName) {
      return res.status(400).json({ error: 'folderId and folderName required' });
    }

    try {
      await googleOAuthService.setFolder(folderId, folderName);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
