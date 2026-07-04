import { httpClient } from '../../../infrastructure/http/httpClient';
import type { UserProfile, RoleDefinition, Department, MasterRecord, ConfigurationSetting } from '../models/types';

export class AdminService {
  static async getUsers(): Promise<UserProfile[]> {
    const res = await httpClient.get<UserProfile[]>('/admin/users');
    return res.data;
  }

  static async createUser(user: Partial<UserProfile>): Promise<UserProfile> {
    const res = await httpClient.post<UserProfile>('/admin/users', user);
    return res.data;
  }

  static async updateStatus(userId: string, status: 'Active' | 'Inactive'): Promise<UserProfile> {
    const res = await httpClient.post<UserProfile>(`/admin/users/${userId}/status`, { status });
    return res.data;
  }

  static async getRoles(): Promise<RoleDefinition[]> {
    const res = await httpClient.get<RoleDefinition[]>('/admin/roles');
    return res.data;
  }

  static async updateRole(roleId: string, permissions: string[]): Promise<RoleDefinition> {
    const res = await httpClient.post<RoleDefinition>(`/admin/roles/${roleId}`, { permissions });
    return res.data;
  }

  static async getDepartments(): Promise<Department[]> {
    const res = await httpClient.get<Department[]>('/admin/departments');
    return res.data;
  }

  static async getMasterRecords(type?: string): Promise<MasterRecord[]> {
    const q = type ? `?type=${type}` : '';
    const res = await httpClient.get<MasterRecord[]>(`/admin/masters${q}`);
    return res.data;
  }

  static async createMasterRecord(record: Partial<MasterRecord>): Promise<MasterRecord> {
    const res = await httpClient.post<MasterRecord>('/admin/masters', record);
    return res.data;
  }

  static async updateMasterRecord(recordId: string, record: Partial<MasterRecord>): Promise<MasterRecord> {
    const res = await httpClient.post<MasterRecord>(`/admin/masters/${recordId}`, record);
    return res.data;
  }

  static async getConfigSettings(): Promise<ConfigurationSetting[]> {
    const res = await httpClient.get<ConfigurationSetting[]>('/admin/configs');
    return res.data;
  }

  static async saveConfigSettings(configs: ConfigurationSetting[]): Promise<ConfigurationSetting[]> {
    const res = await httpClient.post<ConfigurationSetting[]>('/admin/configs', { configs });
    return res.data;
  }
}

export default AdminService;
