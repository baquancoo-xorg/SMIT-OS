/**
 * Acquisition aggregation API.
 *  GET /api/acquisition/journey?from=&to=
 *
 * Surfaced on Dashboard Overview tab (Phase 5 redesign).
 */
import { Router } from 'express';
import { getJourneyFunnel } from '../services/acquisition/journey-funnel.service';

function ok(data: unknown) {
  return { success: true, data, timestamp: new Date().toISOString() };
}
function fail(status: number, error: string) {
  return { status, body: { success: false, data: null, error, timestamp: new Date().toISOString() } };
}

export function createAcquisitionRoutes() {
  const router = Router();

  router.get('/journey', async (req, res) => {
    try {
      const fromParam = req.query.from ? String(req.query.from) : undefined;
      const toParam = req.query.to ? String(req.query.to) : undefined;
      if (!fromParam || !toParam) {
        const e = fail(400, 'from and to query params are required');
        return res.status(e.status).json(e.body);
      }
      const from = new Date(fromParam);
      const to = new Date(toParam);
      if (isNaN(from.getTime()) || isNaN(to.getTime())) {
        const e = fail(400, 'Invalid date');
        return res.status(e.status).json(e.body);
      }
      const journey = await getJourneyFunnel(from, to);
      res.json(ok(journey));
    } catch (err) {
      const e = fail(500, (err as Error).message);
      res.status(e.status).json(e.body);
    }
  });

  return router;
}
