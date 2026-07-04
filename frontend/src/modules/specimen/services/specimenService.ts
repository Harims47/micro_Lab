import { httpClient } from '../../../infrastructure/http/httpClient';
import type { Specimen, QualityAssessment } from '../models/types';

export class SpecimenService {
  /**
   * Fetches paginated, filtered specimens list.
   */
  static async getSpecimens(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    container?: string;
    collector?: string;
    rejectionReason?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ specimens: Specimen[]; total: number; page: number; limit: number }> {
    const query = new URLSearchParams();
    if (params) {
      if (params.page) query.append('page', String(params.page));
      if (params.limit) query.append('limit', String(params.limit));
      if (params.search) query.append('search', params.search);
      if (params.status) query.append('status', params.status);
      if (params.container) query.append('container', params.container);
      if (params.collector) query.append('collector', params.collector);
      if (params.rejectionReason) query.append('rejectionReason', params.rejectionReason);
      if (params.sortBy) query.append('sortBy', params.sortBy);
      if (params.sortOrder) query.append('sortOrder', params.sortOrder);
    }
    const response = await httpClient.get<{
      specimens: Specimen[];
      total: number;
      page: number;
      limit: number;
    }>(`/specimens?${query.toString()}`);
    return response.data;
  }

  /**
   * Retrieves specimen container by ID.
   */
  static async getSpecimenById(id: string): Promise<Specimen> {
    const response = await httpClient.get<Specimen>(`/specimens/${id}`);
    return response.data;
  }

  /**
   * Registers a new specimen.
   */
  static async createSpecimen(specimen: Partial<Specimen>): Promise<Specimen> {
    const response = await httpClient.post<Specimen>('/specimens', specimen);
    return response.data;
  }

  /**
   * Dispatches quality check assessment values.
   */
  static async performQualityCheck(id: string, qc: Partial<QualityAssessment>): Promise<Specimen> {
    const response = await httpClient.post<Specimen>(`/specimens/${id}/qc`, qc);
    return response.data;
  }

  /**
   * Splits a child aliquot off a parent container.
   */
  static async splitSpecimen(id: string, aliquotVolume: number): Promise<Specimen> {
    const response = await httpClient.post<Specimen>(`/specimens/${id}/split`, { volume: aliquotVolume });
    return response.data;
  }

  /**
   * Logs a barcode reprint audit event.
   */
  static async reprintBarcode(id: string, reason: string): Promise<Specimen> {
    const response = await httpClient.post<Specimen>(`/specimens/${id}/reprint`, { reason });
    return response.data;
  }

  /**
   * Bulk marks multiple specimens as Received.
   */
  static async bulkReceiveSpecimens(ids: string[]): Promise<{ count: number }> {
    const response = await httpClient.post<{ count: number }>('/specimens/bulk-receive', { ids });
    return response.data;
  }

  /**
   * Bulk accepts multiple specimens.
   */
  static async bulkAcceptSpecimens(ids: string[]): Promise<{ count: number }> {
    const response = await httpClient.post<{ count: number }>('/specimens/bulk-accept', { ids });
    return response.data;
  }

  /**
   * Bulk rejects multiple specimens with structured categories.
   */
  static async bulkRejectSpecimens(ids: string[], reason: string, category: string): Promise<{ count: number }> {
    const response = await httpClient.post<{ count: number }>('/specimens/bulk-reject', { ids, reason, category });
    return response.data;
  }
}
