import crypto from 'node:crypto';
import { Router, Request, Response, NextFunction } from 'express';
import { GoogleOAuthService } from '../services/google-oauth.service';

const OAUTH_STATE_COOKIE = 'google_oauth_state';
const OAUTH_STATE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 10 * 60 * 1000,
};

/**
 * Public routes - mounted BEFORE auth middleware.
 * Only callback is public (Google redirects browser here).
 */
export function createGoogleOAuthPublicRoutes(googleOAuthService: GoogleOAuthService) {
  const router = Router();

  router.get('/callback', async (req: Request, res: Response) => {
    const { code, state } = req.query;
    const cookieState = req.cookies?.[OAUTH_STATE_COOKIE];

    if (!code || typeof code !== 'string') {
      return res.redirect('/settings?tab=export&error=' + encodeURIComponent('Missing authorization code'));
    }

    if (!state || typeof state !== 'string' || !cookieState || cookieState !== state) {
      res.clearCookie(OAUTH_STATE_COOKIE, OAUTH_STATE_COOKIE_OPTIONS);
      return res.redirect('/settings?tab=export&error=' + encodeURIComponent('Invalid OAuth state'));
    }

    try {
      await googleOAuthService.handleCallback(code);
      res.clearCookie(OAUTH_STATE_COOKIE, OAUTH_STATE_COOKIE_OPTIONS);
      res.redirect('/settings?tab=export&connected=true');
    } catch (error: any) {
      res.clearCookie(OAUTH_STATE_COOKIE, OAUTH_STATE_COOKIE_OPTIONS);
      console.error('[GoogleOAuth] Callback error:', error.message);
      res.redirect('/settings?tab=export&error=' + encodeURIComponent(error.message));
    }
  });

  return router;
}

/**
 * Protected admin routes - mounted AFTER auth middleware.
 */
export function createGoogleOAuthAdminRoutes(googleOAuthService: GoogleOAuthService) {
  const router = Router();

  const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  };

  router.use(requireAdmin);

  router.get('/auth', (_req: Request, res: Response) => {
    try {
      const state = crypto.randomUUID();
      const authUrl = googleOAuthService.getAuthUrl(state);
      res.cookie(OAUTH_STATE_COOKIE, state, OAUTH_STATE_COOKIE_OPTIONS);
      res.json({ authUrl });
    } catch (error: any) {
      console.error('[GoogleOAuth] Auth error:', error.message);
      res.status(500).json({ error: error.message || 'Failed to get auth URL' });
    }
  });

  router.get('/status', async (_req: Request, res: Response) => {
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

  router.delete('/disconnect', async (_req: Request, res: Response) => {
    try {
      await googleOAuthService.disconnect();
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/folders', async (_req: Request, res: Response) => {
    try {
      const folders = await googleOAuthService.listFolders();
      res.json({ folders });
    } catch (error: any) {
      console.error('[GoogleOAuth] Folders error:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/folder', async (req: Request, res: Response) => {
    const { folderId, folderName } = req.body;

    if (folderId && typeof folderId === 'string') {
      if (!/^[A-Za-z0-9_-]{10,}$/.test(folderId)) {
        return res.status(400).json({ error: 'Invalid folder ID format' });
      }
    }

    try {
      await googleOAuthService.setFolder(folderId || null, folderName || null);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}

/** @deprecated Use createGoogleOAuthPublicRoutes + createGoogleOAuthAdminRoutes instead */
export function createGoogleOAuthRoutes(googleOAuthService: GoogleOAuthService) {
  return createGoogleOAuthAdminRoutes(googleOAuthService);
}
