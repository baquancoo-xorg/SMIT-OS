import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { prisma } from "./server/lib/prisma";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import type { Request, Response, NextFunction } from "express";

// Middleware
import { createAuthMiddleware } from "./server/middleware/auth.middleware";
import { createApiKeyAuthMiddleware } from "./server/middleware/api-key-auth";
import { createApiKeyAuditService } from "./server/services/api-key-audit.service";
import { perKeyRateLimiter } from "./server/middleware/per-key-rate-limit";

// Routes
import { createAuthRoutes } from "./server/routes/auth.routes";
import { createUserRoutes } from "./server/routes/user.routes";
import { createPersonnelMount } from "./server/routes/personnel";
import { createSkillsRoutes } from "./server/routes/skills.routes";
import { createObjectiveRoutes } from "./server/routes/objective.routes";
import { createKeyResultRoutes } from "./server/routes/key-result.routes";
import { createReportRoutes } from "./server/routes/report.routes";
import { createDailyReportRoutes } from "./server/routes/daily-report.routes";
import { createDailyReportCommentRoutes } from "./server/routes/daily-report-comment.routes";
import { createOkrCycleRoutes } from "./server/routes/okr-cycle.routes";
import { createDashboardCallPerformanceRoutes } from "./server/routes/dashboard-call-performance.routes";
import { createDashboardOverviewRoutes } from "./server/routes/dashboard-overview.routes";
import { createDashboardLeadFlowRoutes } from "./server/routes/dashboard-lead-flow.routes";
import { createDashboardLeadDistributionRoutes } from "./server/routes/dashboard-lead-distribution.routes";
import { createDashboardProductRoutes } from "./server/routes/dashboard-product.routes";
import { createFbSyncRoutes } from "./server/routes/fb-sync.routes";
import { createAdminFbConfigRoutes } from "./server/routes/admin-fb-config.routes";
import { createAdminApiKeysRoutes } from "./server/routes/admin-api-keys.routes";
import { createNotificationRoutes } from "./server/routes/notification.routes";
import { createLeadRoutes } from "./server/routes/lead.routes";
import { createLeadSyncRoutes } from "./server/routes/lead-sync.routes";
import { startFbSyncScheduler } from "./server/services/facebook/fb-sync-scheduler.service";
import { initFbSyncService } from "./server/services/facebook/fb-sync.service";
import { createNotificationService } from "./server/services/notification.service";
import { initAlertScheduler } from "./server/jobs/alert-scheduler";
import { initLeadSyncPrisma } from "./server/services/lead-sync/state";
import { startLeadSyncCron } from "./server/cron/lead-sync.cron";
import { startAdsSyncCron } from "./server/cron/ads-sync.cron";
import { startMediaSyncCron } from "./server/cron/media-sync.cron";
import { createAdsTrackerRoutes } from "./server/routes/ads-tracker.routes";
import { createMediaTrackerRoutes } from "./server/routes/media-tracker.routes";
import { createSocialChannelsRoutes } from "./server/routes/social-channels.routes";
import { createAcquisitionRoutes } from "./server/routes/acquisition.routes";
import { createOKRService } from "./server/services/okr.service";

initFbSyncService(prisma);
initLeadSyncPrisma(prisma);
const app = express();
app.set('etag', 'strong');
const PORT = Number(process.env.PORT ?? 3000);

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
}

// Global middleware
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');
const allowMissingOrigin = process.env.NODE_ENV !== 'production';
app.use(compression({
  threshold: 1024,
  level: 6,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
}));
app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    if ((!origin && allowMissingOrigin) || ALLOWED_ORIGINS.includes(origin ?? '')) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  }
}));
const isDev = process.env.NODE_ENV !== 'production';
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'"],
      'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
      'img-src': ["'self'", 'data:', 'https:'],
      'connect-src': ["'self'", ...(isDev ? ['ws://localhost:*', 'http://localhost:*'] : [])],
    },
    reportOnly: isDev,
  },
}));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts, try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/login/totp', authLimiter);
app.use('/api/auth/2fa/disable', authLimiter);
app.use('/api/auth/2fa/enable', authLimiter);
app.use('/api/users/me/password', authLimiter);

// General API rate limiter
const generalApiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.startsWith('/auth/'),
});
app.use('/api/', generalApiLimiter);

// Public routes
app.use("/api/auth", createAuthRoutes(prisma));

// Protected routes — API key auth runs first; JWT auth skips if api-key already set
const apiKeyAuditService = createApiKeyAuditService(prisma);
app.use("/api", createApiKeyAuthMiddleware(prisma, apiKeyAuditService));
app.use("/api", perKeyRateLimiter);
app.use("/api", createAuthMiddleware(prisma));
app.use("/api/users", createUserRoutes(prisma));
app.use("/api/personnel", createPersonnelMount(prisma));
app.use("/api/skills", createSkillsRoutes(prisma));
app.use("/api/objectives", createObjectiveRoutes(prisma));
app.use("/api/key-results", createKeyResultRoutes(prisma));
app.use("/api/reports", createReportRoutes(prisma));
app.use("/api/daily-reports", createDailyReportRoutes(prisma));
app.use("/api/daily-reports", createDailyReportCommentRoutes(prisma));
app.use("/api/okr-cycles", createOkrCycleRoutes(prisma));
app.use("/api/notifications", createNotificationRoutes(prisma));
app.use("/api/leads", createLeadRoutes(prisma));
app.use("/api/leads", createLeadSyncRoutes());
app.use("/api/dashboard/overview", createDashboardOverviewRoutes());
app.use("/api/dashboard", createDashboardCallPerformanceRoutes());
app.use("/api/dashboard", createDashboardLeadFlowRoutes());
app.use("/api/dashboard", createDashboardLeadDistributionRoutes());
app.use("/api/dashboard/product", createDashboardProductRoutes());
app.use("/api/sync/facebook-ads", createFbSyncRoutes());
app.use("/api/ads-tracker", createAdsTrackerRoutes());
app.use("/api/media-tracker", createMediaTrackerRoutes());
app.use("/api/social-channels", createSocialChannelsRoutes());
app.use("/api/acquisition", createAcquisitionRoutes());
app.use("/api/admin", requireAdmin, createAdminFbConfigRoutes());
app.use("/api/admin/api-keys", requireAdmin, createAdminApiKeysRoutes(prisma));

const okrService = createOKRService(prisma);
app.post("/api/okrs/recalculate", requireAdmin, async (_req, res) => {
  await okrService.recalculateObjectiveProgress();
  res.json({ success: true });
});

// Error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  const statusCode = typeof err?.status === 'number' ? err.status : 500;
  if (statusCode !== 500) {
    return res.status(statusCode).json({
      error: err?.message || "Request failed"
    });
  }

  console.error(err);
  const isDev = process.env.NODE_ENV !== 'production';
  res.status(500).json({
    error: "Internal server error",
    ...(isDev && { message: err.message, stack: err.stack })
  });
});

// Vite middleware & start
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    // Hashed assets (Vite emits content-hashed filenames) → cache 1 year immutable
    app.use('/assets', express.static(path.join(distPath, 'assets'), {
      immutable: true,
      maxAge: '1y',
    }));
    // index.html + other files → no long cache (must revalidate)
    app.use(express.static(distPath, {
      maxAge: '0',
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, must-revalidate');
        }
      },
    }));
    app.get("*all", (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server: http://localhost:${PORT}`);
    startFbSyncScheduler();

    const notificationService = createNotificationService(prisma);
    initAlertScheduler(prisma, notificationService);
    startLeadSyncCron();
    startAdsSyncCron();
    startMediaSyncCron();
  });
}

startServer();
