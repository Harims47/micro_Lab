import { httpClient } from '../../../infrastructure/http/httpClient';
import type { LaboratoryReport, ReportSignature, DistributionRecord } from '../models/types';

export class ReportService {
  /**
   * Fetch paginated list of reports
   */
  static async getReports(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    version?: string;
  }): Promise<{ reports: LaboratoryReport[]; total: number; page: number; limit: number }> {
    const q = new URLSearchParams();
    if (params?.page) q.append('page', String(params.page));
    if (params?.limit) q.append('limit', String(params.limit));
    if (params?.search) q.append('search', params.search);
    if (params?.status) q.append('status', params.status);
    if (params?.version) q.append('version', params.version);
    const res = await httpClient.get<any>(`/reports?${q.toString()}`);
    return res.data;
  }

  /**
   * Fetch single report detail
   */
  static async getById(id: string): Promise<LaboratoryReport> {
    const res = await httpClient.get<LaboratoryReport>(`/reports/${id}`);
    return res.data;
  }

  /**
   * Sign report
   */
  static async sign(
    reportId: string,
    signature: Pick<ReportSignature, 'signer' | 'role'>
  ): Promise<LaboratoryReport> {
    const res = await httpClient.post<LaboratoryReport>(`/reports/${reportId}/sign`, signature);
    return res.data;
  }

  /**
   * Remove signature
   */
  static async unsign(reportId: string, signatureId: string): Promise<LaboratoryReport> {
    const res = await httpClient.post<LaboratoryReport>(`/reports/${reportId}/unsign`, { signatureId });
    return res.data;
  }

  /**
   * Final Release of Report
   */
  static async release(
    reportId: string,
    releaseData: { releaseNotes?: string; distributionMethods: string[] }
  ): Promise<LaboratoryReport> {
    const res = await httpClient.post<LaboratoryReport>(`/reports/${reportId}/release`, releaseData);
    return res.data;
  }

  /**
   * Amend Report (creates new version, increments version number)
   */
  static async amend(reportId: string, reason: string): Promise<LaboratoryReport> {
    const res = await httpClient.post<LaboratoryReport>(`/reports/${reportId}/amend`, { reason });
    return res.data;
  }

  /**
   * Trigger mock report distribution (Email, Print, SMS, HIS, etc.)
   */
  static async distribute(
    reportId: string,
    distribution: Pick<DistributionRecord, 'method' | 'destination'>
  ): Promise<LaboratoryReport> {
    const res = await httpClient.post<LaboratoryReport>(`/reports/${reportId}/distribute`, distribution);
    return res.data;
  }

  /**
   * Archive Report
   */
  static async archive(reportId: string): Promise<LaboratoryReport> {
    const res = await httpClient.post<LaboratoryReport>(`/reports/${reportId}/archive`, {});
    return res.data;
  }
}

export default ReportService;
