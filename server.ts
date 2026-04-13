import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const app = express();
const PORT = 3005;

app.use(cors());
app.use(express.json());

// Helper for error handling
const handleAsync = (fn: Function) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error", message: err.message });
});

// --- API Routes ---

// Login
app.post("/api/login", handleAsync(async (req: any, res: any) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const user = await prisma.user.findUnique({ where: { username } });

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Don't send password in response
  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
}));

// Users
app.get("/api/users", handleAsync(async (req: any, res: any) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      fullName: true,
      username: true,
      department: true,
      role: true,
      scope: true,
      avatar: true,
      isAdmin: true,
    }
  });
  res.json(users);
}));

app.post("/api/users", handleAsync(async (req: any, res: any) => {
  const { password, isAdmin = false, ...userData } = req.body;

  // Hash password if provided, otherwise use default
  const hashedPassword = password
    ? await bcrypt.hash(password, 10)
    : await bcrypt.hash('123456', 10);

  const user = await prisma.user.create({
    data: {
      ...userData,
      password: hashedPassword,
      isAdmin,
    },
    select: {
      id: true,
      fullName: true,
      username: true,
      department: true,
      role: true,
      scope: true,
      avatar: true,
      isAdmin: true,
    }
  });
  res.json(user);
}));

app.put("/api/users/:id", handleAsync(async (req: any, res: any) => {
  const { id } = req.params;
  const { password, ...userData } = req.body;

  const data: any = { ...userData };

  // Hash new password if provided
  if (password) {
    data.password = await bcrypt.hash(password, 10);
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      fullName: true,
      username: true,
      department: true,
      role: true,
      scope: true,
      avatar: true,
      isAdmin: true,
    }
  });
  res.json(user);
}));

app.delete("/api/users/:id", handleAsync(async (req: any, res: any) => {
  const { id } = req.params;

  // Prevent deleting the last admin
  const userToDelete = await prisma.user.findUnique({ where: { id } });
  if (userToDelete?.isAdmin) {
    const adminCount = await prisma.user.count({ where: { isAdmin: true } });
    if (adminCount <= 1) {
      return res.status(400).json({ error: "Cannot delete the last admin user" });
    }
  }

  await prisma.user.delete({ where: { id } });
  res.status(204).send();
}));

// Sprints
app.get("/api/sprints", handleAsync(async (req: any, res: any) => {
  const sprints = await prisma.sprint.findMany();
  res.json(sprints);
}));

app.post("/api/sprints", handleAsync(async (req: any, res: any) => {
  const sprint = await prisma.sprint.create({
    data: {
      ...req.body,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
    },
  });
  res.json(sprint);
}));

app.put("/api/sprints/:id", handleAsync(async (req: any, res: any) => {
  const { id } = req.params;
  const data: any = { ...req.body };
  if (data.startDate) data.startDate = new Date(data.startDate);
  if (data.endDate) data.endDate = new Date(data.endDate);

  const sprint = await prisma.sprint.update({
    where: { id },
    data,
  });
  res.json(sprint);
}));

app.delete("/api/sprints/:id", handleAsync(async (req: any, res: any) => {
  const { id } = req.params;
  await prisma.sprint.delete({ where: { id } });
  res.status(204).send();
}));

// Objectives & Key Results
app.get("/api/objectives", handleAsync(async (req: any, res: any) => {
  const objectives = await prisma.objective.findMany({
    include: {
      keyResults: true,
      owner: {
        select: {
          id: true,
          fullName: true,
          username: true,
          avatar: true,
          department: true,
        }
      },
      parent: true,
      children: {
        include: {
          keyResults: true,
          owner: {
            select: {
              id: true,
              fullName: true,
              username: true,
              avatar: true,
              department: true,
            }
          }
        }
      }
    },
  });
  res.json(objectives);
}));

