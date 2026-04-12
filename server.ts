import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { createServer as createViteServer } from 'vite';
import path from 'path';

const prisma = new PrismaClient();

async function startServer() {
  const app = express();
  
  // Use port 3000 for AI Studio preview, or 3002 for local backend as per rules
  const PORT = process.env.PORT || 3002;
  const isAIStudio = process.env.PORT === '3000' || !process.env.PORT; // Default to 3000 in AI Studio if PORT isn't strictly set but we need it to work

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'SMIT OS Backend is running' });
  });

  app.get('/api/users', async (req, res) => {
    try {
      const users = await prisma.user.findMany();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  app.get('/api/work-items', async (req, res) => {
    try {
      const items = await prisma.workItem.findMany({
        include: { assignee: true, subtasks: true }
      });
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch work items' });
    }
  });

  app.get('/api/objectives', async (req, res) => {
    try {
      const objectives = await prisma.objective.findMany({
        include: { keyResults: { include: { subKeyResults: true } } }
      });
      res.json(objectives);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch objectives' });
    }
  });

  // Vite middleware for development in AI Studio (Port 3000)
  // If running locally as pure backend on 3002, we skip this.
  if (PORT === 3000 || PORT === '3000') {
    if (process.env.NODE_ENV !== 'production') {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(console.error);
