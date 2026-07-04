export interface TrendSeries {
  date: string;
  count: number;
}

export interface KPIResult {
  turnaroundTime: number; // in hours
  pendingOrders: number;
  pendingSpecimens: number;
  pendingValidation: number;
  pendingReports: number;
  dailyProductivity: number;
}

export interface OrganismMetric {
  organismName: string;
  count: number;
  percentage: number;
}

export interface AstMetric {
  agentName: string;
  sensitiveRate: number;
  intermediateRate: number;
  resistantRate: number;
}

export interface AnalyticsSnapshot {
  kpis: KPIResult;
  organisms: OrganismMetric[];
  ast: AstMetric[];
  dailyTests: TrendSeries[];
  weeklyTests: TrendSeries[];
  monthlyTests: TrendSeries[];
  positiveCultureRate: number; // e.g. 24 for 24%
  negativeCultureRate: number; // e.g. 76 for 76%
}
