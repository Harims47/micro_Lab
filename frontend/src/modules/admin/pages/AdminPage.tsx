import React, { useState, useEffect, useCallback } from 'react';
import type { UserProfile, RoleDefinition, Department, MasterRecord, ConfigurationSetting } from '../models/types';
import { AdminService } from '../services/adminService';
import { AdminDashboard } from '../components/AdminDashboard';
import { UserManagement } from '../components/UserManagement';
import { RoleManagement } from '../components/RoleManagement';
import { DepartmentManagement } from '../components/DepartmentManagement';
import { MasterDataManager } from '../components/MasterDataManager';
import { ConfigurationPanel } from '../components/ConfigurationPanel';

import { PageContainer, Card } from '../../../components/Layout';
import { Tabs } from '../../../components/Layout/Tabs';

export const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [masters, setMasters] = useState<MasterRecord[]>([]);
  const [configs, setConfigs] = useState<ConfigurationSetting[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [u, r, d, m, c] = await Promise.all([
        AdminService.getUsers(),
        AdminService.getRoles(),
        AdminService.getDepartments(),
        AdminService.getMasterRecords(),
        AdminService.getConfigSettings(),
      ]);
      setUsers(u);
      setRoles(r);
      setDepartments(d);
      setMasters(m);
      setConfigs(c);
    } catch { /* silently ignore */ }
    finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <PageContainer>
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading Administration Console...</p>
      </PageContainer>
    );
  }

  const tabItems = [
    {
      id: 'users',
      label: 'Users',
      content: <UserManagement users={users} onRefresh={fetchData} />,
    },
    {
      id: 'roles',
      label: 'Roles',
      content: <RoleManagement roles={roles} onRefresh={fetchData} />,
    },
    {
      id: 'departments',
      label: 'Departments',
      content: <DepartmentManagement departments={departments} />,
    },
    {
      id: 'masters',
      label: 'Masters',
      content: <MasterDataManager masters={masters} onRefresh={fetchData} />,
    },
    {
      id: 'configuration',
      label: 'Configuration',
      content: <ConfigurationPanel configs={configs} onRefresh={fetchData} />,
    },
  ];

  return (
    <PageContainer>
      <div style={{ borderBottom: '1px solid var(--color-border-default)', paddingBottom: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
        <h2 style={{ font: 'var(--type-heading-page)', margin: 0 }}>Laboratory Administration Console</h2>
        <p style={{ margin: '4px 0 0', font: 'var(--type-body-small)', color: 'var(--color-text-secondary)' }}>
          Manage user profiles, role access levels, master catalog reference databases, and system properties.
        </p>
      </div>

      <AdminDashboard users={users} departments={departments} masters={masters} />

      <Card style={{ marginTop: '12px' }}>
        <Tabs items={tabItems} />
      </Card>
    </PageContainer>
  );
};

export default AdminPage;
