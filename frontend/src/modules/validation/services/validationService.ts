import { httpClient } from '../../../infrastructure/http/httpClient';
import type { ValidationRecord, ValidationDecision, ReviewerAssignment } from '../models/types';

export class ValidationService {
  /** Paginated worklist */
  static async getRecords(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    priority?: string;
  }): Promise<{ records: ValidationRecord[]; total: number; page: number; limit: number }> {
    const q = new URLSearchParams();
    if (params?.page) q.append('page', String(params.page));
    if (params?.limit) q.append('limit', String(params.limit));
    if (params?.search) q.append('search', params.search);
    if (params?.status) q.append('status', params.status);
    if (params?.priority) q.append('priority', params.priority);
    const res = await httpClient.get<any>(`/validations?${q.toString()}`);
    return res.data;
  }

  /** Single record */
  static async getById(id: string): Promise<ValidationRecord> {
    const res = await httpClient.get<ValidationRecord>(`/validations/${id}`);
    return res.data;
  }

  /** Submit a stage decision (Approve / Reject / Return) */
  static async submitDecision(
    validationId: string,
    stageId: string,
    decision: Partial<ValidationDecision> & { reviewer: string }
  ): Promise<ValidationRecord> {
    const res = await httpClient.post<ValidationRecord>(
      `/validations/${validationId}/stages/${stageId}/decision`,
      decision
    );
    return res.data;
  }

  /** Assign reviewer to a stage */
  static async assignReviewer(
    validationId: string,
    stageId: string,
    assignment: Pick<ReviewerAssignment, 'assignedTo' | 'assignedBy' | 'dueDate'>
  ): Promise<ValidationRecord> {
    const res = await httpClient.post<ValidationRecord>(
      `/validations/${validationId}/stages/${stageId}/assign`,
      assignment
    );
    return res.data;
  }

  /** Release validated record for reporting */
  static async release(validationId: string): Promise<ValidationRecord> {
    const res = await httpClient.post<ValidationRecord>(`/validations/${validationId}/release`, {});
    return res.data;
  }
}

export default ValidationService;
