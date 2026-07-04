import { mockAdapter } from '../../../infrastructure/http/mockAdapter';
import { eventBus } from '../../../services/platform/eventBus';
import type { AnalyticsSnapshot, AstMetric, OrganismMetric, TrendSeries } from '../models/types';
import { mockSpecimens, mockOrders } from '../../../mock/mockData';

export const initializeMockAnalyticsServer = () => {
  // 1. GET /analytics/snapshot
  mockAdapter.register('GET', '/analytics/snapshot', () => {
    // Generate dynamically based on seeded databases
    const pendingOrders = mockOrders ? mockOrders.filter((o) => o.orderStatus === 'PENDING').length : 5;
    const pendingSpecimens = mockSpecimens ? mockSpecimens.filter((s) => s.status === 'REGISTERED' || s.status === 'RECEIVED').length : 12;


    // Organisms metrics
    const organisms: OrganismMetric[] = [
      { organismName: 'Escherichia coli', count: 42, percentage: 46 },
      { organismName: 'Staphylococcus aureus', count: 28, percentage: 31 },
      { organismName: 'Pseudomonas aeruginosa', count: 12, percentage: 13 },
      { organismName: 'Klebsiella pneumoniae', count: 9, percentage: 10 },
    ];

    // AST metric
    const ast: AstMetric[] = [
      { agentName: 'Amoxicillin', sensitiveRate: 65, intermediateRate: 10, resistantRate: 25 },
      { agentName: 'Ciprofloxacin', sensitiveRate: 85, intermediateRate: 5, resistantRate: 10 },
      { agentName: 'Gentamicin', sensitiveRate: 90, intermediateRate: 2, resistantRate: 8 },
      { agentName: 'Vancomycin', sensitiveRate: 98, intermediateRate: 0, resistantRate: 2 },
    ];

    // Build timeline series
    const dailyTests: TrendSeries[] = [
      { date: 'Mon', count: 12 },
      { date: 'Tue', count: 19 },
      { date: 'Wed', count: 15 },
      { date: 'Thu', count: 22 },
      { date: 'Fri', count: 18 },
      { date: 'Sat', count: 8 },
      { date: 'Sun', count: 5 },
    ];

    const weeklyTests: TrendSeries[] = [
      { date: 'Week 1', count: 88 },
      { date: 'Week 2', count: 95 },
      { date: 'Week 3', count: 110 },
      { date: 'Week 4', count: 99 },
    ];

    const monthlyTests: TrendSeries[] = [
      { date: 'May', count: 320 },
      { date: 'Jun', count: 410 },
      { date: 'Jul', count: 450 },
    ];

    const snapshot: AnalyticsSnapshot = {
      kpis: {
        turnaroundTime: 18.5, // hrs
        pendingOrders,
        pendingSpecimens,
        pendingValidation: 8,
        pendingReports: 6,
        dailyProductivity: dailyTests.reduce((sum, d) => sum + d.count, 0),
      },
      organisms,
      ast,
      dailyTests,
      weeklyTests,
      monthlyTests,
      positiveCultureRate: 34, // 34%
      negativeCultureRate: 66, // 66%
    };

    eventBus.publish('DASHBOARD_REFRESHED', snapshot);
    return snapshot;
  });
};

export default initializeMockAnalyticsServer;
