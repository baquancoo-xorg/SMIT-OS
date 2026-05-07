import { Router } from 'express';
import { z } from 'zod';
import { getLeadFlow } from '../services/dashboard/lead-flow.service';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD');

const querySchema = z.object({
  from: isoDate.optional(),
  to: isoDate.optional(),
});

function defaultRange() {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 29);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

function parseVnDateRange(fromRaw: string, toRaw: string) {
  const [fromY, fromM, fromD] = fromRaw.split('-').map(Number);
  const [toY, toM, toD] = toRaw.split('-').map(Number);

  // from: start of day in VN time (00:00:00 VN = 17:00:00 prev day UTC)
  const from = new Date(Date.UTC(fromY, fromM - 1, fromD, -7, 0, 0, 0));
  // to: end of day in VN time (23:59:59 VN = 16:59:59 UTC)
  const to = new Date(Date.UTC(toY, toM - 1, toD, 16, 59, 59, 999));
  return { from, to };
}

export function createDashboardLeadFlowRoutes() {
  const router = Router();

  router.get('/lead-flow', async (req, res) => {
    try {
      const parsed = querySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          data: null,
          error: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
          timestamp: new Date().toISOString(),
        });
      }

      const { from: fromRaw, to: toRaw } = parsed.data;
      const defaults = defaultRange();
      const { from, to } = parseVnDateRange(fromRaw ?? defaults.from, toRaw ?? defaults.to);
      const data = await getLeadFlow(from, to);

      return res.json({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('[dashboard/lead-flow]', err);
      return res.status(500).json({
        success: false,
        data: null,
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : (err as Error).message,
        timestamp: new Date().toISOString(),
      });
    }
  });

  return router;
}
