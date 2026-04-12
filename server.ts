import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { PrismaClient } from "@prisma/client";
import cors from "cors";

const prisma = new PrismaClient();
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// --- API Routes ---

// Users
app.get("/api/users", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.post("/api/users", async (req, res) => {
  const user = await prisma.user.create({ data: req.body });
  res.json(user);
});

// Sprints
app.get("/api/sprints", async (req, res) => {
  const sprints = await prisma.sprint.findMany();
  res.json(sprints);
});

app.post("/api/sprints", async (req, res) => {
  const sprint = await prisma.sprint.create({
    data: {
      ...req.body,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
    },
  });
  res.json(sprint);
});

// Objectives & Key Results
app.get("/api/objectives", async (req, res) => {
  const objectives = await prisma.objective.findMany({
    include: { keyResults: true },
  });
  res.json(objectives);
});

app.post("/api/objectives", async (req, res) => {
  const objective = await prisma.objective.create({
    data: {
      ...req.body,
      keyResults: {
        create: req.body.keyResults || [],
      },
    },
    include: { keyResults: true },
  });
  res.json(objective);
});

app.put("/api/objectives/:id", async (req, res) => {
  const { id } = req.params;
  const objective = await prisma.objective.update({
    where: { id },
    data: req.body,
  });
  res.json(objective);
});

app.delete("/api/objectives/:id", async (req, res) => {
  await prisma.objective.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

// Work Items
app.get("/api/work-items", async (req, res) => {
  const items = await prisma.workItem.findMany({
    include: { assignee: true, sprint: true },
  });
  res.json(items);
});

app.post("/api/work-items", async (req, res) => {
  const item = await prisma.workItem.create({
    data: req.body,
    include: { assignee: true, sprint: true },
  });
  res.json(item);
});

app.put("/api/work-items/:id", async (req, res) => {
  const item = await prisma.workItem.update({
    where: { id: req.params.id },
    data: req.body,
    include: { assignee: true, sprint: true },
  });
  res.json(item);
});

app.delete("/api/work-items/:id", async (req, res) => {
  await prisma.workItem.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

// Reports
app.get("/api/reports", async (req, res) => {
  const reports = await prisma.weeklyReport.findMany({
    include: { user: true },
  });
  res.json(reports);
});

app.post("/api/reports", async (req, res) => {
  const report = await prisma.weeklyReport.create({
    data: {
      ...req.body,
      weekEnding: new Date(req.body.weekEnding),
    },
    include: { user: true },
  });
  res.json(report);
});

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
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
