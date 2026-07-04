import { httpClient } from '../../../infrastructure/http/httpClient';
import type { Colony, GramStain, BiochemicalResult, IdentificationAttempt } from '../models/types';

export class OrganismService {
  /**
   * Fetches paginated list of isolated colonies.
   */
  static async getColonies(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    qcStatus?: string;
  }): Promise<{ colonies: Colony[]; total: number; page: number; limit: number }> {
    const query = new URLSearchParams();
    if (params) {
      if (params.page) query.append('page', String(params.page));
      if (params.limit) query.append('limit', String(params.limit));
      if (params.search) query.append('search', params.search);
      if (params.status) query.append('status', params.status);
      if (params.qcStatus) query.append('qcStatus', params.qcStatus);
    }
    const response = await httpClient.get<{
      colonies: Colony[];
      total: number;
      page: number;
      limit: number;
    }>(`/colonies?${query.toString()}`);
    return response.data;
  }

  /**
   * Retrieves single colony detailed history.
   */
  static async getColonyById(id: string): Promise<Colony> {
    const response = await httpClient.get<Colony>(`/colonies/${id}`);
    return response.data;
  }

  /**
   * Logs Gram Stain morphological results.
   */
  static async saveGramStain(colonyId: string, gramStain: GramStain): Promise<Colony> {
    const response = await httpClient.post<Colony>(`/colonies/${colonyId}/gram-stain`, gramStain);
    return response.data;
  }

  /**
   * Logs Biochemical test assays list.
   */
  static async saveBiochemicals(colonyId: string, biochemicals: BiochemicalResult[]): Promise<Colony> {
    const response = await httpClient.post<Colony>(`/colonies/${colonyId}/biochemicals`, { biochemicals });
    return response.data;
  }

  /**
   * Spawns a new candidate organism identification attempt.
   */
  static async createAttempt(colonyId: string, attempt: Partial<IdentificationAttempt>): Promise<Colony> {
    const response = await httpClient.post<Colony>(`/colonies/${colonyId}/attempts`, attempt);
    return response.data;
  }

  /**
   * clinical review decision checkpoint: approve or reject attempt.
   */
  static async reviewAttempt(
    colonyId: string,
    attemptId: string,
    review: { status: 'Approved' | 'Rejected'; reason?: string; reviewer: string }
  ): Promise<Colony> {
    const response = await httpClient.post<Colony>(`/colonies/${colonyId}/attempts/${attemptId}/review`, review);
    return response.data;
  }

  /**
   * Enqueues approved colonies into AST testing queue.
   */
  static async sendToAstQueue(colonyId: string): Promise<Colony> {
    const response = await httpClient.post<Colony>(`/colonies/${colonyId}/send-to-ast`, {});
    return response.data;
  }
}
export default OrganismService;