app.post("/api/objectives", handleAsync(async (req: any, res: any) => {
  const { keyResults, children, ...objectiveData } = req.body;
  const objective = await prisma.objective.create({
    data: {
      ...objectiveData,
      keyResults: {
        create: keyResults || [],
      },
    },
    include: {
      keyResults: true,
      parent: true,
      children: true,
    },
  });
  res.json(objective);
}));

app.put("/api/objectives/:id", handleAsync(async (req: any, res: any) => {
  const { id } = req.params;
  const { keyResults, children, ...objectiveData } = req.body;
  const objective = await prisma.objective.update({
    where: { id },
    data: objectiveData,
    include: {
      keyResults: true,
      parent: true,
      children: {
        include: {
          keyResults: true,
          owner: {
            select: {
              id: true,
              fullName: true,
              username: true,
              avatar: true,
              department: true,
            }
          }
        }
      }
    },
  });
  res.json(objective);
}));

app.delete("/api/objectives/:id", handleAsync(async (req: any, res: any) => {
  await prisma.objective.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));

// Key Results
app.get("/api/key-results", handleAsync(async (req: any, res: any) => {
  const keyResults = await prisma.keyResult.findMany({
    include: { objective: true },
  });
  res.json(keyResults);
}));

app.post("/api/key-results", handleAsync(async (req: any, res: any) => {
  const keyResult = await prisma.keyResult.create({
    data: req.body,
    include: { objective: true },
  });
  res.json(keyResult);
}));

app.put("/api/key-results/:id", handleAsync(async (req: any, res: any) => {
  const keyResult = await prisma.keyResult.update({
    where: { id: req.params.id },
    data: req.body,
    include: { objective: true },
  });
  res.json(keyResult);
}));

app.delete("/api/key-results/:id", handleAsync(async (req: any, res: any) => {
  await prisma.keyResult.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));

// Work Items
app.get("/api/work-items", handleAsync(async (req: any, res: any) => {
  const items = await prisma.workItem.findMany({
    include: { assignee: true, sprint: true },
  });
  // Add linkedKrId to response for compatibility with frontend
  const itemsWithKr = items.map((item: any) => ({
    ...item,
    linkedKrId: item.linkedKrId || null,
  }));
  res.json(itemsWithKr);
}));

app.get("/api/work-items/:id", handleAsync(async (req: any, res: any) => {
  const item = await prisma.workItem.findUnique({
    where: { id: req.params.id },
    include: { assignee: true, sprint: true },
  });
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json({ ...item, linkedKrId: item.linkedKrId || null });
}));

app.post("/api/work-items", handleAsync(async (req: any, res: any) => {
  const item = await prisma.workItem.create({
    data: req.body,
    include: { assignee: true, sprint: true },
  });
  res.json(item);
}));

app.put("/api/work-items/:id", handleAsync(async (req: any, res: any) => {
  const item = await prisma.workItem.update({
    where: { id: req.params.id },
    data: req.body,
    include: { assignee: true, sprint: true },
  });
  res.json(item);
}));

app.delete("/api/work-items/:id", handleAsync(async (req: any, res: any) => {
  await prisma.workItem.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));

// Reports
app.get("/api/reports", handleAsync(async (req: any, res: any) => {
  const reports = await prisma.weeklyReport.findMany({
    include: {
      user: true,
      approver: { select: { id: true, fullName: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
  res.json(reports);
}));

app.get("/api/reports/:id", handleAsync(async (req: any, res: any) => {
  const report = await prisma.weeklyReport.findUnique({
    where: { id: req.params.id },
    include: {
      user: true,
      approver: { select: { id: true, fullName: true } }
    },
  });
  if (!report) return res.status(404).json({ error: "Not found" });
  res.json(report);
}));

app.post("/api/reports", handleAsync(async (req: any, res: any) => {
  const report = await prisma.weeklyReport.create({
    data: {
      ...req.body,
      weekEnding: new Date(req.body.weekEnding),
      status: 'Review'
    },
    include: { user: true },
  });
  res.json(report);
}));

app.put("/api/reports/:id", handleAsync(async (req: any, res: any) => {
  const { id } = req.params;
  const { currentUserId, currentUserRole, ...updateData } = req.body;

  const report = await prisma.weeklyReport.findUnique({ where: { id } });
  if (!report) return res.status(404).json({ error: "Not found" });

  // Only allow edit when status = Review
  if (report.status === 'Approved') {
    return res.status(400).json({ error: "Cannot edit approved report" });
  }

  const data: any = { ...updateData };
  if (data.weekEnding) data.weekEnding = new Date(data.weekEnding);

  const updated = await prisma.weeklyReport.update({
    where: { id },
    data,
    include: { user: true },
  });
  res.json(updated);
}));

app.post("/api/reports/:id/approve", handleAsync(async (req: any, res: any) => {
  const { id } = req.params;
  const { approverId } = req.body;

  const approver = await prisma.user.findUnique({ where: { id: approverId } });
  if (!approver?.isAdmin) {
    return res.status(403).json({ error: "Only Admin can approve" });
  }

  const report = await prisma.weeklyReport.update({
    where: { id },
    data: {
      status: 'Approved',
      approvedBy: approverId,
      approvedAt: new Date()
    },
    include: { user: true }
  });

  // Sync OKR progress if krProgress data exists
  if (report.krProgress) {
    await syncOKRProgress(report);
  }

  res.json(report);
}));

app.delete("/api/reports/:id", handleAsync(async (req: any, res: any) => {
  await prisma.weeklyReport.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));

// OKR Sync helper functions
async function syncOKRProgress(report: any) {
  if (!report.krProgress) return;

  const krProgressData = JSON.parse(report.krProgress);

  for (const kr of krProgressData) {
    const keyResult = await prisma.keyResult.findUnique({
      where: { id: kr.krId },
      include: { objective: true }
    });

    if (!keyResult) continue;

    let progressPct = kr.progressPct;
    if (kr.currentValue !== undefined && keyResult.targetValue > 0) {
      progressPct = (kr.currentValue / keyResult.targetValue) * 100;
    }

    await prisma.keyResult.update({
      where: { id: kr.krId },
      data: {
        currentValue: kr.currentValue ?? keyResult.currentValue,
        progressPercentage: Math.min(progressPct, 100)
      }
    });
  }

  await recalculateObjectiveProgress();
}

async function recalculateObjectiveProgress() {
  const objectives = await prisma.objective.findMany({
    include: {
      keyResults: true,
      children: { include: { keyResults: true } }
    }
  });

  for (const obj of objectives) {
    let progress = 0;

    if (obj.parentId) {
      // L2 Objective: average of KRs
      if (obj.keyResults.length > 0) {
        progress = obj.keyResults.reduce((sum, kr) => sum + kr.progressPercentage, 0) / obj.keyResults.length;
      }
    } else {
      // L1 Objective: average of L2 children
      if (obj.children.length > 0) {
        const childProgress = obj.children.map(child => {
          if (child.keyResults.length === 0) return 0;
          return child.keyResults.reduce((sum, kr) => sum + kr.progressPercentage, 0) / child.keyResults.length;
        });
        progress = childProgress.reduce((a, b) => a + b, 0) / obj.children.length;
      }
    }

    await prisma.objective.update({
      where: { id: obj.id },
      data: { progressPercentage: Math.round(progress * 100) / 100 }
    });
  }
}

app.post("/api/okrs/recalculate", handleAsync(async (req: any, res: any) => {
  await recalculateObjectiveProgress();
  res.json({ success: true });
}));

// Daily Reports
app.get("/api/daily-reports", handleAsync(async (req: any, res: any) => {
  const { userId, userRole, userDepartment } = req.query;

  let where: any = {};

  if (userRole === 'Member') {
    where.userId = userId;
  } else if (userRole?.includes('Leader')) {
    where.OR = [
      { userId },
      { user: { department: userDepartment } }
    ];
  }

  const reports = await prisma.dailyReport.findMany({
    where,
    include: {
      user: { select: { id: true, fullName: true, department: true, role: true, avatar: true } },
      approver: { select: { id: true, fullName: true } }
    },
    orderBy: { reportDate: 'desc' }
  });
  res.json(reports);
}));

app.get("/api/daily-reports/:id", handleAsync(async (req: any, res: any) => {
  const report = await prisma.dailyReport.findUnique({
    where: { id: req.params.id },
    include: {
      user: { select: { id: true, fullName: true, department: true, role: true, avatar: true } },
      approver: { select: { id: true, fullName: true } }
    }
  });
  if (!report) return res.status(404).json({ error: "Not found" });
  res.json(report);
}));

app.post("/api/daily-reports", handleAsync(async (req: any, res: any) => {
  const { userId, reportDate, tasksData, blockers, impactLevel } = req.body;

  const existing = await prisma.dailyReport.findFirst({
    where: {
      userId,
      reportDate: new Date(reportDate)
    }
  });

  if (existing) {
    return res.status(400).json({ error: "Report for this date already exists" });
  }

  const report = await prisma.dailyReport.create({
    data: {
      userId,
      reportDate: new Date(reportDate),
      tasksData: typeof tasksData === 'string' ? tasksData : JSON.stringify(tasksData),
      blockers,
      impactLevel,
      status: 'Review'
    },
    include: { user: true }
  });
  res.json(report);
}));

app.put("/api/daily-reports/:id", handleAsync(async (req: any, res: any) => {
  const { id } = req.params;
  const { currentUserId, tasksData, ...updateData } = req.body;

  // Verify user from database (security fix)
  const currentUser = await prisma.user.findUnique({ where: { id: currentUserId } });
  if (!currentUser) return res.status(401).json({ error: "Unauthorized" });

  const report = await prisma.dailyReport.findUnique({
    where: { id },
    include: { user: true }
  });

  if (!report) return res.status(404).json({ error: "Not found" });

  if (report.status === 'Approved') {
    return res.status(400).json({ error: "Cannot edit approved report" });
  }

  const isOwner = report.userId === currentUserId;
  const isLeaderOfUser = currentUser.role?.includes('Leader') && report.user.role === 'Member';
  const isAdmin = currentUser.isAdmin;

  if (!isOwner && !isLeaderOfUser && !isAdmin) {
    return res.status(403).json({ error: "Not authorized" });
  }

  const updated = await prisma.dailyReport.update({
    where: { id },
    data: {
      ...updateData,
      tasksData: tasksData ? (typeof tasksData === 'string' ? tasksData : JSON.stringify(tasksData)) : undefined,
      updatedAt: new Date()
    },
    include: { user: true }
  });
  res.json(updated);
}));

app.post("/api/daily-reports/:id/approve", handleAsync(async (req: any, res: any) => {
  const { id } = req.params;
  const { approverId } = req.body;

  // Verify approver from database (security fix)
  const approver = await prisma.user.findUnique({ where: { id: approverId } });
  if (!approver) return res.status(401).json({ error: "Unauthorized" });

  const report = await prisma.dailyReport.findUnique({
    where: { id },
    include: { user: true }
  });

  if (!report) return res.status(404).json({ error: "Not found" });

  const isLeaderApprovesMember = approver.role?.includes('Leader') && report.user.role === 'Member';
  const isAdmin = approver.isAdmin;

  if (!isLeaderApprovesMember && !isAdmin) {
    return res.status(403).json({ error: "Not authorized to approve" });
  }

  const updated = await prisma.dailyReport.update({
    where: { id },
    data: {
      status: 'Approved',
      approvedBy: approverId,
      approvedAt: new Date()
    },
    include: { user: true }
  });
  res.json(updated);
}));

app.delete("/api/daily-reports/:id", handleAsync(async (req: any, res: any) => {
  await prisma.dailyReport.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));

// --- Vite Middleware ---

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
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
