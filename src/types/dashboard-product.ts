export interface DateRange {
  from: string;
  to: string;
}

export interface ProductSummary {
  totalSignups: number;
  firstSyncCount: number;
  pqlCount: number;
  activationCount: number;
  activationRate: number;
  dau: number;
  mau: number;
  dauMauRatio: number;
}

export interface FunnelStep {
  name: string;
  displayName: string;
  count: number;
  dropOffPct: number;
}

export interface ProductFunnel {
  steps: FunnelStep[];
}

export interface TopFeature {
  feature: string;
  users: number;
  totalUses: number;
  lastUsed: string | null;
}

export interface TopFeatures {
  items: TopFeature[];
}

export interface ProductSummaryResponse {
  success: boolean;
  data: ProductSummary | null;
  cached?: boolean;
  error?: string;
}

export interface ProductFunnelResponse {
  success: boolean;
  data: ProductFunnel | null;
  cached?: boolean;
  error?: string;
}

export interface TopFeaturesResponse {
  success: boolean;
  data: TopFeatures | null;
  cached?: boolean;
  error?: string;
}
