import { Router } from 'express';
import type express from 'express';
import {
  dateRangeQuerySchema,
  trendsQuerySchema,
  heatmapQuerySchema,
} from '../schemas/dashboard-product.schema';
import { validateQuery } from '../middleware/validate.middleware';
import { requireAuth } from '../middleware/require-auth';
import { getProductMetrics, getBusinessFunnel } from '../services/posthog/product-metrics.service';
import { getProductTopFeatures } from '../services/posthog/product-features.service';
import { getProductTrends } from '../services/posthog/product-trends.service';
import { getProductHeatmap } from '../services/posthog/product-heatmap.service';
import { getProductTtv } from '../services/posthog/product-time-to-value.service';
import { getProductCohort } from '../services/posthog/product-cohort.service';
import { getProductChannel } from '../services/posthog/product-channel.service';
import { getProductOperational } from '../services/posthog/product-operational.service';
import { getProductStuck } from '../services/posthog/product-stuck.service';
import { cacheKey, getCached, setCached, invalidateAll } from '../services/posthog/posthog-cache';
import { PostHogError } from '../services/posthog/posthog-client';

const dashboardOpts = { errorShape: 'dashboard' as const };

export function createDashboardProductRoutes() {
  const router = Router();

  router.get('/summary', requireAuth(['read:dashboard']), validateQuery(dateRangeQuerySchema, dashboardOpts), async (req, res) => {
    try {
      const { from, to } = req.validatedQuery as { from: string; to: string };
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

  router.get('/funnel', requireAuth(['read:dashboard']), validateQuery(dateRangeQuerySchema, dashboardOpts), async (req, res) => {
    try {
      const { from, to } = req.validatedQuery as { from: string; to: string };
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

  router.get('/top-features', requireAuth(['read:dashboard']), validateQuery(dateRangeQuerySchema, dashboardOpts), async (req, res) => {
    try {
      const { from, to } = req.validatedQuery as { from: string; to: string };
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

  // Phase 2 — Trends (line chart Pre-PQL Rate / Signup / FirstSync / Activation)
  router.get('/trends', requireAuth(['read:dashboard']), validateQuery(trendsQuerySchema, dashboardOpts), async (req, res) => {
    try {
      const { from, to, metric } = req.validatedQuery as { from: string; to: string; metric: string };
      const key = cacheKey(`trends:${metric}`, from, to);
      const cached = getCached(key);
      if (cached) {
        return res.json({ success: true, data: cached, cached: true });
      }
      const data = await getProductTrends(from, to, metric as any);
      setCached(key, data);
      res.json({ success: true, data, cached: false });
    } catch (err) {
      handlePostHogError(err, res, 'trends');
    }
  });

  // Phase 2 — Activation Heatmap (3 view variant: hour-day · cohort · business)
  router.get('/heatmap', requireAuth(['read:dashboard']), async (req, res) => {
    try {
      const dateParsed = dateRangeQuerySchema.safeParse(req.query);
      if (!dateParsed.success) {
        return res.status(400).json({
          success: false,
          data: null,
          error: dateParsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
        });
      }
      const viewParsed = heatmapQuerySchema.safeParse(req.query);
      if (!viewParsed.success) {
        return res.status(400).json({
          success: false,
          data: null,
          error: 'Invalid view param',
        });
      }

      const { from, to } = dateParsed.data;
      const { view } = viewParsed.data;
      const key = cacheKey(`heatmap:${view}`, from, to);
      const cached = getCached(key);
      if (cached) {
        return res.json({ success: true, data: cached, cached: true });
      }

      const data = await getProductHeatmap(view, from, to);
      setCached(key, data);
      res.json({ success: true, data, cached: false });
    } catch (err) {
      handlePostHogError(err, res, 'heatmap');
    }
  });

  // Phase 2 — Time-to-Value histogram (Created→FirstSync, FirstSync→PQL)
  router.get('/ttv', requireAuth(['read:dashboard']), validateQuery(dateRangeQuerySchema, dashboardOpts), async (req, res) => {
    try {
      const { from, to } = req.validatedQuery as { from: string; to: string };
      const key = cacheKey('ttv', from, to);
      const cached = getCached(key);
      if (cached) {
        return res.json({ success: true, data: cached, cached: true });
      }
      const data = await getProductTtv(from, to);
      setCached(key, data);
      res.json({ success: true, data, cached: false });
    } catch (err) {
      handlePostHogError(err, res, 'ttv');
    }
  });

  // Phase 2 Sprint 2 — Cohort Retention (replace iframe)
  router.get('/cohort', requireAuth(['read:dashboard']), validateQuery(dateRangeQuerySchema, dashboardOpts), async (req, res) => {
    try {
      const { from, to } = req.validatedQuery as { from: string; to: string };
      const key = cacheKey('cohort', from, to);
      const cached = getCached(key);
      if (cached) {
        return res.json({ success: true, data: cached, cached: true });
      }
      const data = await getProductCohort(from, to);
      setCached(key, data);
      res.json({ success: true, data, cached: false });
    } catch (err) {
      handlePostHogError(err, res, 'cohort');
    }
  });

  // Phase 2 Sprint 2 — Channel attribution (CRM + PostHog)
  router.get('/channel', requireAuth(['read:dashboard']), validateQuery(dateRangeQuerySchema, dashboardOpts), async (req, res) => {
    try {
      const { from, to } = req.validatedQuery as { from: string; to: string };
      const key = cacheKey('channel', from, to);
      const cached = getCached(key);
      if (cached) {
        return res.json({ success: true, data: cached, cached: true });
      }
      const data = await getProductChannel(from, to);
      setCached(key, data);
      res.json({ success: true, data, cached: false });
    } catch (err) {
      handlePostHogError(err, res, 'channel');
    }
  });

  // Phase 2 Sprint 3 — Operational (online time table + touchpoints top 50)
  router.get('/operational', requireAuth(['read:dashboard']), validateQuery(dateRangeQuerySchema, dashboardOpts), async (req, res) => {
    try {
      const { from, to } = req.validatedQuery as { from: string; to: string };
      const key = cacheKey('operational', from, to);
      const cached = getCached(key);
      if (cached) {
        return res.json({ success: true, data: cached, cached: true });
      }
      const data = await getProductOperational(from, to);
      setCached(key, data);
      res.json({ success: true, data, cached: false });
    } catch (err) {
      handlePostHogError(err, res, 'operational');
    }
  });

  // Phase 2 Sprint 3 — Stuck businesses TRACKING-ONLY (Master Plan §1.4)
  // Note: keeps inline parse (optional from/to, falls back to all-time)
  router.get('/stuck', requireAuth(['read:dashboard']), async (req, res) => {
    try {
      const parsed = dateRangeQuerySchema.safeParse(req.query);
      const from = parsed.success ? parsed.data.from : undefined;
      const to = parsed.success ? parsed.data.to : undefined;

      const key = cacheKey('stuck', from ?? 'all', to ?? 'all');
      const cached = getCached(key);
      if (cached) {
        return res.json({ success: true, data: cached, cached: true });
      }

      const data = await getProductStuck(from, to);
      setCached(key, data);
      res.json({ success: true, data, cached: false });
    } catch (err) {
      handlePostHogError(err, res, 'stuck');
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
