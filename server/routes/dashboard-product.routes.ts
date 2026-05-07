import { Router } from 'express';
import type express from 'express';
import { dateRangeQuerySchema } from '../schemas/dashboard-product.schema';
import { getProductMetrics, getBusinessFunnel } from '../services/posthog/product-metrics.service';
import { getProductTopFeatures } from '../services/posthog/product-features.service';
import { cacheKey, getCached, setCached, invalidateAll } from '../services/posthog/posthog-cache';
import { PostHogError } from '../services/posthog/posthog-client';

export function createDashboardProductRoutes() {
  const router = Router();

  router.get('/summary', async (req, res) => {
    try {
      const parsed = dateRangeQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          data: null,
          error: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
        });
      }

      const { from, to } = parsed.data;
      const key = cacheKey('summary', from, to);
      const cached = getCached(key);
      if (cached) {
        return res.json({ success: true, data: cached, cached: true });
      }

      const data = await getProductMetrics(from, to);
      setCached(key, data);
      res.json({ success: true, data, cached: false });
    } catch (err) {
      handlePostHogError(err, res, 'summary');
    }
  });

  router.get('/funnel', async (req, res) => {
    try {
      const parsed = dateRangeQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          data: null,
          error: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
        });
      }

      const { from, to } = parsed.data;
      const key = cacheKey('funnel', from, to);
      const cached = getCached(key);
      if (cached) {
        return res.json({ success: true, data: cached, cached: true });
      }

      const data = await getBusinessFunnel(from, to);
      setCached(key, data);
      res.json({ success: true, data, cached: false });
    } catch (err) {
      handlePostHogError(err, res, 'funnel');
    }
  });

  router.get('/top-features', async (req, res) => {
    try {
      const parsed = dateRangeQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          data: null,
          error: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
        });
      }

      const { from, to } = parsed.data;
      const key = cacheKey('top-features', from, to);
      const cached = getCached(key);
      if (cached) {
        return res.json({ success: true, data: cached, cached: true });
      }

      const data = await getProductTopFeatures(from, to);
      setCached(key, data);
      res.json({ success: true, data, cached: false });
    } catch (err) {
      handlePostHogError(err, res, 'top-features');
    }
  });

  router.post('/refresh', (_req, res) => {
    invalidateAll();
    res.json({ success: true, message: 'Cache invalidated' });
  });

  return router;
}

function handlePostHogError(err: unknown, res: express.Response, endpoint: string) {
  console.error(`[dashboard/product/${endpoint}]`, err);

  if (err instanceof PostHogError) {
    const status = err.code === 'POSTHOG_RATE_LIMIT' ? 429 : 503;
    return res.status(status).json({
      success: false,
      data: null,
      code: err.code,
      error: err.message,
    });
  }

  res.status(500).json({
    success: false,
    data: null,
    error: (err as Error).message,
  });
}
