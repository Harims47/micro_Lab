import { httpClient } from '../../../infrastructure/http/httpClient';
import type { Culture, PlateObservation, ColonyItem } from '../models/types';

export class CultureService {
  /**
   * Fetches paginated, filtered culture list.
   */
  static async getCultures(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ cultures: Culture[]; total: number; page: number; limit: number }> {
    const query = new URLSearchParams();
    if (params) {
      if (params.page) query.append('page', String(params.page));
      if (params.limit) query.append('limit', String(params.limit));
      if (params.search) query.append('search', params.search);
      if (params.status) query.append('status', params.status);
      if (params.sortBy) query.append('sortBy', params.sortBy);
      if (params.sortOrder) query.append('sortOrder', params.sortOrder);
    }
    const response = await httpClient.get<{
      cultures: Culture[];
      total: number;
      page: number;
      limit: number;
    }>(`/cultures?${query.toString()}`);
    return response.data;
  }

  /**
   * Retrieves single culture profile.
   */
  static async getCultureById(id: string): Promise<Culture> {
    const response = await httpClient.get<Culture>(`/cultures/${id}`);
    return response.data;
  }

  /**
   * Creates a new culture.
   */
  static async createCulture(culture: any): Promise<Culture> {
    const response = await httpClient.post<Culture>('/cultures', culture);
    return response.data;
  }

  /**
   * Records a colony growth observation round and assigns isolated colonies.
   */
  static async recordObservation(
    cultureId: string,
    plateId: string,
    observation: Partial<PlateObservation>,
    colonies: ColonyItem[]
  ): Promise<Culture> {
    const response = await httpClient.post<Culture>(`/cultures/${cultureId}/plates/${plateId}/observe`, {
      observation,
      colonies,
    });
    return response.data;
  }

  /**
   * Logs a plate contamination occurrence.
   */
  static async logContamination(
    cultureId: string,
    plateId: string,
    contamination: { severity: string; source: string; action: string }
  ): Promise<Culture> {
    const response = await httpClient.post<Culture>(`/cultures/${cultureId}/plates/${plateId}/contaminate`, contamination);
    return response.data;
  }

  /**
   * Updates the workflow status of an individual plate.
   */
  static async updatePlateStatus(
    cultureId: string,
    plateId: string,
    status: string,
    incubationUpdates?: any
  ): Promise<Culture> {
    const response = await httpClient.post<Culture>(`/cultures/${cultureId}/plates/${plateId}/status`, {
      status,
      ...incubationUpdates,
    });
    return response.data;
  }
}
export default CultureService;
