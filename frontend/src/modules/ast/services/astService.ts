import { httpClient } from '../../../infrastructure/http/httpClient';
import type { AstResult, AntibioticAgentResult } from '../models/types';

export class AstService {
  /**
   * Fetches paginated, filtered AST worklist.
   */
  static async getAstRecords(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<{ asts: AstResult[]; total: number; page: number; limit: number }> {
    const query = new URLSearchParams();
    if (params) {
      if (params.page) query.append('page', String(params.page));
      if (params.limit) query.append('limit', String(params.limit));
      if (params.search) query.append('search', params.search);
      if (params.status) query.append('status', params.status);
    }
    const response = await httpClient.get<{
      asts: AstResult[];
      total: number;
      page: number;
      limit: number;
    }>(`/asts?${query.toString()}`);
    return response.data;
  }

  /**
   * Retrieves single AST panel worksheets.
   */
  static async getAstById(id: string): Promise<AstResult> {
    const response = await httpClient.get<AstResult>(`/asts/${id}`);
    return response.data;
  }

  /**
   * Saves or updates AST panel worksheets values.
   */
  static async saveAstResult(
    astId: string,
    results: AntibioticAgentResult[],
    guideline?: string
  ): Promise<AstResult> {
    const response = await httpClient.post<AstResult>(`/asts/${astId}/results`, { results, guideline });
    return response.data;
  }

  /**
   * clinical supervisor review checkpoints decision.
   */
  static async reviewAstResult(
    astId: string,
    review: { status: 'Approved' | 'Rejected' | 'Returned For Correction'; reason?: string; reviewer: string }
  ): Promise<AstResult> {
    const response = await httpClient.post<AstResult>(`/asts/${astId}/review`, review);
    return response.data;
  }

  /**
   * Creates a new AST testing record placeholder.
   */
  static async createAstRecord(payload: any): Promise<AstResult> {
    const response = await httpClient.post<AstResult>('/asts', payload);
    return response.data;
  }
}
export default AstService;
