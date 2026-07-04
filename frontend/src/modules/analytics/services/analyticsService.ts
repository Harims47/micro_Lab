import { httpClient } from '../../../infrastructure/http/httpClient';
import type { AnalyticsSnapshot } from '../models/types';

export class AnalyticsService {
  static async getSnapshot(): Promise<AnalyticsSnapshot> {
    const res = await httpClient.get<AnalyticsSnapshot>('/analytics/snapshot');
    return res.data;
  }
}

export default AnalyticsService;
