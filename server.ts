import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// Middleware
import { createAuthMiddleware } from "./server/middleware/auth.middleware";

// Routes
import { createAuthRoutes } from "./server/routes/auth.routes";
import { createUserRoutes } from "./server/routes/user.routes";
import { createObjectiveRoutes } from "./server/routes/objective.routes";
import { createKeyResultRoutes } from "./server/routes/key-result.routes";
import { createWorkItemRoutes } from "./server/routes/work-item.routes";
import { createSprintRoutes } from "./server/routes/sprint.routes";
import { createReportRoutes } from "./server/routes/report.routes";
import { createDailyReportRoutes } from "./server/routes/daily-report.routes";
import { createOkrCycleRoutes } from "./server/routes/okr-cycle.routes";
import { createDashboardOverviewRoutes } from "./server/routes/dashboard-overview.routes";
import { createFbSyncRoutes } from "./server/routes/fb-sync.routes";
import { createAdminFbConfigRoutes } from "./server/routes/admin-fb-config.routes";
import { createNotificationRoutes } from "./server/routes/notification.routes";
import { createLeadRoutes } from "./server/routes/lead.routes";
import { createSheetsExportRoutes } from "./server/routes/sheets-export.routes";
import { createGoogleOAuthRoutes } from "./server/routes/google-oauth.routes";
import { createGoogleOAuthService } from "./server/services/google-oauth.service";
import { startFbSyncScheduler } from "./server/services/facebook/fb-sync-scheduler.service";
import { createNotificationService } from "./server/services/notification.service";
import { initAlertScheduler } from "./server/jobs/alert-scheduler";
import { initSheetsExportScheduler } from "./server/jobs/sheets-export-scheduler";

const prisma = new PrismaClient();
const app = express();
const PORT = Number(process.env.PORT ?? 3000);

// Global middleware
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');
app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  }
}));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(cookieParser());

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

// Public routes
app.use("/api/auth", createAuthRoutes(prisma));

// Protected routes
app.use("/api", createAuthMiddleware(prisma));
app.use("/api/users", createUserRoutes(prisma));
app.use("/api/objectives", createObjectiveRoutes(prisma));
app.use("/api/key-results", createKeyResultRoutes(prisma));
app.use("/api/work-items", createWorkItemRoutes(prisma));
app.use("/api/sprints", createSprintRoutes(prisma));
app.use("/api/reports", createReportRoutes(prisma));
app.use("/api/daily-reports", createDailyReportRoutes(prisma));
app.use("/api/okr-cycles", createOkrCycleRoutes(prisma));
app.use("/api/notifications", createNotificationRoutes(prisma));
app.use("/api/leads", createLeadRoutes(prisma));
app.use("/api/dashboard/overview", createDashboardOverviewRoutes());
app.use("/api/sync/facebook-ads", createFbSyncRoutes());
app.use("/api/admin", createAdminFbConfigRoutes());

// Google OAuth & Sheets Export
const googleOAuthService = createGoogleOAuthService(prisma);
app.use("/api/google", createGoogleOAuthRoutes(googleOAuthService));

const sheetsExportService = initSheetsExportScheduler(prisma, googleOAuthService);
app.use("/api/sheets-export", createSheetsExportRoutes(sheetsExportService));

// OKRs recalculate endpoint (legacy path)
import { createOKRService } from "./server/services/okr.service";
const okrService = createOKRService(prisma);
app.post("/api/okrs/recalculate", async (_req, res) => {
  await okrService.recalculateObjectiveProgress();
  res.json({ success: true });
});

// Error handler
app.use((err: any, _req: any, res: any, _next: any) => {
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
    app.use(express.static(distPath));
    app.get("*all", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server: http://localhost:${PORT}`);
    startFbSyncScheduler();

    const notificationService = createNotificationService(prisma);
    initAlertScheduler(prisma, notificationService);
  });
}

startServer();
