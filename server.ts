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
      }
    },
  });
  res.json(objectives);
}));

app.post("/api/objectives", handleAsync(async (req: any, res: any) => {
  const { keyResults, ...objectiveData } = req.body;
  const objective = await prisma.objective.create({
    data: {
      ...objectiveData,
      keyResults: {
        create: keyResults || [],
      },
    },
    include: { keyResults: true },
  });
  res.json(objective);
}));

app.put("/api/objectives/:id", handleAsync(async (req: any, res: any) => {
  const { id } = req.params;
  const { keyResults, ...objectiveData } = req.body;
  const objective = await prisma.objective.update({
    where: { id },
    data: objectiveData,
    include: { keyResults: true },
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
  res.json(items);
}));

app.get("/api/work-items/:id", handleAsync(async (req: any, res: any) => {
  const item = await prisma.workItem.findUnique({
    where: { id: req.params.id },
    include: { assignee: true, sprint: true },
  });
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
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
    include: { user: true },
  });
  res.json(reports);
}));

app.get("/api/reports/:id", handleAsync(async (req: any, res: any) => {
  const report = await prisma.weeklyReport.findUnique({
    where: { id: req.params.id },
    include: { user: true },
  });
  if (!report) return res.status(404).json({ error: "Not found" });
  res.json(report);
}));

app.post("/api/reports", handleAsync(async (req: any, res: any) => {
  const report = await prisma.weeklyReport.create({
    data: {
      ...req.body,
      weekEnding: new Date(req.body.weekEnding),
    },
    include: { user: true },
  });
  res.json(report);
}));

app.put("/api/reports/:id", handleAsync(async (req: any, res: any) => {
  const data: any = { ...req.body };
  if (data.weekEnding) data.weekEnding = new Date(data.weekEnding);
  const report = await prisma.weeklyReport.update({
    where: { id: req.params.id },
    data,
    include: { user: true },
  });
  res.json(report);
}));

app.delete("/api/reports/:id", handleAsync(async (req: any, res: any) => {
  await prisma.weeklyReport.delete({ where: { id: req.params.id } });
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
