import { httpClient } from '../../../infrastructure/http/httpClient';
import type { AuditRecord, ComplianceSummary } from '../models/types';

export class AuditService {
  static async getLogs(params?: {
    page?: number;
    limit?: number;
    search?: string;
    module?: string;
    severity?: string;
  }): Promise<{ records: AuditRecord[]; total: number; page: number; limit: number }> {
    const q = new URLSearchParams();
    if (params?.page) q.append('page', String(params.page));
    if (params?.limit) q.append('limit', String(params.limit));
    if (params?.search) q.append('search', params.search);
    if (params?.module) q.append('module', params.module);
    if (params?.severity) q.append('severity', params.severity);

    const res = await httpClient.get<any>(`/audit/logs?${q.toString()}`);
    return res.data;
  }

  static async exportLogs(): Promise<{ downloadUrl: string }> {
    const res = await httpClient.post<{ downloadUrl: string }>('/audit/export', {});
    return res.data;
  }

  static async getComplianceSummary(): Promise<ComplianceSummary> {
    const res = await httpClient.get<ComplianceSummary>('/audit/compliance');
    return res.data;
  }
}

export default AuditService;
