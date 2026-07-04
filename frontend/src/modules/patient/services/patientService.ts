import { httpClient } from '../../../infrastructure/http/httpClient';
import type { Patient } from '../models/types';

export class PatientService {
  /**
   * Fetches a paginated, filtered list of patients from the LIMS mock database.
   */
  static async getPatients(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ patients: Patient[]; total: number; page: number; limit: number }> {
    const query = new URLSearchParams();
    if (params) {
      if (params.page) query.append('page', String(params.page));
      if (params.limit) query.append('limit', String(params.limit));
      if (params.search) query.append('search', params.search);
      if (params.status) query.append('status', params.status);
      if (params.sortBy) query.append('sortBy', params.sortBy);
      if (params.sortOrder) query.append('sortOrder', params.sortOrder);
    }
    const queryString = query.toString();
    const url = `/patients${queryString ? '?' + queryString : ''}`;
    const response = await httpClient.get<{
      patients: Patient[];
      total: number;
      page: number;
      limit: number;
    }>(url);
    return response.data;
  }

  /**
   * Retrieves a single patient by ID.
   */
  static async getPatientById(id: string): Promise<Patient> {
    const response = await httpClient.get<Patient>(`/patients/${id}`);
    return response.data;
  }

  /**
   * Dispatches a request to register a new patient.
   */
  static async createPatient(patient: Omit<Patient, 'patientId' | 'createdAt' | 'status'>): Promise<Patient> {
    const response = await httpClient.post<Patient>('/patients', patient);
    return response.data;
  }

  /**
   * Dispatches updates for an existing patient profile.
   */
  static async updatePatient(id: string, patient: Partial<Patient>): Promise<Patient> {
    const response = await httpClient.put<Patient>(`/patients/${id}`, patient);
    return response.data;
  }

  /**
   * Triggers deactivation / soft-deletion for a patient.
   */
  static async deletePatient(id: string): Promise<{ success: boolean; patientId: string }> {
    const response = await httpClient.delete<{ success: boolean; patientId: string }>(`/patients/${id}`);
    return response.data;
  }

  /**
   * Merges a duplicate secondary patient record into a primary patient record.
   */
  static async mergePatients(
    targetId: string,
    duplicateId: string,
    reason: string
  ): Promise<{ success: boolean; target: Patient }> {
    const response = await httpClient.post<{ success: boolean; target: Patient }>('/patients/merge', {
      targetId,
      duplicateId,
      reason,
    });
    return response.data;
  }

  /**
   * Executes a quick instant query search across patient records.
   */
  static async searchPatients(query: string): Promise<Patient[]> {
    const response = await httpClient.get<Patient[]>(`/patients/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  /**
   * Fetches the audit trail logs history for a specific patient.
   */
  static async getPatientHistory(id: string): Promise<any[]> {
    const response = await httpClient.get<any[]>(`/patients/history?patientId=${id}`);
    return response.data;
  }
}
export default PatientService;
