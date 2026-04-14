import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import cookieParser from "cookie-parser";

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

const prisma = new PrismaClient();
const app = express();
const PORT = 3005;

// Global middleware
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(cookieParser());

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
  res.status(500).json({ error: "Internal server error", message: err.message });
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

  app.listen(PORT, "0.0.0.0", () => console.log(`Server: http://localhost:${PORT}`));
}

startServer();
