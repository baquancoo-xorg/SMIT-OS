import { Router, Request, Response } from 'express';
import { GoogleOAuthService } from '../services/google-oauth.service';

export function createGoogleOAuthRoutes(googleOAuthService: GoogleOAuthService) {
  const router = Router();

  // PUBLIC: OAuth callback (Google redirects here, no auth cookie)
  router.get('/callback', async (req: Request, res: Response) => {
    const { code } = req.query;
    if (!code || typeof code !== 'string') {
      return res.status(400).send('Missing authorization code');
    }

    try {
      await googleOAuthService.handleCallback(code);
      res.redirect('/settings?tab=export&connected=true');
    } catch (error: any) {
      console.error('[GoogleOAuth] Callback error:', error);
      res.redirect('/settings?tab=export&error=' + encodeURIComponent(error.message));
    }
  });

  // All routes below require admin auth
  const requireAdmin = (req: Request, res: Response, next: Function) => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  };

  router.get('/auth', requireAdmin, (req: Request, res: Response) => {
    try {
      console.log('[GoogleOAuth] Getting auth URL...');
      const authUrl = googleOAuthService.getAuthUrl();
      console.log('[GoogleOAuth] Auth URL generated successfully');
      res.json({ authUrl });
    } catch (error: any) {
      console.error('[GoogleOAuth] Auth error:', error.message, error.stack);
      res.status(500).json({ error: error.message || 'Failed to get auth URL' });
    }
  });

  router.get('/status', requireAdmin, async (req: Request, res: Response) => {
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

  router.delete('/disconnect', requireAdmin, async (req: Request, res: Response) => {
    try {
      await googleOAuthService.disconnect();
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/folders', requireAdmin, async (req: Request, res: Response) => {
    try {
      const folders = await googleOAuthService.listFolders();
      res.json({ folders });
    } catch (error: any) {
      console.error('[GoogleOAuth] Folders error:', error.message, error.response?.data || '');
      res.status(500).json({ error: error.message, details: error.response?.data?.error?.message });
    }
  });

  router.post('/folder', requireAdmin, async (req: Request, res: Response) => {
    const { folderId, folderName } = req.body;

    try {
      await googleOAuthService.setFolder(folderId || null, folderName || null);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
