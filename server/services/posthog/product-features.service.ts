import { hogql, isPostHogConfigured, PostHogError } from './posthog-client';
import { TopFeatures, topFeaturesSchema } from '../../schemas/dashboard-product.schema';

interface FeatureRow {
  feature: string;
  users: number;
  uses: number;
  last_used: string | null;
}

export async function getProductTopFeatures(from: string, to: string): Promise<TopFeatures> {
  if (!isPostHogConfigured()) {
    return { items: [] };
  }

  try {
    const query = `
      SELECT
        properties.feature_name as feature,
        count(DISTINCT person_id) as users,
        count() as uses,
        max(timestamp) as last_used
      FROM events
      WHERE event = 'feature_activated'
        AND timestamp >= toDateTime('${from}')
        AND timestamp <= toDateTime('${to}')
        AND properties.feature_name IS NOT NULL
      GROUP BY properties.feature_name
      ORDER BY uses DESC
      LIMIT 20
    `;

    const results = await hogql<FeatureRow[]>(query);

    const items = (results || []).map((row) => ({
      feature: String(row.feature || 'Unknown'),
      users: Number(row.users || 0),
      totalUses: Number(row.uses || 0),
      lastUsed: row.last_used ? String(row.last_used) : null,
    }));

    const result: TopFeatures = { items };
    const parsed = topFeaturesSchema.safeParse(result);

    if (!parsed.success) {
      console.error('[product-features] Schema validation failed:', parsed.error);
      throw new PostHogError('POSTHOG_SCHEMA_DRIFT', 'Features response schema mismatch');
    }

    return parsed.data;
  } catch (err) {
    if (err instanceof PostHogError) throw err;
    console.error('[product-features] Error:', err);
    throw new PostHogError('POSTHOG_UNAVAILABLE', 'Failed to fetch top features');
  }
}
